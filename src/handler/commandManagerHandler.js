'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { CustomCommand } from '../model/customCommand';
import { isNil } from 'lodash';
import { RichEmbed } from 'discord.js';

export class CommandManagerHandler extends BaseHandler {
  async handle(cmd) {
    const msgBody = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    const currentCommand = cmd.dataValues.name;
    const [commandToManage, ...dataparts] = msgBody.split(' ');
    const data = dataparts.join(' ');

    if (isNil(commandToManage)) {
      return await this.replyToChannel(channel, 'Command name is required.');
    }

    switch (currentCommand) {
      case 'addcommand': {
        if (isNil(data)) {
          return await this.replyToChannel(channel, 'Command data is required');
        }

        const matchedCommand = await CustomCommand.findOne({ where: { name: commandToManage }});
        if (!isNil(matchedCommand)) {
          await this.replyToChannel(channel, `Command ${commandToManage} already exists.`);
          return;
        }

        const commandToCreate = new CustomCommand({
          name: commandToManage,
          body: data
        });
        await commandToCreate.save();
        return await this.replyToChannel(channel, `Command ${commandToManage} created.`);
      }

      case 'customcommands': {
        const customCommands = await CustomCommand.findAll();
        const queryer = await this.client.fetchUser(message.dataValues.author);
        const dmChannel = queryer.dmChannel ? queryer.dmChannel : await queryer.createDM();
        const embed = new RichEmbed({
          title: `List of available custom commands:`,
          color: 0xFF6F61,
          fields: customCommands.map((customCommand) => {
            return {
              name: `**${customCommand.dataValues.name}**`,
              value: `**Command data: **: ${customCommand.dataValues.body}`
            }
          })
        });

        await dmChannel.send('This is a list of available commands:', embed);
        return await this.replyToChannel(channel, `Sent a list of custom commands in DM.`);
      }

      case 'removecommand': {
        const matchedCommand = await CustomCommand.findOne({ where: { name: commandToManage }});
        if (isNil(matchedCommand)) {
          await this.replyToChannel(channel, `Command ${commandToManage} is not a custom command.`);
          return;
        }

        await matchedCommand.destroy();
        return await this.replyToChannel(channel, `Command ${commandToManage} deleted.`);
      }
    }
  }
}
