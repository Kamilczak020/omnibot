'use strict';

export class BaseService {
  constructor(client, logger, options) {
    this.client = client;
    this.logger = logger;
    this.options = options;
  }
}