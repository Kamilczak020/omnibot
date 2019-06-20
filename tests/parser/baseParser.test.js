'use strict';
import sinon from 'sinon';
import { expect } from 'chai';
import { BaseParser } from '../../src/parser/baseParser';
import { MessageMock } from '../model/message.test';
import { Client } from 'discord.js';

const discordClient = sinon.createStubInstance(Client);
const logger = sinon.stub();
logger.debug = sinon.stub();

const options = {
  prefix: '!',
  commands: ['test1', 'test2']
}

const firstMessage = MessageMock.build({ body: '!test1 example' });
const secondMessage = MessageMock.build({ body: '!test2 example' });
const thirdMessage = MessageMock.build({ body: '!test2' });
const fourthMessage = MessageMock.build({ body: '!test3 example' });


const parser = new BaseParser(discordClient, logger, options);
describe('Base Parser', () => {
  it('Should return true when you have a command name match', async () => {
    const firstResult = await parser.check(firstMessage);
    const secondResult = await parser.check(secondMessage);
    expect(firstResult && secondResult).to.be.true;
  });

  it('Should return true on command match even with no command body', async () => {
    const thirdResult = await parser.check(thirdMessage);
    expect(thirdResult).to.be.true;
  });

  it('Should return false when there is no command match', async () => {
    const fourthResult = await parser.check(fourthMessage);
    expect(fourthResult).to.be.false;
  });

  it('Should return a string stripped from a prefix', () => {
    const result = parser.stripPrefix('!test');
    expect(result).to.be.equal('test');
  });
});
