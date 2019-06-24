'use strict';
import { BaseService } from '../core/baseService';

export class ChannelReactionWatcher extends BaseService {
  async react(msg) {
    this.options.channelReactionGroups.forEach(async (reactionGroup) => {
      if (msg.dataValues.channel === reactionGroup.channel) {
        const guild = this.client.guilds.find((guild) => guild.id === msg.dataValues.guild);
        const channel = guild.channels.find((channel) => channel.id === msg.dataValues.channel);
        const discordMessage = await channel.fetchMessage(msg.dataValues.id);

        reactionGroup.emojis.forEach(async (emoji, index) => {
          await setTimeout(() => discordMessage.react(emoji), 1000 * index);
        });
      }
    });
  }
}

