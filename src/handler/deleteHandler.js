'use strict';
import * as axios from 'axios';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isNil, inRange } from 'lodash';

export class DeleteHandler extends BaseHandler {
  async handle(cmd) {
    const body = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    const channelRegex = /<#(\d*)>/g;
    const [channelText, count] = body.split(' ');
    const matchedChannel = channelRegex.exec(channelText);
    const targetChannel = matchedChannel ? await this.client.channels.get(matchedChannel[1]) : null;

    if (isNil(targetChannel)) {
      return await this.replyToChannel(channel, 'Invalid channel.');
    }

    if (isNaN(count) || (!isNaN(count) && !inRange(count, 1, 101))) {
      return await this.replyToChannel(channel, 'Given # of messages to delete should be a number between 0 and 100.');
    }

    const messages = await targetChannel.fetchMessages({ limit: count });
    messages.forEach(async (message) => {
      if (message.deletable) {
        await message.delete();
      }
    })

    return await this.replyToChannel(channel, 'Messages have been deleted.');
  }
}
