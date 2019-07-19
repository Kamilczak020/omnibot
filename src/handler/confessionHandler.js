'use strict';
import { BaseService } from '../core/baseService';
import { isNil, isEmpty } from 'lodash';
import { RichEmbed } from 'discord.js';
import { v4 as uuid } from 'uuid';
import { differenceInSeconds, format } from 'date-fns';


export class ConfessionHandler extends BaseService {
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

    const userConfessions = this.store.confessions.filter((confession) => confession.author === msg.dataValues.author);
    const throttleConfessions = userConfessions.filter((confession) => differenceInSeconds(Date.now(), confession.time) < this.options.throttle);
    if (!isEmpty(throttleConfessions)) {
      const lastConfession = throttleConfessions.sort((a, b) => b.time - a.time).pop();
      const timeDiff = differenceInSeconds(Date.now(), lastConfession.time);
      return await this.replyToChannel(channel, `Limit of 1 confession per ${this.options.throttle} seconds. Time left: ${120 - timeDiff} seconds.`);
    }

    const confession = { id: uuid(), author: msg.dataValues.author, time: Date.now() };
    this.store.confessions.push(confession);

    const embed = new RichEmbed({
      title: `Confession ID: ${confession.id}`,
      color: 0xFF6F61,
      description: body
    });

    const guild = this.client.guilds.find((guild) => guild.id === this.options.guild);
    const confessionsChannel = guild.channels.find((guildChannel) => guildChannel.id === this.options.channel);

    await confessionsChannel.send(embed);
    return await this.replyToChannel(channel, `Confession with ID "${confession.id}" has been submitted.`);
  }

  async replyToChannel(channel, message) {
    await this.client.channels.get(channel).send(message);
  }
}
