'use strict';
import { BaseTask } from './baseTask';
import { Reminder } from '../model/reminder';
import { differenceInMilliseconds, format } from 'date-fns';
import { isNil } from 'lodash';
import { Op } from 'sequelize';

const TIMEOUT_MAX = 2147483647;

export class ReminderTask extends BaseTask {
  constructor(client, logger, store, options) {
    super(client, logger, store, options);
  }

  async start() {
    const referenceDate = Date.now();
    const remindersSkipped = await Reminder.findAll({ where: { reminderDate: { [Op.lt]: referenceDate }}});
    const reminders = await Reminder.findAll({ where: { reminderDate: { [Op.gte]: referenceDate }}});

    remindersSkipped.forEach((reminder) => {
      this.executeReminder(reminder.dataValues.id);
    });
    
    reminders.forEach((reminder) => {
      const timeDifference = differenceInMilliseconds(reminder.dataValues.reminderDate, referenceDate);
      if (timeDifference < TIMEOUT_MAX) {
        setTimeout(() => this.executeReminder(reminder.dataValues.id), timeDifference);
      }
    });

    setTimeout(() => this.start(), TIMEOUT_MAX);
  }

  async executeReminder(id) {
    const reminder = await Reminder.findOne({ where: { id }});
    if (isNil(reminder)) return;
    
    const user = await this.client.fetchUser(reminder.dataValues.author);
    if (isNil(user)) return;

    const dmChannel = user.dmChannel ? user.dmChannel : await user.createDM();
    await dmChannel.send(`**You have a reminder:**\n[${format(reminder.dataValues.reminderDate, 'Do MMM YYYY, HH:mm:ss')}] ${reminder.dataValues.message}`);

    await reminder.destroy();
  }
}