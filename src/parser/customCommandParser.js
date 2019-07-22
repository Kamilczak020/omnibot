'use strict';
import { BaseParser } from './baseParser';
import { mustExist } from '../util';
import { Command } from '../model/command';
import { CustomCommand } from '../model/customCommand';
import { CommandData } from '../model/commandData';
import { isNil } from 'lodash';

export class CustomCommandParser extends BaseParser {
  async check(msg) {
    const cmd = mustExist(msg.dataValues.body.split(' ')[0]);
    this.logger.debug('command parsed:', cmd);

    const matchedCommand = await CustomCommand.findOne({ where: { name: this.stripPrefix(cmd) }});
    return cmd.startsWith(this.options.prefix) && !isNil(matchedCommand);
  }

  async parse(msg) {
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
    
    return command;
  }
}
