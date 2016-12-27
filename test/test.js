var detective = require('../');
var assert = require('assert');

describe('detective-sass', function() {
  function test(src, deps, opts) {
    assert.deepEqual(detective(src, opts), deps);
  }

  describe('throws', function() {
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

    it('does not throw on broken syntax', function() {
      assert.doesNotThrow(function() {
        detective('@');
      });
    });
  });

  it('dangles the parsed AST', function() {
    detective('@import "_foo.scss";');
    assert.ok(detective.ast);
  });

  describe('when there is a parse error', function() {
    it('supplies an empty object as the "parsed" ast', function() {
      detective('|');
      assert.deepEqual(detective.ast, {});
    });
  });

  describe('scss', function() {
    it('returns the dependencies of the given .scss file content', function() {
      var scssOpts = {
        syntax: 'scss'
      };

      test('@import "_foo.scss";', ['_foo.scss'], scssOpts);
      test('@import          "_foo.scss";', ['_foo.scss'], scssOpts);
      test('@import "_foo";', ['_foo'], scssOpts);
      test('body { color: blue; } @import "_foo";', ['_foo'], scssOpts);
      test('@import "bar";', ['bar'], scssOpts);
      test('@import "bar"; @import "foo";', ['bar', 'foo'], scssOpts);
      test('@import \'bar\';', ['bar'], scssOpts);
      test('@import \'bar.scss\';', ['bar.scss'], scssOpts);
      test('@import "_foo.scss";\n@import "_bar.scss";', ['_foo.scss', '_bar.scss'], scssOpts);
      test('@import "_foo.scss";\n@import "_bar.scss";\n@import "_baz";\n@import "_buttons";', ['_foo.scss', '_bar.scss', '_baz', '_buttons'], scssOpts);
      test('@import "_nested.scss"; body { color: blue; a { text-decoration: underline; }}', ['_nested.scss'], scssOpts);
    });

    it('handles comma-separated imports (#2)', function() {
      test('@import "_foo.scss", "bar";', ['_foo.scss', 'bar'], {
        syntax: 'scss'
      });
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
