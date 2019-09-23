'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { Birthday } from '../model/birthday';
import { format, parse } from 'date-fns';

export class BirthdayHandler extends BaseHandler {
  async handle(cmd) {
    const command = cmd.dataValues.name;
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const body = await this.getData(cmd, 'body');

    const member = this.client.users.find((user) => user.id === message.dataValues.author);

    
    switch (command) {
      case 'addbirthday': {
        try {
          const date = parse(body, 'YYYY-MM-DD');
          const birthday = new Birthday({ member, date });
          await birthday.update();
          return await this.replyToChannel(channel, `Your birthday (${format(birthday, 'Do MMMM YYYY')}) has beed added. You can remove it using !removebirthday`);
        } catch {
          return await this.replyToChannel(channel, 'Something went wrong. Make sure the date format used is YYYY-MM-DD');
        }
      }

      case 'removebirthday': {
        try {
        await Birthday.destroy({ where: { member }}); 
        } catch {
          return await this.replyToChannel(channel, 'Something went wrong. Please retry.');
        }
      }
    }

    return await this.replyToChannel(channel, `The option I chose for you is: ${result}`);
  }
}
