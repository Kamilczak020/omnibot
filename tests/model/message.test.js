'use strict';
import SequelizeMock from 'sequelize-mock';

const DBConnectionMock = new SequelizeMock();
export const MessageMock = DBConnectionMock.define('Message', {
  author: 'kamil',
  body: 'this is a test message',
  channel: 'example channel',
  guild: 'example guild',
  id: '1',
  reactions: ['example1', 'example2']
});
