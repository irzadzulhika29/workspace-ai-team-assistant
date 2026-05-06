import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceEnvPath = path.resolve(__dirname, '..', '..', '.env');
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '.env');

dotenv.config({
  path: existsSync(workspaceEnvPath) ? workspaceEnvPath : rootEnvPath,
});
