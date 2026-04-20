import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly packageVersion: string;

  constructor() {
    const path = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(path, 'utf-8')) as { version: string };
    this.packageVersion = pkg.version;
  }

  getRootMessage(): string {
    return 'Workbench Inventory API';
  }

  getAppVersion(): string {
    return this.packageVersion;
  }
}
