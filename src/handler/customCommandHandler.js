'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { CustomCommand } from '../model/customCommand';
import { isNil, isEmpty, intersection } from 'lodash';

export class CustomCommandHandler extends BaseHandler {
  async check(cmd) {
    const msg = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = await this.client.channels.get(msg.dataValues.channel);
    const message = await channel.fetchMessage(msg.dataValues.id);

    const isCommand = !isNil(await CustomCommand.findOne({ where: { name: cmd.dataValues.name }}));
    const isAllowed = !isEmpty(intersection(this.options.roles, message.member.roles.map((role) => role.name))) || isEmpty(this.options.roles) || this.options.roles === undefined;
  
    return isCommand && isAllowed;
  }

  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    
    const customCommand = await CustomCommand.findOne({ where: { name: cmd.dataValues.name }});

    return await this.replyToChannel(channel, customCommand.dataValues.body);
  }
}