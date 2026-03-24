import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Test tokens (you'll need to replace these with real ones from a login)
const TEST_ACCESS_TOKEN = 'ya29.test';
const TEST_REFRESH_TOKEN = '1//0gtest';

const payloads = [
  {
    name: 'Test 1: Minimal with clientId/Secret',
    payload: {
      name: 'Google Sheets Test 1',
      type: 'googleSheetsOAuth2Api',
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }
    }
  },
  {
    name: 'Test 2: With oauthTokenData as object',
    payload: {
      name: 'Google Sheets Test 2',
      type: 'googleSheetsOAuth2Api',
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        oauthTokenData: {
          access_token: TEST_ACCESS_TOKEN,
          refresh_token: TEST_REFRESH_TOKEN,
          token_type: 'Bearer',
          expiry_date: Date.now() + 3599 * 1000
        }
      }
    }
  },
  {
    name: 'Test 3: With oauthTokenData as string',
    payload: {
      name: 'Google Sheets Test 3',
      type: 'googleSheetsOAuth2Api',
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        oauthTokenData: JSON.stringify({
          access_token: TEST_ACCESS_TOKEN,
          refresh_token: TEST_REFRESH_TOKEN,
          token_type: 'Bearer',
          expiry_date: Date.now() + 3599 * 1000
        })
      }
    }
  },
  {
    name: 'Test 4: Google OAuth2 generic format',
    payload: {
      name: 'Google Sheets Test 4',
      type: 'googleOAuth2Api',
      data: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        oauthTokenData: {
          access_token: TEST_ACCESS_TOKEN,
          refresh_token: TEST_REFRESH_TOKEN,
          token_type: 'Bearer',
          expiry_date: Date.now() + 3599 * 1000
        }
      }
    }
  }
];

async function testPayload(test) {
  try {
    console.log(`\n🧪 ${test.name}`);
    console.log('📦 Payload:', JSON.stringify(test.payload, null, 2));
    
    const response = await axios.post(
      `${N8N_API_URL}/credentials`,
      test.payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_API_KEY
        }
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing n8n credential creation...\n');
  console.log('N8N_API_URL:', N8N_API_URL);
  console.log('Has API Key:', !!N8N_API_KEY);
  
  for (const test of payloads) {
    const success = await testPayload(test);
    if (success) {
      console.log('\n🎉 Found working format!');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
}

runTests();
