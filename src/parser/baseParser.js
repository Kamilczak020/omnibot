'use strict';
import { includes } from 'lodash';
import { mustExist } from '../util';
import { BaseService } from '../core/baseService';

export class BaseParser extends BaseService {
  async check(msg) {
    const cmd = mustExist(msg.dataValues.body.split(' ')[0]);
    this.logger.debug('command parsed:', cmd);

    const checkResult = cmd.startsWith(this.options.prefix) && includes(this.options.commands, this.stripPrefix(cmd));
    this.logger.debug(`Parser check result: ${checkResult}`);

    return checkResult;
  }

  stripPrefix(cmd) {
    return cmd.slice(this.options.prefix.length);
  }
}
