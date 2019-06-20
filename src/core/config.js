'use strict';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ConfigurationError } from '../error/configurationError';

export function loadConfig(filepath) {
  try {
    return yaml.safeLoad(fs.readFileSync(filepath));
  } catch (err) {
    throw new ConfigurationError('Config file failed to load.');
  }
}
