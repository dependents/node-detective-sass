'use strict';

const { debuglog } = require('util');
const Walker = require('node-source-walk');
const sass = require('gonzales-pe');

const debug = debuglog('detective-sass');

/**
 * Extract the @import statements from a given sass file's content
 *
 * @param  {String} content
 * @param  {Object} options
 * @param  {Boolean} options.url - detect any url() references to images, fonts, etc.
 * @return {String[]}
 */
module.exports = function detective(content, options = {}) {
  if (content === undefined) throw new Error('content not given');
  if (typeof content !== 'string') throw new Error('content is not a string');

  let ast = {};

  try {
    debug('content: %s', content);
    ast = sass.parse(content, { syntax: 'sass' });
  } catch (error) {
    debug('parse error: %s', error.message);
  }

  detective.ast = ast;

  const walker = new Walker();
  let dependencies = [];

  walker.walk(ast, node => {
    if (isImportStatement(node)) {
      dependencies = [...dependencies, ...extractDependencies(node)];
      return;
    }

    if (options?.url && node.type === 'uri') {
      dependencies = [...dependencies, ...extractUriDependencies(node)];
    }
  });

  return dependencies;
};

function isImportStatement(node) {
  if (!node || node.type !== 'atrule') return false;
  if (node.content.length === 0 || node.content[0].type !== 'atkeyword') return false;

  const atKeyword = node.content[0];

  if (atKeyword.content.length === 0) return false;

  const importKeyword = atKeyword.content[0];

  return ['ident', 'import'].includes(importKeyword.type);
}

function extractDependencies(importStatementNode) {
  return importStatementNode.content
    .filter(innerNode => ['string', 'ident'].includes(innerNode.type))
    .map(identifierNode => identifierNode.content.replace(/["']/g, ''));
}

function extractUriDependencies(importStatementNode) {
  return importStatementNode.content
    .filter(innerNode => ['string', 'ident', 'raw'].includes(innerNode.type))
    .map(identifierNode => identifierNode.content.replace(/["']/g, ''));
}
