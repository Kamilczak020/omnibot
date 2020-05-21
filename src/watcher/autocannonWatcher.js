'use strict';
import { BaseService } from '../core/baseService';

export class AutocannonWatcher extends BaseService {
  async react(msg) {
    if (this.store.autocannon === false) {
      return;
    }

    if (msg.dataValues.body.toLowerCase().includes(':serioussloth:')) {
      const guild = this.client.guilds.find((guild) => guild.id === msg.dataValues.guild);
      const channel = guild.channels.find((channel) => channel.id === msg.dataValues.channel);
      const discordMessage = await channel.fetchMessage(msg.dataValues.id);

      const emoji = guild.emojis.find((emoji) => emoji.name === 'SeriousSloth');
      await discordMessage.react(emoji);
    }
  }
}
