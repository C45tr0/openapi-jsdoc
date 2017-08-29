/** @module index */
'use strict';

// Dependencies
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var doctrine = require('doctrine');
var jsYaml = require('js-yaml');
var parser = require('swagger-parser');
var openApiHelpers = require('./openapi-helpers');

/**
 * Parses the provided API file for JSDoc comments.
 * @function
 * @param {string} file - File to be parsed
 * @returns {{jsdoc: array, yaml: array}} JSDoc comments and Yaml files
 * @requires doctrine
 */
function parseApiFile(file) {
  var jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm;
  var fileContent = fs.readFileSync(file, { encoding: 'utf8' });
  var ext = path.extname(file);
  var yaml = [];
  var jsDocComments = [];

  if (ext === '.yaml' || ext === '.yml') {
    yaml.push(jsYaml.safeLoad(fileContent));
  } else {
    var regexResults = fileContent.match(jsDocRegex);
    if (regexResults) {
      for (var i = 0; i < regexResults.length; i = i + 1) {
        var jsDocComment = doctrine.parse(regexResults[i], { unwrap: true });
        jsDocComments.push(jsDocComment);
      }
    }
  }

  return {
    yaml: yaml,
    jsdoc: jsDocComments,
  };
}

/**
 * Filters JSDoc comments for those tagged with '@openapi'
 * @function
 * @param {array} jsDocComments - JSDoc comments
 * @returns {array} JSDoc comments tagged with '@openapi'
 * @requires js-yaml
 */
function filterJsDocComments(jsDocComments) {
  var openApiJsDocComments = [];

  for (var i = 0; i < jsDocComments.length; i = i + 1) {
    var jsDocComment = jsDocComments[i];
    for (var j = 0; j < jsDocComment.tags.length; j = j + 1) {
      var tag = jsDocComment.tags[j];
      if (tag.title === 'openapi') {
        openApiJsDocComments.push(jsYaml.safeLoad(tag.description));
      }
    }
  }

  return openApiJsDocComments;
}

/**
 * Converts an array of globs to full paths
 * @function
 * @param {array} globs - Array of globs and/or normal paths
 * @return {array} Array of fully-qualified paths
 * @requires glob
 */
function convertGlobPaths(globs) {
  return globs.reduce(function(acc, globString) {
    var globFiles = glob.sync(globString);
    return acc.concat(globFiles);
  }, []);
}

/**
 * Generates the OpenApi spec
 * @function
 * @param {object} options - Configuration options
 * @returns {array} OpenApi spec
 * @requires swagger-parser
 */
module.exports = function(options) {
  /* istanbul ignore if */
  if (!options) {
    throw new Error('\'options\' is required.');
  } else /* istanbul ignore if */ if (!options.openApiDefinition) {
    throw new Error('\'openApiDefinition\' is required.');
  } else /* istanbul ignore if */ if (!options.apis) {
    throw new Error('\'apis\' is required.');
  }

  // Build basic OpenApi json
  var openApiObject = openApiHelpers.openApizeObj(options.openApiDefinition);
  var apiPaths = convertGlobPaths(options.apis);

  // Parse the documentation in the APIs array.
  for (var i = 0; i < apiPaths.length; i = i + 1) {
    var files = parseApiFile(apiPaths[i]);
    var openApiJsDocComments = filterJsDocComments(files.jsdoc);

    var problems = openApiHelpers.findDeprecated([files, openApiJsDocComments]);
    // Report a warning in case potential problems encountered.
    if (problems.length > 0) {
      console.warn('You are using properties to be deprecated in v3.0.0');
      console.warn('Please update to align with the OpenApi v3.0.0 spec.');
      console.warn(problems);
    }

    openApiHelpers.addDataToOpenApiObject(openApiObject, files.yaml);
    openApiHelpers.addDataToOpenApiObject(openApiObject, openApiJsDocComments);
  }

  parser.parse(openApiObject, function(err, api) {
    if (!err) {
      openApiObject = api;
    }
  });

  return openApiObject;
};
