import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getSecretKey() {
  const secret = process.env.ENCRYPTION_KEY;

  if (!secret) {
    throw new Error('ENCRYPTION_KEY is not configured');
  }

  const key = Buffer.from(secret, 'utf8');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes');
  }

  return key;
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText) {
  const [ivHex, authTagHex, encryptedHex] = String(encryptedText || '').split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Encrypted token format is invalid');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getSecretKey(),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}
