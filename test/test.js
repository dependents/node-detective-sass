'use strict';

const { suite } = require('uvu');
const assert = require('uvu/assert');
const detective = require('../index.js');

function test(source, dependencies, options) {
  assert.equal(detective(source, options), dependencies);
}

const errorSuite = suite('error handling');

errorSuite('does not throw for empty files', () => {
  assert.not.throws(() => {
    detective('');
  });
});

errorSuite('throws if the given content is not a string', () => {
  assert.throws(() => {
    detective(() => {});
  }, Error, 'content is not a string');
});

errorSuite('throws if called with no arguments', () => {
  assert.throws(() => {
    detective();
  }, Error, 'src not given');
});

errorSuite('does not throw on broken syntax', () => {
  assert.not.throws(() => {
    detective('@');
  });
});

errorSuite('supplies an empty object as the "parsed" ast', () => {
  detective('|');
  assert.equal(detective.ast, {});
});

errorSuite.run();

const sassSuite = suite('sass');

sassSuite('dangles the parsed AST', () => {
  detective('@import "_foo.sass";');
  assert.ok(detective.ast);
});

sassSuite('returns the dependencies of the given .sass file content', () => {
  test('@import _foo', ['_foo']);
  test('@import        _foo', ['_foo']);
  test('@import reset', ['reset']);
});

sassSuite('returns the url dependencies when enable url', () => {
  test(
    '@font-face\n  font-family: "Trickster"\n  src: local("Trickster"), url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1), url("trickster-outline.otf") format("opentype"), url("trickster-outline.woff") format("woff")',
    [
      'trickster-COLRv1.otf',
      'trickster-outline.otf',
      'trickster-outline.woff'
    ],
    { url: true }
  );

  test(
    'body\n  div\n    background: no-repeat center/80% url("foo.png")',
    ['foo.png'],
    { url: true }
  );

  test(
    'body\n  div\n    background: no-repeat center/80% url(foo.png)',
    ['foo.png'],
    { url: true }
  );
});

sassSuite.run();
