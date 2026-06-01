import axios from 'axios';
import { urls } from './api';
import { supabaseClient } from './supabaseClient';

const backendUrl = urls.getBackendUrl();

const getLoginRedirectUrl = () => {
  const configuredUrl = String(import.meta.env.VITE_FRONTEND_URL || '').trim();
  const baseUrl = configuredUrl || window.location.origin;
  return `${baseUrl.replace(/\/$/, '')}/login`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error || error?.message || fallback;

export const fetchAuthStatus = async () => {
  const response = await axios.get(`${backendUrl}/api/auth/status`, {
    withCredentials: true,
  });
  return response.data;
};

export const getAuthenticatedUser = async () => {
  const status = await fetchAuthStatus();
  return status?.authenticated ? status.user : null;
};

export const exchangeSupabaseSession = async (session) => {
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('Supabase session is missing an access token.');
  }

  const response = await axios.post(
    `${backendUrl}/api/auth/session/supabase`,
    { accessToken },
    { withCredentials: true },
  );

  return response.data;
};

export const signInWithEmailPassword = async ({ email, password }) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  await exchangeSupabaseSession(data.session);
  return data;
};

export const signUpWithEmailPassword = async ({ name, email, password }) => {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: getLoginRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const verifySignupOtp = async ({ email, token }) => {
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error('Verification completed without a session.');
  }

  await exchangeSupabaseSession(data.session);
  return data;
};

export const resendSignupOtp = async (email) => {
  const { error } = await supabaseClient.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const logoutWorkspace = async () => {
  try {
    await axios.post(
      `${backendUrl}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  } finally {
    await supabaseClient.auth.signOut();
  }
};

export const preparePasswordSetup = async () => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/auth/password/setup`,
      {},
      { withCredentials: true },
    );

    const email = response.data?.email;
    if (!email) {
      throw new Error('Email akun tidak ditemukan.');
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { email };
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Gagal memulai setup password.'));
  }
};

export const completePasswordSetup = async ({ email, token, password }) => {
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    throw new Error(error.message);
  }

  const updateResult = await supabaseClient.auth.updateUser({ password });
  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  await supabaseClient.auth.signOut();
  return data;
};
