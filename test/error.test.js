'use strict';

const { suite } = require('uvu');
const assert = require('uvu/assert');
const detective = require('../index.js');

const errorSuite = suite('error handling');

errorSuite('throws if options.syntax is missing', () => {
  assert.throws(() => {
    detective('');
  }, err => err instanceof Error && err.message === '`options.syntax` not given; possible values are "sass" and "scss"');
});

errorSuite('throws if options.syntax is invalid', () => {
  assert.throws(() => {
    detective('', { syntax: 'less' });
  }, err => err instanceof Error && err.message === 'invalid `options.syntax` value; possible values are "sass" and "scss"');
});

errorSuite('throws if the given content is not a string', () => {
  assert.throws(() => {
    detective(() => {});
  }, err => err instanceof Error && err.message === 'content is not a string');
});

errorSuite('throws if called with no arguments', () => {
  assert.throws(() => {
    detective();
  }, err => err instanceof Error && err.message === 'content not given');
});

errorSuite('does not throw for empty files', () => {
  assert.not.throws(() => {
    detective('', { syntax: 'sass' });
  });
});

errorSuite('does not throw on broken syntax', () => {
  assert.not.throws(() => {
    detective('@', { syntax: 'sass' });
  });
});

errorSuite('supplies an empty object as the "parsed" ast', () => {
  detective('|', { syntax: 'sass' });
  assert.equal(detective.ast, {});
});

errorSuite.run();
