'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isNil } from 'lodash';
import { RichEmbed } from 'discord.js';

export class HelpHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    let response = '';
    switch (cmd.dataValues.name) {
      case 'help': {
        const keyword = await this.getData(cmd, 'body');
        const command = this.options.commandList.find((command) => command.name === keyword);
        if (isNil(command)) {
          response = `Couldn't find help, command \`${keyword}\` does not exist.`;
          break;
        }

        response = new RichEmbed({
          title: `Help for command "${keyword}":`,
          color: 0xFF6F61,
          description: `**Usage:** ${command.usage}\n**Description:** ${command.description}`
        });
        break;
      }

      case 'commands': {
        const queryer = await this.client.fetchUser(message.dataValues.author);
        const dmChannel = queryer.dmChannel ? queryer.dmChannel : await queryer.createDM();
        const embed = new RichEmbed({
          title: `List of available bot commands`,
          color: 0xFF6F61,
          fields: this.options.commandList.map((commandInfo) => {
            return {
              name: `**${commandInfo.name}**`,
              value: `**Usage:** ${commandInfo.usage}\n**Description:** ${commandInfo.description}`
            }
          })
        });

        await dmChannel.send('This is a list of available commands:', embed);
        response = 'Sent a list of commands in DM.';
        break;
      }
    }

    return await this.replyToChannel(channel, response);
  }
}