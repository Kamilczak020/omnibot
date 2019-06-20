'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isNil } from 'lodash';

export class UserActionHandler extends BaseHandler {
  async handle(cmd) {
    const command = cmd.dataValues.name;
    const body = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    const regex = /<@(\d*)>/g;
    const matched = await regex.exec(body);
    if (isNil(matched)) {
      return await this.replyToChannel(channel, 'User was not found.');
    }

    const user = await this.client.users.find((user) => user.id === matched[1]);
    if (isNil(user)) {
      return await this.replyToChannel(channel, 'User was not found.');
    }

    const guild = await this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    const member = await guild.fetchMember(user);
    console.log(member);

    let response;
    switch (command) {
      case 'kick': 
        if (!member.kickable) {
          response = 'User cannot be kicked.';
          break;
        }
        await member.kick();
        response = 'User kicked successfully.';
        break;

      case 'ban': 
        if (!member.bannable) {
          response = 'User cannot be banned.';
          break;
        }
        await member.ban();
        response = 'User banned successfully.';
        break;

      case 'mute':
        member.setMute(true, 'You have violated the law!');
        response = 'User has been muted.';
        break;

      case 'unmute': 
        member.setMute(false, 'Thy sins have been excused!');
        response = 'User has been unmuted.';
        break;
    }

    return await this.replyToChannel(channel, response);
  }
}
