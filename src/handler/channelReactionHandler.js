'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';

export class ChannelReactionHandler extends BaseHandler {
  async handle(cmd) {
    console.log(cmd);
    this.options.channelReactionGroups.forEach(async (reactionGroup) => {
      const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});

      if (message.dataValues.channel === reactionGroup.channel) {
        const guild = this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
        const channel = guild.channels.find((channel) => channel.id === message.dataValues.channel);
        const discordMessage = await channel.fetchMessage(message.dataValues.id);

        reactionGroup.emojis.forEach(async (emoji, index) => {
          await setTimeout(() => discordMessage.react(emoji), 1000 * index);
        });
      }
    });
  }
}

