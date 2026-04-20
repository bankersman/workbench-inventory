import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getRoot', () => {
    it('returns API label', () => {
      expect(appController.getRoot()).toBe('Workbench Inventory API');
    });
  });

  describe('getHealth', () => {
    it('returns ok and semver from package.json', () => {
      const body = appController.getHealth();
      expect(body.ok).toBe(true);
      expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
