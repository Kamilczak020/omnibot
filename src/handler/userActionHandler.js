'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { Warning } from '../model/warning';
import { isNil } from 'lodash';
import { RichEmbed } from 'discord.js';

export class UserActionHandler extends BaseHandler {
  async handle(cmd) {
    const command = cmd.dataValues.name;
    const body = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    const regex = /<@(\d*)>/g;
    const matched = await regex.exec(body.split(' ')[0]);
    if (isNil(matched)) {
      return await this.replyToChannel(channel, 'User was not found.');
    }

    const user = await this.client.users.find((user) => user.id === matched[1]);
    if (isNil(user)) {
      return await this.replyToChannel(channel, 'User was not found.');
    }

    const guild = await this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    const member = await guild.fetchMember(user);

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

      case 'warn': {
        const warningCount = await Warning.count({ where: { 'member': user.id }});
        const warning = await new Warning({ member: user.id, message: body.split(' ').slice(1).join(' ') });
        await warning.save();
        const dmChannel = user.dmChannel ? user.dmChannel : await user.createDM();
        const embed = new RichEmbed({
          title: `Warning #${warningCount + 1} from Alaska Discord Server`,
          color: 0xFF6F61,
          description: `Reason: ${body.split(' ').slice(1).join(' ')}`
        });
        
        await dmChannel.send('**This is a warning!**', embed);
        response = 'User has been warned.';
        break;
      }

      case 'listwarnings': {
        const warnings = await Warning.findAll({ where: { 'member': user.id }});
        const queryer = await this.client.fetchUser(message.dataValues.author);
        const dmChannel = queryer.dmChannel ? queryer.dmChannel : await queryer.createDM();
        const embed = new RichEmbed({
          title: `Warnings for user: ${user.username}`,
          color: 0xFF6F61,
          description: warnings.map((warning) => `[${warning.dataValues.createdAt}]\n${warning.dataValues.message}`).join('\n\n')
        });

        await dmChannel.send('This is a list of warnings.', embed);
        response = 'Sending a list of warnings in DM.';
        break;
      }
    }

    return await this.replyToChannel(channel, response);
  }
}
