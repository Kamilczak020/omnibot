'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';

export class ChooseHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const body = await this.getData(cmd, 'body');
    const regex = /(".*?"|[^"\s]+)+(?=\s*|\s*$)/g

    const splitResult = body.match(regex);
    const result = splitResult[Math.random() * splitResult.length | 0]

    return await this.replyToChannel(channel, `The option I chose for you is: ${result}`);
  }
}