'use strict';

export class BaseService {
  constructor(client, logger, store, options) {
    this.client = client;
    this.logger = logger;
    this.store = store;
    this.options = options;

    this.init();
  }

  async init() { }
}