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
    const guild = this.client.guilds.find((guild) => guild.id === message.dataValues.guild);

    // Gets us anything before "", which should be a start of a message (in case of warning).
    // Potential pitfall is when a user has " in their username.
    const target = /[^"]*/.exec(body)[0].trim();
    const user = await this.getUserFromTarget(target, guild);

    if (isNil(user)) {
      return await this.replyToChannel(channel, 'User / Confession was not found. Please check or narrow down your expression.');
    }

    const confessionRegex = /[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/i;
    const isTargetConfessionId = confessionRegex.test(target);

    const muteRole = guild.roles.find((guildRole) => guildRole.id === this.options.muteRole);
    const member = await guild.fetchMember(user);

    let response;
    switch (command) {
      case 'kick': {
        if (!isNil(member) && member.kickable) {
          await member.kick();
          response = 'Badaboing! User kicked successfully.';
          break;
        }

        response = 'User cannot be kicked.';
        break;
      }

      case 'ban': {
        if (!isNil(member) && member.bannable) {
          await member.ban();
          response = 'Boom! User banned successfully.';
          break;
        }

        response = 'User cannot be banned.';
        break;
      }

      case 'mute': {
        if (isNil(member) || isTargetConfessionId) {
          response = 'Cannot mute a confession submitter.';
          break;
        }

        member.setMute(true, 'You have violated the law!');
        await member.addRole(muteRole);
        response = 'User has been muted.';
        break;
      }

      case 'unmute': {
        if (isNil(member) || isTargetConfessionId) {
          response = 'Cannot unmute a confession submitter.';
          break;
        }

        member.setMute(false, 'Thy sins have been excused!');
        await member.removeRole(muteRole);
        response = 'User has been unmuted.';
        break;
      }

      case 'warn': {
        if (isNil(member)) {
          response = 'User is not a guild member.';
          break;
        }

        const warningCount = await Warning.count({ where: { 'member': user.id } });
        const warningRegex = /".*"/;
        const warningMessage = warningRegex.exec(body)[0].trim();
        const warning = new Warning({ member: user.id, message: warningMessage });
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
    }

    return await this.replyToChannel(channel, response);
  }

  async getUserFromTarget(target, guild) {
    const isTargetUserId = /^[0-9]*$/.test(target);
    if (isTargetUserId) {
      return await this.client.fetchUser(target);
    }

    const confessionRegex = /[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/i;
    const isTargetConfessionId = confessionRegex.test(target);
    if (isTargetConfessionId) {
      const confession = this.store.confessions.find((confession) => confession.id = target);
      return await this.client.fetchUser(confession.author);
    }

    // Name matching only works for guild members!
    const usernames = guild.members.map((member) => member.user.username).filter((x) => !isNil(x));
    const nicknames = guild.members.map((member) => member.nickname).filter((x) => !isNil(x));
    const userset = fuzzyset([...usernames, ...nicknames], true);
    const matches = userset.get(target).map((match) => ({ score: match[0], name: match[1] }));

    if (matches.length === 0) {
      return;
    }

    if (matches.length === 1) {
      return guild.members.find((x) => x.nickname === matches[0].name || x.user.username === matches[0].name).user;
    }

    // 0.7 was found to be a decent matching treshold when unsing levenshtein disance fuzzy matching.
    // Might need readjustment in the future, but seems fine on a wide array of tested values.
    if (matches[0].score < 0.7) {
      return;
    }

    // First two matches can both be for the same user. Make sure to disregard that in match closeness comparison.
    // Since both top matches are for the same user, we can disregard the case of a 'accidental mismatch' and just
    // assume the correct user was selected.
    const userA = guild.members.find((x) => x.nickname === matches[0].name || x.user.username === matches[0].name).user;
    const userB = guild.members.find((x) => x.nickname === matches[1].name || x.user.username === matches[1].name).user;

    if (userA.id === userB.id) {
      return userA;
    }

    if (matches[0].score - matches[1].score > 0.07) {
      return userA;
    }
  }
}
