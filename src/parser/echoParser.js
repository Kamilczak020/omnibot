'use strict';
import { BaseParser } from './baseParser';
import { mustExist } from '../util';
import { Command } from '../model/command';
import { CommandData } from '../model/commandData';

export class EchoParser extends BaseParser {
  async parse(msg) {
    const cmd = mustExist(this.stripPrefix(msg.dataValues.body.split(' ')[0]));
    const body = mustExist(msg.dataValues.body.split(' ').slice(1).join(' '));

    const command = await new Command({
      name: cmd,
      MessageId: msg.dataValues.id
    });
    await command.save();

    const commandData = await new CommandData({
      key: 'body',
      value: body,
      CommandId: command.dataValues.id
    });
    await commandData.save();
    
    return command;
  }
}
