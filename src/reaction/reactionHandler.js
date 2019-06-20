'use strict';
import { BaseService } from '../core/baseService';

export class ReactionHandler extends BaseService {
  async handle(reaction, action) {
    this.options.messageReactionGroups.forEach(async (reactionGroup) => {
      if (reactionGroup.message === reaction.msgReaction.message.id) {
        const member = await reaction.msgReaction.message.guild.fetchMember(reaction.user);
        const role = reaction.msgReaction.message.guild.roles.find((guildRole) => guildRole.id = reactionGroup.role);

        switch (action) {
          case 'add':
            console.log('added');
            await member.addRole(role);
            break;
          case 'remove':
            await member.removeRole(role);
            break;
        }

        return;
      }
    });
  }
}
