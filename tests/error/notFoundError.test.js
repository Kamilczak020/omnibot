'use strict';
import { expect } from 'chai';
import { NotFoundError } from '../../src/error/notFoundError';

describe('NotFoundError', () => {
  const error = new NotFoundError('message');

  it('Should have a name property ', () => {
    expect(error.name).to.equal('NotFoundError');
  });

  it('Should have a message property', () => {
    expect(error.message).to.equal('message');
  })
});