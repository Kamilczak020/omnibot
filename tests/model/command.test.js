'use strict';
import SequelizeMock from 'sequelize-mock';

const DBConnectionMock = new SequelizeMock();
export const CommandMock = DBConnectionMock.define('Command', {
  name: 'example'
});
