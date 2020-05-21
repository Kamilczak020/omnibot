'use strict';
import { BaseParser } from './baseParser';
import { mustExist } from '../util';
import { Command } from '../model/command';
import { CommandData } from '../model/commandData';

export class EchoParser extends BaseParser {
  async parse(msg) {
    this.logger.info({ msg }, 'Parsing message..');

    const cmd = mustExist(this.stripPrefix(msg.dataValues.body.split(' ')[0]));
    const body = mustExist(msg.dataValues.body.split(' ').slice(1).join(' '));

    const command = new Command({
      name: cmd,
      MessageId: msg.dataValues.id
    });
    await command.save();

    const commandData = new CommandData({
      key: 'body',
      value: body,
      CommandId: command.dataValues.id
    });
    await commandData.save();
    
    this.logger.info({ msg }, 'Message parsed!');

    return command;
  }
}
