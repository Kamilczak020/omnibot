'use strict';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { evaluate, derivative, parse, simplify } from 'mathjs';
import { isNil, isEmpty, includes } from 'lodash';
import { RichEmbed } from 'discord.js';
import * as math from 'mathjs';

export class MathHandler extends BaseHandler {
  async handle(cmd) {
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const body = await this.getData(cmd, 'body');
    
    if (isNil(body)) {
      return await this.replyToChannel(channel, 'No expression to evaluate provided.');
    }

    const [potentialKeyword, ...rest] = body.split(' ');
    let response;
    switch (potentialKeyword) {
      case 'derivative': {
        const expression = rest.join(' ');
        const nodes = parse(expression);

        const symbolCandidates = [];
        nodes.traverse((node) => {
          if (node.type === 'SymbolNode' && typeof math[node.name] !== 'function') {
            symbolCandidates.push(node.name);
          }
        });

        if (isEmpty(symbolCandidates)) {
          response = 'Invalid expression. Could not infer the symbol(s) to differentiate against.';
          break;
        }

        const symbols = Array.from(new Set(symbolCandidates));
        response = new RichEmbed({
          title: `Derivatives of (${expression})`,
          color: 0xFF6F61,
          fields: symbols.map((symbol) => {
            return {
              name: `**With respect to {${symbol}}:**`,
              value: `**Derivative:** ${derivative(expression, symbol)}`
            };
          })
        });
        break;
      }

      case 'simplify': {
        const expression = rest.join(' ');
        try {
          response = simplify(expression).toString();
        } catch {
          response = 'Invalid expression.';
          break;
        }
        
        break;
      }

      default: {
        const expression = [potentialKeyword, ...rest].join(' ');
        try {
          response = evaluate(expression);
          break;
        } catch (error) {
          response = 'Invalid expression.';
          break;
        }
      }
    }

    return await this.replyToChannel(channel, response);
  }
}