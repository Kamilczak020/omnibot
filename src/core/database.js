'use strict';
import { Sequelize } from 'sequelize';
import { Message } from '../model/message'; 
import { Command } from '../model/command';
import { CommandData } from '../model/commandData';
import { CustomCommand } from '../model/customCommand';
import { Warning } from '../model/warning';
import { Reminder } from '../model/reminder';
import { Birthday } from '../model/birthday';

export function createDatabase() {
  const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME
  });

  // Link models to database
  const models = {
    Message: Message.init(sequelize, Sequelize),
    Command: Command.init(sequelize, Sequelize),
    CommandData: CommandData.init(sequelize, Sequelize),
    CustomCommand: CustomCommand.init(sequelize, Sequelize),
    Warning: Warning.init(sequelize, Sequelize),
    Reminder: Reminder.init(sequelize, Sequelize)
  };
  
  Object.values(models)
    .filter((model) => typeof model.associate === 'function')
    .forEach((model) => model.associate(models));

  Object.values(models)
    .filter((model) => typeof model.registerHooks === 'function')
    .forEach((model) => model.registerHooks());
  
  return {
    ...models,
    sequelize
  };
}
