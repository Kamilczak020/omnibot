'use strict';
import 'babel-polyfill';
import * as dotenv from 'dotenv';
import { isNil } from 'lodash';
import { Bot } from './core/bot';
import { loadConfig } from './core/config';
import { createDatabase } from './core/database';
import { createLogger } from './core/logger';

import { EchoParser } from './parser/echoParser';
import { HelpHandler } from './handler/helpHandler';
import { ChooseHandler } from './handler/chooseHandler';
import { RestartHandler } from './handler/restartHandler';
import { SplitParser } from './parser/splitParser';
import { EchoHandler } from './handler/echoHandler';
import { UrbanHandler } from './handler/urbanHandler';
import { BadWordFilter } from './filter/badWordFilter';
import { DefineHandler } from './handler/defineHandler';
import { UserActionHandler } from './handler/userActionHandler';
import { AnnouncementHandler } from './handler/announcementHandler';
import { RemindmeHandler } from './handler/remindmeHandler';
import { ConfessionHandler } from './handler/confessionHandler';
import { DeleteHandler } from './handler/deleteHandler';
import { CommandManagerHandler } from './handler/commandManagerHandler';
import { CustomCommandHandler } from './handler/customCommandHandler';
import { MathHandler } from './handler/mathHandler';

import { ReminderTask } from './task/reminderTask';

import { ReactionHandler } from './reaction/reactionHandler';
import { ChannelReactionWatcher } from './watcher/channelReactionWatcher';
import { UserFeedWatcher } from './watcher/userFeedWatcher';
import { UserFilter } from './filter/userFilter';
import { CustomCommandParser } from './parser/customCommandParser';
import { StatsHandler } from './handler/statsHandler';
import { SedHandler } from './handler/sedHandler';


dotenv.config();

console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);

const logger = createLogger();
const config = loadConfig('./build/config.yml');
const database = createDatabase(logger);
const bot = new Bot(logger);

database.sequelize.authenticate().catch((error) => {
  console.log('Failed to connect to database', error);
  process.exit();
});

// register parsers
bot.registerService(EchoParser, 'parser', config.parsers.echoParser);
bot.registerService(SplitParser, 'parser', config.parsers.splitParser);
bot.registerService(CustomCommandParser, 'parser', config.parsers.customCommandParser);

// register handlers
// bot.registerService(BirthdayHandler, 'handler', config.handlers.birthdayHandler);
bot.registerService(ChooseHandler, 'handler', config.handlers.chooseHandler);
bot.registerService(EchoHandler, 'handler', config.handlers.echoHandler);
bot.registerService(HelpHandler, 'handler', config.handlers.helpHandler);
bot.registerService(RestartHandler, 'handler', config.handlers.restartHandler);
bot.registerService(UserActionHandler, 'handler', config.handlers.userActionHandler);
bot.registerService(UrbanHandler, 'handler', config.handlers.urbanHandler);
bot.registerService(DefineHandler, 'handler', config.handlers.defineHandler);
bot.registerService(AnnouncementHandler, 'handler', config.handlers.announcementHandler);
bot.registerService(RemindmeHandler, 'handler', config.handlers.remindmeHandler);
bot.registerService(ConfessionHandler, 'confessionHandler', config.handlers.confessionHandler);
bot.registerService(DeleteHandler, 'handler', config.handlers.deleteHandler);
bot.registerService(CustomCommandHandler, 'handler', config.handlers.customCommandHandler);
bot.registerService(CommandManagerHandler, 'handler', config.handlers.commandManagerHandler);
bot.registerService(MathHandler, 'handler', config.handlers.mathHandler);
bot.registerService(StatsHandler, 'handler', config.handlers.statsHandler);
bot.registerService(SedHandler, 'handler', config.handlers.sedHandler);

// register filters
bot.registerService(BadWordFilter, 'filter', config.filters.badWordFilter);
bot.registerService(UserFilter, 'filter', config.filters.userFilter);

// register reaction handlers
bot.registerService(ReactionHandler, 'reactionHandler', config.handlers.reactionHandler);

// register watchers
bot.registerService(ChannelReactionWatcher, 'channelReactionWatcher', config.watchers.channelReactionWatcher);
bot.registerService(UserFeedWatcher, 'userFeedWatcher', config.watchers.userFeedWatcher);

// register tasks
bot.registerService(ReminderTask, 'task', config.tasks.reminderTask);
// bot.registerService(BirthdayTask, 'task', config.tasks.birthdayTask);

if (process.argv[2] === 'sync') {
  try {
    database.sequelize.sync();
  } catch (err) {
    logger.error(err);
  }
}

process.on('exit', () => {
  bot.stop();
});

bot.start();
