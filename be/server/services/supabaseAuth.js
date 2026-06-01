import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import prisma from '../lib/prisma.js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const deriveNameFromEmail = (email) => {
  const localPart = normalizeEmail(email).split('@')[0] || 'Workspace User';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Workspace User';
};

export const isGoogleMismatchError = (error) =>
  String(error?.message || '').includes('GOOGLE_EMAIL_MISMATCH');

export const getSupabaseUserFromAccessToken = async (accessToken) => {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new Error(error?.message || 'Invalid Supabase access token');
  }

  return data.user;
};

export const findSupabaseUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(error.message);
    }

    const matchedUser = data?.users?.find(
      (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (!data?.users?.length || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
};

export const ensureSupabasePasswordUser = async ({ email, name }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findSupabaseUserByEmail(normalizedEmail);

  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password: crypto.randomBytes(24).toString('hex'),
    email_confirm: false,
    user_metadata: {
      name: String(name || '').trim() || deriveNameFromEmail(normalizedEmail),
    },
  });

  if (error || !data?.user) {
    throw new Error(error?.message || 'Failed to create Supabase auth user');
  }

  return data.user;
};

export const syncSupabaseMetadataForEmail = async ({ email, name }) => {
  const authUser = await findSupabaseUserByEmail(email);
  if (!authUser) {
    return null;
  }

  const nextName = String(name || '').trim();
  if (nextName && authUser.user_metadata?.name !== nextName) {
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...authUser.user_metadata,
        name: nextName,
      },
    });
  }

  return authUser;
};

export const upsertWorkspaceUserFromSupabase = async (supabaseUser) => {
  const normalizedEmail = normalizeEmail(supabaseUser.email);
  if (!normalizedEmail) {
    throw new Error('Supabase user is missing an email address');
  }

  const profileName =
    String(supabaseUser.user_metadata?.name || '').trim() ||
    deriveNameFromEmail(normalizedEmail);
  const profilePicture =
    supabaseUser.user_metadata?.avatar_url ||
    supabaseUser.user_metadata?.picture ||
    null;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        ...(existingUser.name ? {} : { name: profileName }),
        ...(existingUser.picture ? {} : { picture: profilePicture }),
      },
    });
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: profileName,
      picture: profilePicture,
    },
  });
};

export const getWorkspaceAuthStatus = async (req) => {
  if (!req.user) {
    return {
      authenticated: false,
      user: null,
      hasGoogleToken: false,
      authProvider: null,
      emailVerified: false,
      canUseGoogleFeatures: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { googleToken: true },
  });

  if (!user) {
    return {
      authenticated: false,
      user: null,
      hasGoogleToken: false,
      authProvider: null,
      emailVerified: false,
      canUseGoogleFeatures: false,
    };
  }

  const hasGoogleToken = Boolean(user.googleToken);
  const authProvider = req.session?.authProvider || (user.googleId ? 'google' : 'password');
  const emailVerified =
    req.session?.emailVerified === false ? false : true;

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      jobTitle: user.jobTitle,
      picture: user.picture,
    },
    hasGoogleToken,
    authProvider,
    emailVerified,
    canUseGoogleFeatures: hasGoogleToken,
  };
};

export const clearGoogleLinkSession = (req) => {
  if (!req.session) return;
  delete req.session.googleLinkEmail;
  delete req.session.googleLinkUserId;
};
