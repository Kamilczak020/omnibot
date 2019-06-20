'use strict';
import { isNil } from 'lodash';
import { NotFoundError } from '../error/notFoundError';

export function mustExist(val) {
  if (isNil(val)) {
    throw new NotFoundError();
  }

  return val;
}
