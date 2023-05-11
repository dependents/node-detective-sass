'use strict';

const { suite } = require('uvu');
const assert = require('uvu/assert');
const detective = require('../index.js');

function test(source, dependencies, options = {}) {
  const mergedOptions = { syntax: 'scss', ...options };
  assert.equal(detective(source, mergedOptions), dependencies);
}

const scssSuite = suite('scss');

scssSuite('dangles the parsed AST', () => {
  detective('@import "_foo.scss";', { syntax: 'scss' });
  assert.ok(detective.ast);
});

scssSuite('returns the dependencies of the given .scss file content', () => {
  test('@import "_foo.scss";', ['_foo.scss']);
  test('@import        "_foo.scss";', ['_foo.scss']);
  test('@import "_foo";', ['_foo']);
  test('body { color: blue; } @import "_foo";', ['_foo']);
  test('@import "bar";', ['bar']);
  test('@import "bar"; @import "foo";', ['bar', 'foo']);
  test('@import \'bar\';', ['bar']);
  test('@import \'bar.scss\';', ['bar.scss']);
  test('@import "_foo.scss";\n@import "_bar.scss";', ['_foo.scss', '_bar.scss']);
  test('@import "_foo.scss";\n@import "_bar.scss";\n@import "_baz";\n@import "_buttons";', ['_foo.scss', '_bar.scss', '_baz', '_buttons']);
  test('@import "_nested.scss"; body { color: blue; a { text-decoration: underline; }}', ['_nested.scss']);
});

scssSuite('handles comma-separated imports (#2)', () => {
  test('@import "_foo.scss", "bar";', ['_foo.scss', 'bar']);
});

scssSuite('allows imports with no semicolon', () => {
  test('@import "_foo.scss"\n@import "_bar.scss"', ['_foo.scss', '_bar.scss']);
});

scssSuite('returns the url dependencies when enable url', () => {
  test(
    '@font-face { font-family: "Trickster"; src: local("Trickster"), url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1), url("trickster-outline.otf") format("opentype"), url("trickster-outline.woff") format("woff"); }',
    [
      'trickster-COLRv1.otf',
      'trickster-outline.otf',
      'trickster-outline.woff'
    ],
    { url: true }
  );

  test(
    'body { div {background: no-repeat center/80% url("foo.png"); }}',
    ['foo.png'],
    { url: true }
  );

  test(
    'body { div {background: no-repeat center/80% url(foo.png); }}',
    ['foo.png'],
    { url: true }
  );
});

scssSuite.run();
