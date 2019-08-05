'use strict';
import { BaseService } from '../core/baseService';
import { RichEmbed } from 'discord.js';
import { format } from 'date-fns';

export class UserFeedWatcher extends BaseService {
  async handleFeed(guildMember, action) {
    switch (action) {
      case 'join': {
        const channel = guildMember.guild.channels.find((channel) => channel.id === this.options.channels.join);
        const embed = new RichEmbed({
          title: `**${guildMember.user.username}#${guildMember.user.tag}**`,
          color: 0xFF6F61,
          description: `**UserID:** ${guildMember.user.id}\n**Action:** Join\n**Date:** ${format(new Date(), 'DD MMM YYYY')}`
        });

        return await channel.send(embed);
      }

      case 'leave': {
        const channel = guildMember.guild.channels.find((channel) => channel.id === this.options.channels.leave);
        const embed = new RichEmbed({
          title: `**${guildMember.user.username}#${guildMember.user.tag}**`,
          color: 0xFF6F61,
          description: `**UserID:** ${guildMember.user.id}\n**Action:** Leave\n**Date:** ${format(new Date(), 'DD MMM YYYY')}`
        });

        return await channel.send(embed);
      }
    }
  }
}