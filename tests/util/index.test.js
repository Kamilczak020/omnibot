'use strict';
import { expect } from 'chai';
import { mustExist } from '../../src/util';

describe('MustExist', () => {
  it('Should return the input if its not nil', () => {
    const result = mustExist('test');
    expect(result).to.be.equal('test');
  });

  it('Should throw an error if the input is nil', () => {
    expect(() => mustExist(null)).to.throw();
  }); 
});
