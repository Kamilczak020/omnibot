'use strict';
import SequelizeMock from 'sequelize-mock';

const DBConnectionMock = new SequelizeMock();
export const CommandDataMock = DBConnectionMock.define('Command', {
  key: 'body',
  value: 'test'
});
