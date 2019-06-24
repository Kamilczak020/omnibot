'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';

export class RestartHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    await this.replyToChannel(channel, `The bot will be now restarted.`);
    process.exit();
  }
}