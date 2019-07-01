'use strict';
import { BaseService } from '../core/baseService';
import { includes } from 'lodash';

export class UserFilter extends BaseService {
  async check(msg) {
    return includes(this.options.users, msg.dataValues.author);
  }
}
