'use strict';

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);

    this.name = 'ConfigurationError';
  }
}
