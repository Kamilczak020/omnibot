'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isNil } from 'lodash';

export class AnnouncementHandler extends BaseHandler {
  async handle(cmd) {
    const body = await this.getData(cmd, 'body');
    const type = body.split(' ')[0];
    const announcement = body.split(' ').slice(1).join(' ');
    if (isNil(announcement) || announcement === '') {
      return await this.replyToChannel(channel, `Cannot post an empty announcement.`);
    }

    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const announcementGroup = this.options.groups.find((group) => group.type === type);
    if (isNil(announcementGroup)) {
      return await this.replyToChannel(channel, `Couldn't post an announcement, type \`${type}\` does not exist.`);
    }

    const guild = await this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    const role = guild.roles.find((role) => role.id === announcementGroup.role);
    if (isNil(role)) {
      return await this.replyToChannel(channel, `Role specified in config does not exist.`);
    }

    const announcementChannel = guild.channels.find((channel) => channel.id === announcementGroup.channel).id;
    if (isNil(announcementChannel)) {
      return await this.replyToChannel(channel, `Channel specified in config does not exist.`);
    }

    await role.setMentionable(true);
    await this.replyToChannel(announcementChannel, `<@&${role.id}> ` + announcement);
    await role.setMentionable(false);
  }
}