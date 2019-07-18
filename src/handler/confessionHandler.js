'use strict';
import { BaseService } from '../core/baseService';
import { isNil, isEmpty } from 'lodash';
import { RichEmbed } from 'discord.js';
import { v4 as uuid } from 'uuid';


export class ConfessionHandler extends BaseService {
  constructor(client, logger, options) {
    super(client, logger, options);

    this.confessions = [];
  }

  async check(msg) {
    if (msg.dataValues.guild !== '0') return false;

    const guild = this.client.guilds.find((guild) => guild.id === this.options.guild);
    if (isNil(guild)) return false;

    const user = await this.client.fetchUser(msg.dataValues.author);
    const member = await guild.fetchMember(user);
    if (isNil(member)) return false;

    const command = msg.dataValues.body.split(' ')[0];
    if (command !== this.options.command) return false;

    return true;
  }
  
  async handle(msg) {
    const channel = msg.dataValues.channel;
    const [, ...bodyparts] = msg.dataValues.body.split(' ');
    const body = bodyparts.join(' ');
    if (isEmpty(body) || isNil(body)) {
      return await this.replyToChannel(channel, 'Confession message is required.');
    }

    const confession = { id: uuid(), author: msg.dataValues.author };
    this.confessions.push(confession);

    const embed = new RichEmbed({
      title: `Confession ID: ${confession.id}`,
      color: 0xFF6F61,
      description: body
    });

    const guild = this.client.guilds.find((guild) => guild.id === this.options.guild);
    const confessionsChannel = guild.channels.find((guildChannel) => guildChannel.id === this.options.channel);

    await confessionsChannel.send(embed);
    return await this.client.channels.get(channel).send(`Confession with ID "${confession.id}" has been submitted.`);
  }
}
