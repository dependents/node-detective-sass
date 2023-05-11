import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import detective from '../index.js';

function test(source, dependencies, options = {}) {
  const mergedOptions = { syntax: 'sass', ...options };
  assert.equal(detective(source, mergedOptions), dependencies);
}

const sassSuite = suite('sass');

sassSuite('dangles the parsed AST', () => {
  detective('@import "_foo.sass";', { syntax: 'sass' });
  assert.ok(detective.ast);
});

sassSuite('returns the dependencies of the given .sass file content', () => {
  test('@import _foo', ['_foo']);
  test('@import        _foo', ['_foo']);
  test('@import reset', ['reset']);
});

sassSuite('returns the url dependencies when url is enabled', () => {
  test(
    `@font-face
  font-family: "Trickster"
  src: local("Trickster"), url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1), url("trickster-outline.otf") format("opentype"), url("trickster-outline.woff") format("woff")`,
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
