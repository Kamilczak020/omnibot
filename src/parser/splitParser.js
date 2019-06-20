'use strict';
import { BaseParser } from './baseParser';
import { mustExist } from '../util';
import { Command } from '../model/command';
import { CommandData } from '../model/commandData';

export class SplitParser extends BaseParser {
  async parse(msg) {
    const cmd = mustExist(this.stripPrefix(msg.dataValues.body.split(' ')[0]));
    const args = mustExist(msg.dataValues.body.split(' ').slice(1));

    const command = await new Command({
      name: cmd,
      MessageId: msg.dataValues.id
    });
    await command.save();

    args.forEach(async (arg) => {
      const commandData = await new CommandData({
        key: 'body',
        value: arg,
        CommandId: command.dataValues.id
      });
      await commandData.save();
    });

    return command;
  }
}
