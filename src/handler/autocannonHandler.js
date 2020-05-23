'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';

export class AutocannonHandler extends BaseHandler {
  async handle(cmd) {
    const term = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId } });
    const channel = message.dataValues.channel;

    switch (term) {
      case 'enable':
        this.store.autocannon = true;
        this.replyToChannel(channel, 'TG Autocannon has been enabled.');
        break;
      case 'disable':
        this.store.autocannon = false;
        this.replyToChannel(channel, 'TG Autocannon has been disabled.');
        break;
    }
  }
}
