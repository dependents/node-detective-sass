var detective = require('../');
var assert = require('assert');

describe('detective-sass', function() {
  function test(src, deps) {
    assert.deepEqual(detective(src), deps);
  }

  it('does not throw for empty files', function() {
    assert.doesNotThrow(function() {
      detective('');
    });
  });

  it('throws if the given content is not a string', function() {
    assert.throws(function() {
      detective(function() {});
    });
  });

  it('throws if called with no arguments', function() {
    assert.throws(function() {
      detective();
    });
  });

  describe('scss', function() {
    it('returns the dependencies of the given .scss file content', function() {
      test('@import "_foo.scss";', ['_foo.scss']);
      test('@import          "_foo.scss";', ['_foo.scss']);
      test('@import "_foo";', ['_foo']);
      test('body { color: blue; } @import "_foo";', ['_foo']);
      test('@import "bar";', ['bar']);
      test('@import "bar"; @import "foo";', ['bar', 'foo']);
      test('@import \'bar\';', ['bar']);
      test('@import \'bar.scss\';', ['bar.scss']);
      test('@import "_foo.scss";\n@import "_bar.scss";', ['_foo.scss', '_bar.scss']);
      test('@import "_foo.scss";\n@import "_bar.scss";\n@import "_baz";\n@import "_buttons";', ['_foo.scss', '_bar.scss', '_baz', '_buttons']);
    });

    it('handles comma-separated imports (#2)', function() {
      test('@import "_foo.scss", "bar";', ['_foo.scss', 'bar']);
    });

    it('allows imports with no semicolon', function() {
      test('@import "_foo.scss"\n@import "_bar.scss"', ['_foo.scss', '_bar.scss']);
    });
  });

  describe('sass', function() {
    it('returns the dependencies of the given .sass file content', function() {
      test('@import _foo', ['_foo']);
      test('@import        _foo', ['_foo']);
      test('@import reset', ['reset']);
    });
  });
});
