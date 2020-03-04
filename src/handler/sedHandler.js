'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isNil } from 'lodash';

export class SedHandler extends BaseHandler {
  async handle(cmd) {
    const body = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId } });
    const channel = message.dataValues.channel;

    const parts = body.match(/\/((?:[^\\]|\\.)*)\/((?:[^\\]|\\.)*)\/([gmiuy]*)/);
    if (isNil(parts)) {
      this.replyToChannel(channel, 'Incorrect SED command submitted.');
    }

    const targetChannel = await this.client.channels.find((c) => c.id === channel);
    const fetchedMessages = await targetChannel.fetchMessages({ limit: 20 });
    const messageArray = Array.from(fetchedMessages.values());

    for (let i = 0; i < messageArray.length; i++) {
      const fetchedMessage = messageArray[i];

      if (fetchedMessage.id === cmd.dataValues.MessageId) {
        continue;
      }

      if (this.options.ignore.includes(fetchedMessage.author.id)) {
        continue;
      }

      const [/* input */, pattern, replacement, flags] = parts;
      const expression = new RegExp(pattern, flags);
      if (expression.test(fetchedMessage.content)) {
        const replaced = fetchedMessage.content.replace(expression, replacement);
        await this.replyToChannel(channel, replaced);
        return;
      }
    }
  }
}