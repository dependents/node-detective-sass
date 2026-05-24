import { debuglog } from 'node:util';
import Walker from 'node-source-walk';
import sass from 'gonzales-pe';

const debug = debuglog('detective-sass');

/**
 * Extract the @import dependencies from a sass file's content.
 *
 * @param {string} content
 * @param {object} [options]
 * @param {boolean} [options.url] - include url() references
 * @returns {string[]}
 */
export default function detective(content, options = {}) {
  if (content === undefined) throw new Error('content not given');
  if (typeof content !== 'string') throw new Error('content is not a string');

  let ast = {};

  try {
    debug('content: %s', content);
    ast = sass.parse(content, { syntax: 'sass' });
  } catch(error) {
    debug('parse error: %s', error.message);
  }

  detective.ast = ast;

  const walker = new Walker();
  const dependencies = [];

  walker.walk(ast, node => {
    if (isImportStatement(node)) {
      dependencies.push(...extractDependencies(node, ['string', 'ident']));
      return;
    }

    if (options.url && node.type === 'uri') {
      dependencies.push(...extractDependencies(node, ['string', 'ident', 'raw']));
    }
  });

  return dependencies;
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isImportStatement(node) {
  if (!node || node.type !== 'atrule') return false;
  if (node.content.length === 0 || node.content[0].type !== 'atkeyword') return false;

  const atKeyword = node.content[0];

  if (atKeyword.content.length === 0) return false;

  return ['ident', 'import'].includes(atKeyword.content[0].type);
}

/**
 * @param {object} importStatementNode
 * @param {string[]} innerNodeTypes
 * @returns {string[]}
 */
function extractDependencies(importStatementNode, innerNodeTypes) {
  return importStatementNode.content
    .filter(innerNode => innerNodeTypes.includes(innerNode.type))
    .map(identifierNode => identifierNode.content.replaceAll(/["']/g, ''));
}
