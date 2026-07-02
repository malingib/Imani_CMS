import { execSync } from 'node:child_process';
import { FullConfig } from '@playwright/test';

export default function globalSetup(_config: FullConfig) {
  execSync('php artisan migrate:fresh --seed --force', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, E2E: 'true' },
  });
}
