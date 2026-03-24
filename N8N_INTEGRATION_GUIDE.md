# Cara Menggunakan Google API dari n8n

Setelah login dengan Google OAuth di aplikasi, kamu bisa menggunakan Google Sheets, Drive, dan Calendar dari n8n workflow tanpa perlu setup credential manual.

## Langkah 1: Dapatkan User ID

1. Login ke aplikasi dengan Google OAuth
2. Buka browser console atau Postman
3. GET ke `http://localhost:3001/api/auth/google/status` (dengan session cookie)
4. Catat `userId` dari response

## Langkah 2: Setup Workflow di n8n

### Contoh 1: Append Data ke Google Sheets

1. Buat workflow baru di n8n
2. Tambahkan node **HTTP Request**
3. Konfigurasi:
   - **Method**: POST
   - **URL**: `http://localhost:3001/api/google/sheets/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1`
   - **Authentication**: None
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body**:
     ```json
     {
       "userId": "YOUR_USER_ID",
       "values": [
         ["Nama", "Email", "Tanggal"],
         ["John Doe", "john@example.com", "2024-01-20"]
       ]
     }
     ```

### Contoh 2: Read Data dari Google Sheets

1. Tambahkan node **HTTP Request**
2. Konfigurasi:
   - **Method**: GET
   - **URL**: `http://localhost:3001/api/google/sheets/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1:C10?userId=YOUR_USER_ID`
   - **Authentication**: None

### Contoh 3: Update Data di Google Sheets

1. Tambahkan node **HTTP Request**
2. Konfigurasi:
   - **Method**: PUT
   - **URL**: `http://localhost:3001/api/google/sheets/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body**:
     ```json
     {
       "userId": "YOUR_USER_ID",
       "values": [
         ["Updated Value"]
       ]
     }
     ```

### Contoh 4: List Google Drive Files

1. Tambahkan node **HTTP Request**
2. Konfigurasi:
   - **Method**: GET
   - **URL**: `http://localhost:3001/api/google/drive/files?userId=YOUR_USER_ID&q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=20`

### Contoh 5: Get Google Calendar Events

1. Tambahkan node **HTTP Request**
2. Konfigurasi:
   - **Method**: GET
   - **URL**: `http://localhost:3001/api/google/calendar/events?userId=YOUR_USER_ID&maxResults=10`

## Keamanan untuk Production

Untuk production, tambahkan authentication:

1. **Option 1: Gunakan n8n API Key**
   - Tambahkan header `X-N8N-API-KEY: YOUR_N8N_API_KEY` di setiap request
   - Backend akan verify API key

2. **Option 2: Gunakan JWT Token**
   - User login dapat JWT token
   - Kirim token di header `Authorization: Bearer YOUR_JWT_TOKEN`

## Spreadsheet ID

Cara mendapatkan Spreadsheet ID:
- Buka Google Sheets
- Lihat URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- Copy bagian `SPREADSHEET_ID`

## Range Format

Format range mengikuti Google Sheets notation:
- `Sheet1!A1` - Single cell
- `Sheet1!A1:C10` - Range dari A1 sampai C10
- `Sheet1!A:A` - Seluruh kolom A
- `Sheet1!1:1` - Seluruh baris 1

## Troubleshooting

### Error: "No Google tokens found for user"
- User belum login dengan Google OAuth
- Atau token sudah expired dan perlu login ulang

### Error: "Unauthorized"
- userId tidak valid
- Atau session expired

### Error: "The caller does not have permission"
- Spreadsheet tidak di-share dengan email Google yang login
- Atau scope OAuth tidak mencakup akses yang diminta
