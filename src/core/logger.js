'use strict';
import * as bunyan from 'bunyan';

export function createLogger() {
  return bunyan.createLogger({
    name: 'rlduels',
    streams: [{
      level: 'info',
      stream: process.stdout
    }, {
      level: 'debug',
      stream: process.stdout
    }, {
      level: 'warn',
      stream: process.stdout
    }, {
      level: 'error',
      stream: process.stdout
    }]
  });
}
