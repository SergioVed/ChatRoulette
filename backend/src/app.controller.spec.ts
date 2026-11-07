import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      assert.equal(appController.getHello(), 'Hello World!');
    });
  });
});
