'use strict';
import { BaseService } from '../core/baseService';
import { concat } from 'lodash';
import { intersection, isEmpty } from 'lodash';

export class BadWordFilter extends BaseService {
  async check(msg) {
    const pluralizedFilteredWords = concat(this.options.filteredWords, this.options.filteredWords.map((word) => `${word}s`));
    if (!isEmpty(intersection(msg.dataValues.body.split(' '), pluralizedFilteredWords))) {
      const channel = await this.client.channels.get(msg.dataValues.channel);
      const message = await channel.fetchMessage(msg.dataValues.id);

      if (message.deletable) {
        message.delete();
        return true;
      }
    }
    return false;
  }
}
