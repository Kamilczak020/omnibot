'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { Reminder } from '../model/reminder';
import { isNil, isEmpty } from 'lodash';
import { differenceInMilliseconds, differenceInSeconds, differenceInYears, format } from 'date-fns';
import { RichEmbed } from 'discord.js';
import * as chrono from 'chrono-node';

const TIMEOUT_MAX = 2147483647;

export class RemindmeHandler extends BaseHandler {
  async handle(cmd) {
    const command = cmd.dataValues.name;
    const msgBody = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    switch (command) {
      case 'addreminder': {
        const [reminderDate, reminderQuery] = msgBody.split(/(["“”][^"“”]*["“”])/g);

        const referenceDate = Date.now();
        const date = chrono.parseDate(reminderDate, referenceDate, { forwardDate: true });
        if (isNil(date)) {
          return await this.replyToChannel(channel, 'Incorrect reminder time specified.');
        }
    
        if (isNil(reminderQuery) || isEmpty(reminderQuery)) {
          return await this.replyToChannel(channel, 'A reminder message is required.');
        }
    
        if (differenceInSeconds(date, referenceDate) < 60) {
          return await this.replyToChannel(channel, 'Minimum time offset is 60 seconds.');
        }
    
        if (differenceInYears(date, referenceDate) > 5) {
          return await this.replyToChannel(channel, 'Maximum time offset is 5 years.');
        }
    
        const reminder = await new Reminder({
          author: message.dataValues.author,
          index: 0,
          message: reminderQuery,
          reminderDate: date
        });
        await reminder.save();
    
        const timeDifference = differenceInMilliseconds(reminder.dataValues.reminderDate, referenceDate);
        if (timeDifference < TIMEOUT_MAX) {
          setTimeout(() => this.executeReminder(reminder.dataValues.id), timeDifference);
        }
        return await this.replyToChannel(channel, `A reminder for ${format(date, 'Do MMM YYYY, HH:mm:ss')} [UTC] has been created.`);
      }
      
      case 'removereminder': {
        if (isEmpty(msgBody)) {
          return await this.replyToChannel(channel, 'Please provide an ID of a reminder to delete.');
        }

        const reminderToRemove = await Reminder.findOne({ where: { author: message.dataValues.author, index: msgBody }});
        if (isNil(reminderToRemove)) {
          return await this.replyToChannel(channel, 'Please provide an ID of a reminder to delete.');
        }
        await reminderToRemove.destroy();

        return await this.replyToChannel(channel, `A reminder with ID: ${msgBody} has been removed.`);
      }

      case 'listreminders': {
        const reminders = await Reminder.getByAuthor(message.dataValues.author);
        if (isEmpty(reminders)) {
          return await this.replyToChannel(channel, 'You have no reminders.');
        }

        const queryer = await this.client.fetchUser(message.dataValues.author);
        const dmChannel = queryer.dmChannel ? queryer.dmChannel : await queryer.createDM();
        const embed = new RichEmbed({
          title: `List of ongoing reminders:`,
          color: 0xFF6F61,
          description: reminders.map((reminder) => `**ID:** ${reminder.dataValues.index}\n**Date:** ${format(reminder.dataValues.reminderDate, 'Do MMM YYYY, HH:mm:ss')}\n**Message:** ${reminder.dataValues.message}`).join('\n\n')
        });

        await dmChannel.send('This is your current list of reminders:', embed); 
        return await this.replyToChannel(channel, 'Sent a list of reminders in DM.');
      }
    }
  }

  async executeReminder(id) {
    const reminder = await Reminder.findOne({ where: { id }});
    if (isNil(reminder)) return;
    
    const user = await this.client.fetchUser(reminder.dataValues.author);
    if (isNil(user)) return;

    const dmChannel = user.dmChannel ? user.dmChannel : await user.createDM();
    await dmChannel.send(`**You have a reminder:** [${format(reminder.dataValues.reminderDate, 'Do MMM YYYY, HH:mm:ss')}]${reminder.dataValues.message}`);

    await reminder.destroy();
  }
}
