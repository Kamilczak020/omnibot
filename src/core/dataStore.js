'use strict';

export class DataStore {
  constructor() {
    this.confessions = [];
    this.autocannon = false;
    this.nicknames = new Map();
  }
}