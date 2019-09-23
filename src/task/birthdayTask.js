'use strict';
import { BaseTask } from './baseTask';
import { Birthday } from '../model/birthday';
import { differenceInMilliseconds } from 'date-fns';
import { isNil } from 'lodash';
import { Op } from 'sequelize';

const TIMEOUT_MAX = 2147483647;
const ONE_DAY = 86400000;

export class BirthdayTask extends BaseTask {
  constructor(client, logger, store, options) {
    super(client, logger, store, options);
  }

  async start() {
    const referenceDate = Date.now();
    const birthdays = await Birthday.findAll({ where: { date: { [Op.gte]: referenceDate }}});
    
    birthdays.forEach((birthday) => {
      const timeDifference = differenceInMilliseconds(birthday.dataValues.date, referenceDate);
      if (timeDifference < TIMEOUT_MAX) {
        setTimeout(() => this.executeBirthday(birthday.dataValues.id), timeDifference);
      }
    });

    setTimeout(() => this.start(), TIMEOUT_MAX);
  }

  async executeBirthday(id) {
    const birthday = await Birthday.findOne({ where: { id }});
    if (isNil(birthday)) return;
    
    const user = this.client.users.find((user) => user.id === birthday.dataValues.member);
    if (isNil(user)) return;

    const guild = this.client.guilds.find((guild) => guild.id === this.options.guild);
    const member = await guild.fetchMember(user);
    if (isNil(member)) return;

    const birthdayNickname = member.nickname ? `${member.nickname} 🎂` : `${user.username} 🎂`;  
    await member.addRole(this.options.role);    
    await member.setNickname(birthdayNickname);

    setTimeout(() => this.endBirthday(member), ONE_DAY);
    
    const messageChannel = this.client.channels.get(this.options.channel);
    return await messageChannel.send(`Happy Birthday <@${user.id}> !`);
  }

  async endBirthday(member) {
    await member.removeRole(this.options.role);
    const pastNickname = member.nickname.replace(' 🎂', '');
    if (pastNickname === member.user.username) {
      await member.setNickname('');
    } else {
      await member.setNickname(pastNickname);
    }
  }
}