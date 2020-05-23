'use strict';
import { Client } from 'discord.js';
import { Subject } from 'rxjs';
import { Message } from '../model/message';
import { DataStore } from './dataStore';

export class Bot {
  constructor(logger) {
    this.logger = logger;
    this.logger.debug('Creating bot.');

    this.raw = new Subject();
    this.commands = new Subject();
    this.incoming = new Subject();
    this.reactionAdd = new Subject();
    this.reactionRemove = new Subject();
    this.userfeed = new Subject();

    this.reactionHandler;
    this.confessionHandler;
    this.channelReactionWatcher;
    this.userFeedWatcher;
    this.autocannonWatcher;

    this.parsers = [];
    this.handlers = [];
    this.filters = [];
    this.tasks = [];

    this.dataStore = new DataStore();

    this.client = new Client();
  }

  /**
   * Starts the bot service, attaches event handlers.
   */
  async start() {
    this.logger.debug('Starting bot.');

    const streamError = (err) => {
      this.logger.error(err, 'bot stream did not handle error');
    };

    this.raw.subscribe((next) => this.handleRaw(next).catch(streamError));
    this.commands.subscribe((next) => this.handleCommand(next).catch(streamError));
    this.incoming.subscribe((next) => this.handleIncoming(next).catch(streamError));
    this.reactionAdd.subscribe((next) => this.handleMessageReactionAdd(next).catch(streamError));
    this.reactionRemove.subscribe((next) => this.handleMessageReactionRemove(next).catch(streamError));
    this.userfeed.subscribe((next) => this.handleUserFeed(next).catch(streamError));


    this.client.on('raw', (packet) => this.raw.next(packet));
    this.client.on('ready', () => this.logger.debug('Discord listener is ready'));
    this.client.on('message', (input) => this.convertMessage(input).then((msg) => this.incoming.next(msg)));
    this.client.on('messageReactionAdd', (msgReaction, user) => this.reactionAdd.next({ msgReaction, user }));
    this.client.on('messageReactionRemove', (msgReaction, user) => this.reactionRemove.next({ msgReaction, user }));
    this.client.on('guildMemberAdd', (guildMember) => this.userfeed.next({ guildMember, action: 'join' }));
    this.client.on('guildMemberRemove', (guildMember) => this.userfeed.next({ guildMember, action: 'leave' }));

    await this.client.login(process.env.DISCORD_TOKEN);
    await this.client.user.setPresence({ game: { name: '!listcommands' }, status: 'online' });

    this.tasks.forEach(async (task) => {
      await task.start();
    });
  }

  /**
   * Stops the bot, completes the observables, removes event listeners.
   */
  async stop() {
    this.raw.complete();
    this.commands.complete();
    this.incoming.complete();
    this.reactionAdd.complete();
    this.reactionRemove.complete();
    this.userfeed.complete();

    this.client.removeAllListeners('raw');
    this.client.removeAllListeners('ready');
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('messageReactionAdd');
    this.client.removeAllListeners('messageReactionRemove');
    this.client.removeAllListeners('guildMemberAdd');
    this.client.removeAllListeners('guildMemberRemove');
    await this.client.destroy();
  }

  /**
   * Runs the message through parsers, pushes generated commands to the observable.
   * @param {*} msg message to parse
   */
  async handleIncoming(msg) {
    const filterResult = await Promise.all(this.filters.map(async (filter) => {
      return await filter.check(msg);
    }));

    if (filterResult.reduce((prev, next) => prev || next)) {
      return;
    }

    if (await this.confessionHandler.check(msg)) {
      return await this.confessionHandler.handle(msg);
    }

    this.channelReactionWatcher.react(msg);
    this.autocannonWatcher.react(msg);

    this.parsers.forEach(async (parser) => {
      if (await parser.check(msg)) {
        try {
          await msg.save();
          const command = await parser.parse(msg);
          this.commands.next(command);
          return;
        } catch (err) {
          console.log(err);
          this.logger.error('Parser failed to parse the message');
        }
      }
    });

    this.logger.debug({ msg }, 'Message did not produce any commands');
  }

  /**
 * Runs the message through handlers.
 * @param {*} cmd command to handle
 */
  async handleCommand(cmd) {
    this.handlers.forEach(async (handler) => {
      if (await handler.check(cmd)) {
        try {
          return await handler.handle(cmd);
        } catch (err) {
          console.log(err);
          this.logger.error('Handler failed to handle the message');
        }
      }
    });

    this.logger.debug({ cmd }, 'Command was not handled');
  }

  async handleRaw(packet) {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

    const channel = this.client.channels.get(packet.d.channel_id);
    if (channel.messages.has(packet.d.message_id)) return;

    const message = await channel.fetchMessage(packet.d.message_id);
    const user = await this.client.fetchUser(packet.d.user_id);
    const msgReaction = {
      emoji: packet.d.emoji,
      message
    };

    switch (packet.t) {
      case 'MESSAGE_REACTION_ADD':
        this.reactionAdd.next({ msgReaction, user });
        break;
      case 'MESSAGE_REACTION_REMOVE':
        this.reactionRemove.next({ msgReaction, user });
        break;
    }
  }

  async handleMessageReactionAdd(reaction) {
    await this.reactionHandler.handle(reaction, 'add');
  }

  async handleMessageReactionRemove(reaction) {
    await this.reactionHandler.handle(reaction, 'remove');
  }

  async handleUserFeed(feedData) {
    const { guildMember, action } = feedData;
    await this.userFeedWatcher.handleFeed(guildMember, action);
  }

  /**
   * Converts the discord message to a message entity.
   * @param {*} msg message to convert
   */
  async convertMessage(msg) {
    this.logger.debug({ msg }, 'Converting discord message');

    return await new Message({
      author: msg.author.id,
      body: msg.content,
      channel: msg.channel.id,
      guild: msg.guild ? msg.guild.id : '0',
      createdAt: msg.createdAt,
      id: msg.id,
      reactions: msg.reactions.map((r) => r.emoji.name)
    });
  }

  /**
   * Registers a service in the bot
   * @param {*} serviceDefinition service definition to register
   * @param {*} options service options
   */
  registerService(serviceDefinition, serviceType, options) {
    const service = new serviceDefinition(this.client, this.logger, this.dataStore, options);
    switch (serviceType) {
      case 'parser':
        this.parsers.push(service);
        break;
      case 'handler':
        this.handlers.push(service);
        break;
      case 'filter':
        this.filters.push(service);
        break;
      case 'task':
        this.tasks.push(service);
        break;
      case 'reactionHandler':
        this.reactionHandler = service;
        break;
      case 'confessionHandler':
        this.confessionHandler = service;
        break;
      case 'autocannonWatcher':
        this.autocannonWatcher = service;
        break;
      case 'channelReactionWatcher':
        this.channelReactionWatcher = service;
        break;
      case 'userFeedWatcher':
        this.userFeedWatcher = service;
        break;
    }

    this.logger.debug(`Registered service: ${service.options.name}`);
  }
}
