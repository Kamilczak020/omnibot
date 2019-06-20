'use strict';
import sinon from 'sinon';
import { expect } from 'chai';
import { CommandMock } from '../model/command.test';
import { BaseHandler } from '../../src/handler/baseHandler';
import { Client } from 'discord.js';

const discordClient = sinon.createStubInstance(Client);
const logger = sinon.stub();
logger.debug = sinon.stub();

const options = {
  commands: ['test1', 'test2']
}

const firstCommand = CommandMock.build({ name: 'test1' });
const secondCommand = CommandMock.build({ name: 'test2' });
const thirdCommand = CommandMock.build({ name: 'test3' });

const handler = new BaseHandler(discordClient, logger, options);
describe('Base handler', () => {
  it('Should return true if the command check matches the handler', async () => {
    const firstResult = await handler.check(firstCommand);
    const secondResult = await handler.check(secondCommand);
    expect(firstResult && secondResult).to.be.true; 
  });

  it('Should return false if the command check fails', async () =>  {
    const thirdResult = await handler.check(thirdCommand);
    expect(thirdResult).to.be.false;
  });
});
