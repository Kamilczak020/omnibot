'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { RichEmbed } from 'discord.js';

export class StatsHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const guild = this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    
    const embed = new RichEmbed({
      title: `**Alaska Server Stats**`,
      color: 0xFF6F61,
      description: `**Owner:** ${guild.owner.user.username}\n**Region:** ${guild.region}\n**Member count:** ${guild.members.array().length}\n`
    })

    return await this.replyToChannel(channel, embed);
  }
}