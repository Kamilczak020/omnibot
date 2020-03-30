'use strict';
import fuzzyset from 'fuzzyset.js';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { Warning } from '../model/warning';
import { isNil } from 'lodash';
import { RichEmbed } from 'discord.js';

export class UserActionHandler extends BaseHandler {
  async handle(cmd) {
    const command = cmd.dataValues.name;
    const body = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId } });
    const channel = message.dataValues.channel;

    const target = body.split(' ')[0];

    try {
      await this.getUserFromTarget(target, message.dataValues.guild, channel);
    } catch (error) {
      this.logger.debug(error);
    }

    return;

    const userRegex = /<@\!?(\d*)>/g;
    const confessionRegex = /[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/i;
    const matchedUser = userRegex.exec(body.split(' ')[0]);
    const matchedConfession = confessionRegex.exec(body.split(' ')[0]);
    if (isNil(matchedUser) && isNil(matchedConfession)) {
      return await this.replyToChannel(channel, 'User / Confession was not found.');
    }

    const potentialUser = matchedUser ? this.client.users.find((user) => user.id === matchedUser[1]) : null;
    const potentialConfession = matchedConfession ? this.store.confessions.find((confession) => confession.id === matchedConfession[0]) : null;
    if (isNil(potentialUser) && isNil(potentialConfession)) {
      return await this.replyToChannel(channel, 'User / Confession was not found.');
    }

    const isConfession = !isNil(potentialConfession);
    const user = potentialUser ? potentialUser : this.client.users.find((user) => user.id === potentialConfession.author);
    const guild = this.client.guilds.find((guild) => guild.id === message.dataValues.guild);
    const member = await guild.fetchMember(user);
    const muteRole = guild.roles.find((guildRole) => guildRole.id === this.options.muteRole);

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

      case 'mute': {
        if (isConfession) {
          response = 'Cannot mute a confession submitter.';
          break;
        }

        member.setMute(true, 'You have violated the law!');
        await member.addRole(muteRole);
        response = 'User has been muted.';
        break;
      }

      case 'unmute': {
        if (isConfession) {
          response = 'Cannot unmute a confession submitter.';
          break;
        }

        member.setMute(false, 'Thy sins have been excused!');
        await member.removeRole(muteRole);
        response = 'User has been unmuted.';
        break;
      }

      case 'warn': {
        const warningCount = await Warning.count({ where: { 'member': user.id } });
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
        if (isConfession) {
          response = 'Cannot list warnings using ConfessionID.';
          break;
        }

        const warnings = await Warning.findAll({ where: { 'member': user.id } });
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

  async getUserFromTarget(target, guildId, channel) {
    const isTargetUserId = /^[0-9]*$/.test(target);
    if (isTargetUserId) {
      const user = await this.client.fetchUser(target);
      return await this.replyToChannel(channel, `The princess you are looking for is ${user.username}`);
    }

    const confessionRegex = /[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/i;
    const isTargetConfessionId = confessionRegex.test(target);
    if (isTargetConfessionId) {
      const confession = this.store.confessions.find((confession) => confession.id = target);
      return await this.replyToChannel(channel, 'Nuh uh. Confessions disabled for testing.');
    }

    // Name matching only works for guild members!
    const guild = this.client.guilds.find((guild) => guild.id === guildId);
    const usernames = guild.members.map((member) => member.user.username).filter((x) => !isNil(x));
    const nicknames = guild.members.map((member) => member.nickname).filter((x) => !isNil(x));

    const userset = fuzzyset([...usernames, ...nicknames], true);
    const matches = userset.get(target);

    if (matches.length === 0) {
      return await this.replyToChannel(channel, 'No matches found.');
    }

    const embed = new RichEmbed({
      title: `Matched Usernames/Nicknames`,
      color: 0xFF6F61,
      fields: matches.map((match) => ({
        name: `Levenshtein Distance: ${match[0]}`,
        value: match[1],
      }))
    });

    return await this.replyToChannel(channel, embed);
  }
}
