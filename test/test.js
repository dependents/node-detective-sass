/* eslint-env mocha */

'use strict';

const assert = require('assert').strict;
const detective = require('../index.js');

function test(source, dependencies, options) {
  assert.deepEqual(detective(source, options), dependencies);
}

describe('detective-sass', () => {
  describe('error handling', () => {
    it('does not throw for empty files', () => {
      assert.doesNotThrow(() => {
        detective('');
      });
    });

    it('throws if the given content is not a string', () => {
      assert.throws(() => {
        detective(() => {});
      }, Error, 'content is not a string');
    });

    it('throws if called with no arguments', () => {
      assert.throws(() => {
        detective();
      }, Error, 'src not given');
    });

    it('does not throw on broken syntax', () => {
      assert.doesNotThrow(() => {
        detective('@');
      });
    });

    it('supplies an empty object as the "parsed" ast', () => {
      detective('|');
      assert.deepEqual(detective.ast, {});
    });
  });

  describe('sass', () => {
    it('dangles the parsed AST', () => {
      detective('@import "_foo.sass";');
      assert.ok(detective.ast);
    });

    it('returns the dependencies of the given .sass file content', () => {
      test('@import _foo', ['_foo']);
      test('@import        _foo', ['_foo']);
      test('@import reset', ['reset']);
    });
  });
});
