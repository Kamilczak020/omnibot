'use strict';
import { BaseParser } from './baseParser';
import { mustExist } from '../util';
import { Command } from '../model/command';
import { CommandData } from '../model/commandData';

export class BypassParser extends BaseParser {
  async check(msg) {
    return true;
  }

  async parse(msg) {
    const cmd = 'none';
    const body = mustExist(msg.dataValues.body);

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