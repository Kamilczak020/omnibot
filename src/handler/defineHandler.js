'use strict';
import * as axios from 'axios';
import { BaseHandler } from './baseHandler';
import { Message } from '../model/message';
import { includes, groupBy, clamp } from 'lodash';
import { RichEmbed } from 'discord.js';

export class DefineHandler extends BaseHandler {
  async handle(cmd) {
    const body = (await this.getData(cmd, 'body')).toLowerCase();
    const message = await Message.findOne({ where: { id: cmd.dataValues.MessageId }});
    const channel = message.dataValues.channel;
    const fields = 'definitions,pronunciations';
    const keywords = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'interjection', 'conjunction', 'determiner', 'exclamation'];

    const potentialKeyword = body.split(' ')[0];
    const query = encodeURIComponent(body);
    const querySansKeyword = encodeURIComponent(body.split(' ').slice(1).join(' '));
    const request = includes(keywords, potentialKeyword)
      ? `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${querySansKeyword}?fields=${fields}&strictMatch=false&lexicalCategory=${potentialKeyword}`
      : `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${query}?fields=${fields}&strictMatch=false`;

    const response = await axios.get(request, {
      headers: {
        'app_id': process.env.OXFORD_APP_ID,
        'app_key': process.env.OXFORD_APP_KEY
      }
    }).catch(async (err) => {
      await this.replyToChannel(channel, `No definitions for "${query}" were found.`);
      return;
    });

    const dictionaryEntries = [];
    response.data.results.forEach((result) => {
      result.lexicalEntries.forEach((lexicalEntry) => {
        if (lexicalEntry.entries === undefined) return;
        
        lexicalEntry.entries.forEach((entry) => {
          if (entry.senses === undefined) return;

          const dictionaryEntry = {
            definition: entry.senses[0].definitions[0],
            keyword: lexicalEntry.lexicalCategory.id,
            name: result.word,
            pronunciation: lexicalEntry.pronunciations[0].phoneticSpelling
          };

          dictionaryEntries.push(dictionaryEntry);
        });
      });
    });

    const entryGroups = groupBy(dictionaryEntries, (entry) => entry.keyword);
    const filteredKeywords = keywords.filter((keyword) => includes(Object.keys(entryGroups), keyword));
    const entries = filteredKeywords.map((keyword) => entryGroups[keyword]);

    let index = 0;
    const embedFields = [];
    while (embedFields.length < this.options.resultsLimit && embedFields.length !== entries.flat().length) {
      const entry = entries[index % entries.length][Math.floor(index / entries.length)]; 
      const embedField = {
        name: `${entry.name} [${entry.keyword}]`,
        value: `**Definition:** ${entry.definition}\n**Pronunciation:** ${entry.pronunciation ? entry.pronunciation : 'no pronunciation available'}`
      };

      embedFields.push(embedField);
      index++;
    }

    const embed = new RichEmbed({
      fields: embedFields.sort((prev, next) => prev.name.localeCompare(next.name)),
      color: 0xFF6F61,
      title: `Definitions found for query: ${response.data.word}`
    });

    return await this.replyToChannel(channel, embed);
  }
}