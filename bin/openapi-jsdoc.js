#!/usr/bin/env node

'use strict';

/**
 * Module dependencies.
 */
var program = require('commander');
var fs = require('fs');
var path = require('path');
var openApiJSDoc = require('../');
var pkg = require('../package.json');
var jsYaml = require('js-yaml');
var chokidar = require('chokidar');

// Useful input.
var input = process.argv.slice(2);
// The spec, following a convention.
var output = 'openapi.json';

/**
 * Creates a OpenApi specification from a definition and a set of files.
 * @function
 * @param {object} openApiDefinition - The OpenApi definition object.
 * @param {array} apis - List of files to extract documentation from.
 * @param {array} output - Name the output file.
 */
function createSpecification(openApiDefinition, apis, output) {
  // Options for the OpenApi docs
  var options = {
    // Import openApiDefinition
    openApiDefinition: openApiDefinition,
    // Path to the API docs
    apis: apis,
  };

  // Initialize OpenApi-jsdoc -> returns validated JSON or YAML OpenApi spec
  var openApiSpec;
  var ext = path.extname(output);

  if (ext === '.yml' || ext === '.yaml') {
    openApiSpec = jsYaml.dump(openApiJSDoc(options));
  } else {
    openApiSpec = JSON.stringify(openApiJSDoc(options), null, 2);
  }

  fs.writeFile(output, openApiSpec, function writeSpecification(err) {
    if (err) {
      throw err;
    }
    console.log('OpenApi specification is ready.');
  });
}

program
  .version(pkg.version)
  .usage('[options] <path ...>')
  .option('-d, --definition <openApiDef.js>', 'Input OpenApi definition.')
  .option('-o, --output [openApiSpec.json]', 'Output OpenApi specification.')
  .option('-w, --watch', 'Whether or not to listen for continous changes.')
  .parse(process.argv);

// If no arguments provided, display help menu.
if (!input.length) {
  program.help();
}

// Require a definition file
if (!program.definition) {
  console.log('Definition file is required.');
  console.log('You can do that, for example: ');
  console.log('$ swag-jsdoc -d openApiDef.js ' + input.join(' '));
  program.help();
  process.exit(1);
}

// Override default output file if provided.
if (program.output) {
  output = program.output;
}

// Definition file is specified:
fs.readFile(program.definition, 'utf-8', function(err, data) {
  if (err || data === undefined) {
    return console.log('Definition file provided is not good.');
  }

  // Check whether the definition file is actually a usable .js file
  if (path.extname(program.definition) !== '.js' &&
    path.extname(program.definition) !== '.json'
  ) {
    console.log('Format as a module, it will be imported with require().');
    return console.log('Definition file should be .js or .json');
  }

  // Get an object of the definition file configuration.
  var openApiDefinition = require(path.resolve(program.definition));

  // Check for info object in the definition.
  if (!openApiDefinition.hasOwnProperty('info')) {
    console.log('Definition file should contain an info object!');
    return console.log('More at http://openapi.io/specification/#infoObject');
  }

  // Check for title and version properties in the info object.
  if (!openApiDefinition.info.hasOwnProperty('title') ||
    !openApiDefinition.info.hasOwnProperty('version')
  ) {
    console.log('The title and version properties are required!');
    return console.log('More at http://openapi.io/specification/#infoObject');
  }

  // Continue only if arguments provided.
  if (!openApiDefinition.apis && !program.args.length) {
    console.log('You must provide sources for reading API files.');
    // jscs:disable maximumLineLength
    return console.log('Either add filenames as arguments, or add an api key in your definitions file.');
  }

  // If there's no argument passed, but the user has defined Apis in
  // the definition file, pass them them onwards.
  if (program.args.length === 0 &&
    openApiDefinition.apis &&
    openApiDefinition.apis instanceof Array) {
    program.args = openApiDefinition.apis;
  }

  // If watch flag is turned on, listen for changes.
  if (program.watch) {
    var watcher = chokidar.watch(program.args, {
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    watcher.on('ready', function startMessage() {
      console.log('Listening for changes ...');
    });

    watcher.on('change', function detectChange(path) {
      console.log('Change detected in ' + path);
    });

    watcher.on('error', function catchErr(err) {
      return console.error(err);
    });

    watcher.on('all', function regenerateSpec() {
      createSpecification(openApiDefinition, program.args, output);
    });
  }
  // Just create the specification.
  else {
    createSpecification(openApiDefinition, program.args, output);
  }
});
