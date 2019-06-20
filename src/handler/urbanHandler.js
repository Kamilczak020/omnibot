'use strict';
import * as axios from 'axios';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { isEmpty } from 'lodash';
import { RichEmbed } from 'discord.js';

export class UrbanHandler extends BaseHandler {
  async handle(cmd) {
    const term = await this.getData(cmd, 'body');
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;

    const response = await axios.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
    if (isEmpty(response.data.list)) {
      return await this.replyToChannel(channel, `No definitions for "${term}" were found.`);
    }

    const fields = response.data.list.slice(0, 3).map((def) => {
      return {
        name: def.permalink,
        value: def.definition,
      };
    });

    const embed = new RichEmbed({
      fields,
      color: 0xFF6F61,
      title: `Definitions of "${term}"`,
      description: `Showing ${response.data.list.length > 3 ? 'first ' : ''}${fields.length} definition${fields.length > 1 ? 's' : ''}.`,
      url: `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(term)}`
    });

    return await this.replyToChannel(channel, embed);
  }
}
