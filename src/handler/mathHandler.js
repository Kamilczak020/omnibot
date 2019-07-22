'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { evaluate } from 'mathjs';
import { isNil } from 'lodash';

export class MathHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const body = await this.getData(cmd, 'body');
    
    if (isNil(body)) {
      return await this.replyToChannel(channel, 'No expression to evaluate provided.');
    }

    try {
      const result = evaluate(body);
      return await this.replyToChannel(channel, result);
    } catch (error) {
      return await this.replyToChannel(channel, 'Invalid expression.');
    }
  }
}