'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isEmpty } from 'lodash';
import { RichEmbed } from 'discord.js';

export class NicknameHandler extends BaseHandler {
  async handle(cmd) {
    const nickname = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    if (isEmpty(nickname)) {
      return await this.replyToChannel(channel, 'Cannot set an empty nickname.');
    }

    const guild = this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    const user = await this.client.fetchUser(message.dataValues.author);
    const guildMember = await guild.fetchMember(user);
    const feedChannel = guildMember.guild.channels.find((channel) => channel.id === this.options.channel);

    try {
      await guildMember.setNickname(nickname);

      const embed = new RichEmbed({
        title: `**${guildMember.user.username}#${guildMember.user.tag}**`,
        color: 0xFF6F61,
        description: `**Nickname:** ${nickname}`
      });

      await this.replyToChannel(feedChannel, embed);
      return await this.replyToChannel(channel, 'Your nickname has been set!');
    } catch (error) {
      console.log(error);
      await this.replyToChannel(channel, 'Something went wrong.');
    }
  }
}
