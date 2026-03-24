import axios from 'axios';

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_URL || !N8N_API_KEY) {
  console.warn('⚠️  N8N_API_URL or N8N_API_KEY not configured');
}

/**
 * Create a new credential in n8n
 */
export async function createN8nCredential({ email, accessToken, refreshToken }) {
  try {
    console.log('📤 Creating n8n credential for:', email);
    console.log('🔗 N8N API URL:', N8N_API_URL);
    console.log('🔑 Has API Key:', !!N8N_API_KEY);
    console.log('🎫 Has Access Token:', !!accessToken);
    console.log('🎫 Has Refresh Token:', !!refreshToken);

    // If no refresh token, we can't create a persistent credential
    if (!refreshToken) {
      console.warn('⚠️  No refresh token available - credential will expire');
    }

    // Try different payload structures based on n8n version/configuration
    const payloads = [
      // Structure 1: Full OAuth2 with client credentials
      {
        name: `Google Sheets - ${email}`,
        type: 'googleSheetsOAuth2Api',
        data: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          oauthTokenData: {
            access_token: accessToken,
            refresh_token: refreshToken || '',
            token_type: 'Bearer',
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly',
            expiry_date: Date.now() + 3599 * 1000
          }
        }
      },
      // Structure 2: OAuth2 with stringified token data
      {
        name: `Google Sheets - ${email}`,
        type: 'googleSheetsOAuth2Api',
        data: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          oauthTokenData: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken || '',
            token_type: 'Bearer',
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly',
            expiry_date: Date.now() + 3599 * 1000
          })
        }
      }
    ];

    let lastError;
    for (let i = 0; i < payloads.length; i++) {
      try {
        console.log(`🔄 Trying payload structure ${i + 1}...`);
        console.log('📦 Payload:', JSON.stringify(payloads[i], null, 2));

        const response = await axios.post(
          `${N8N_API_URL}/credentials`,
          payloads[i],
          {
            headers: {
              'Content-Type': 'application/json',
              'X-N8N-API-KEY': N8N_API_KEY
            }
          }
        );

        console.log(`✅ Created n8n credential for ${email}: ${response.data.id}`);
        return response.data.id;
      } catch (err) {
        console.log(`❌ Structure ${i + 1} failed:`, err.response?.data?.message || err.message);
        lastError = err;
      }
    }

    // If all structures failed, throw the last error
    throw lastError;
  } catch (error) {
    console.error('❌ Error creating n8n credential:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('Failed to create n8n credential');
  }
}

/**
 * Update an existing credential in n8n
 */
export async function updateN8nCredential(credentialId, { accessToken, refreshToken }) {
  try {
    const payload = {
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        oauthTokenData: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3599,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          token_type: 'Bearer'
        }
      }
    };

    await axios.patch(
      `${N8N_API_URL}/credentials/${credentialId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_API_KEY
        }
      }
    );

    console.log(`✅ Updated n8n credential: ${credentialId}`);
  } catch (error) {
    console.error('❌ Error updating n8n credential:', error.response?.data || error.message);
    throw new Error('Failed to update n8n credential');
  }
}

/**
 * Delete a credential from n8n
 */
export async function deleteN8nCredential(credentialId) {
  try {
    await axios.delete(
      `${N8N_API_URL}/credentials/${credentialId}`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY
        }
      }
    );

    console.log(`✅ Deleted n8n credential: ${credentialId}`);
  } catch (error) {
    console.error('❌ Error deleting n8n credential:', error.response?.data || error.message);
    // Don't throw error, just log it
  }
}

/**
 * Get credential details from n8n
 */
export async function getN8nCredential(credentialId) {
  try {
    const response = await axios.get(
      `${N8N_API_URL}/credentials/${credentialId}`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error getting n8n credential:', error.response?.data || error.message);
    throw new Error('Failed to get n8n credential');
  }
}
