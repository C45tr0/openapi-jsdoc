'use strict';

// Dependencies.
var RecursiveIterator = require('recursive-iterator');
var excludedOpenApiProperties = [
  'apis',
];

/**
 * Checks if tag is already contained withing target.
 * The tag is an object of type http://swagger.io/specification/#tagObject
 * The target, is the part of the OpenApi specification that holds all tags.
 * @function
 * @param {object} target - OpenApi object place to include the tags data.
 * @param {object} tag - OpenApi tag object to be included.
 * @returns {boolean} Does tag is already present in target
 */
function _tagDuplicated(target, tag) {
  // Check input is workable.
  if (target && target.length && tag) {
    for (var i = 0; i < target.length; i = i + 1) {
      var targetTag = target[i];
      // The name of the tag to include already exists in the taget.
      // Therefore, it's not necessary to be added again.
      if (targetTag.name === tag.name) {
        return true;
      }
    }
  }

  // This will indicate that `tag` is not present in `target`.
  return false;
}

/**
 * Adds the tags property to a OpenApi object.
 * @function
 * @param {object} conf - Flexible configuration.
 */
function _attachTags(conf) {
  var tag = conf.tag;
  var openApiObject = conf.openApiObject;
  var propertyName = conf.propertyName;

  // Correct deprecated property.
  if (propertyName === 'tag') {
    propertyName = 'tags';
  }

  if (Array.isArray(tag)) {
    for (var i = 0; i < tag.length; i = i + 1) {
      if (!_tagDuplicated(openApiObject[propertyName], tag[i])) {
        openApiObject[propertyName].push(tag[i]);
      }
    }
  } else {
    if (!_tagDuplicated(openApiObject[propertyName], tag)) {
      openApiObject[propertyName].push(tag);
    }
  }
}

/**
 * Merges two objects
 * @function
 * @param {object} obj1 - Object 1
 * @param {object} obj2 - Object 2
 * @returns {object} Merged Object
 */
function _objectMerge(obj1, obj2) {
  var obj3 = {};
  for (var attr in obj1) {
    if (obj1.hasOwnProperty(attr)) {
      obj3[attr] = obj1[attr];
    }
  }
  for (var name in obj2) {
    if (obj2.hasOwnProperty(name)) {
      obj3[name] = obj2[name];
    }
  }
  return obj3;
}

/**
 * Adds necessary OpenApi schema object properties.
 * @see https://goo.gl/Eoagtl
 * @function
 * @param {object} openApiObject - The object to receive properties.
 * @returns {object} openApiObject - The updated object.
 */
function openApizeObj(openApiObject) {
  // Remove excluded keys from OpenApi output object
  excludedOpenApiProperties.forEach(function(key) {
    if (openApiObject.hasOwnProperty(key)) {
      delete openApiObject[key];
    }
  });

  openApiObject.openapi = '3.0.0';
  openApiObject.paths = openApiObject.paths || {};
  openApiObject.components = openApiObject.components || {};
  openApiObject.tags = openApiObject.tags || [];
  return openApiObject;
}

/**
 * List of deprecated or wrong OpenApi schema properties in singular.
 * @function
 * @returns {array} The list of deprecated property names.
 */
function _getOpenApiSchemaWrongProperties() {
  return [
    'consume',
    'produce',
    'path',
    'tag',
    'component',
    'scheme',
  ];
}

/**
 * Makes a deprecated property plural if necessary.
 * @function
 * @param {string} propertyName - The OpenApi property name to check.
 * @returns {string} The updated propertyName if neccessary.
 */
function _correctOpenApiKey(propertyName) {
  var wrong = _getOpenApiSchemaWrongProperties();
  if (wrong.indexOf(propertyName) > 0) {
    // Returns the corrected property name.
    return propertyName + 's';
  }
  return propertyName;
}

/**
 * Handles OpenApi propertyName in pathObject context for openApiObject.
 * @function
 * @param {object} openApiObject - The OpenApi object to update.
 * @param {object} pathObject - The input context of an item for openApiObject.
 * @param {string} propertyName - The property to handle.
 */
function _organizeOpenApiProperties(openApiObject, pathObject, propertyName) {
  var simpleProperties = [
    'consume',
    'consumes',
    'produce',
    'produces',
    'path',
    'paths',
    'schema',
    'schemas',
    'component',
    'components',
  ];

  // Common properties.
  if (simpleProperties.indexOf(propertyName) !== -1) {
    var keyName = _correctOpenApiKey(propertyName);
    var definitionNames = Object
      .getOwnPropertyNames(pathObject[propertyName]);
    for (var k = 0; k < definitionNames.length; k = k + 1) {
      var definitionName = definitionNames[k];

      openApiObject[keyName][definitionName] =
        _objectMerge(
          openApiObject[keyName][definitionName],
          pathObject[propertyName][definitionName]
        );
    }
  // Tags.
  } else if (propertyName === 'tag' || propertyName === 'tags') {
    var tag = pathObject[propertyName];
    _attachTags({
      tag: tag,
      openApiObject: openApiObject,
      propertyName: propertyName,
    });
  // Paths.
  } else {
    openApiObject.paths[propertyName] = _objectMerge(
      openApiObject.paths[propertyName], pathObject[propertyName]
    );
  }
}

/**
 * Adds the data in to the OpenApi object.
 * @function
 * @param {object} openApiObject - OpenApi object which will be written to
 * @param {object[]} data - objects of parsed OpenApi data from yml or jsDoc
 *                          comments
 */
function addDataToOpenApiObject(openApiObject, data) {
  if (!openApiObject || !data) {
    throw new Error('openApiObject and data are required!');
  }

  for (var i = 0; i < data.length; i = i + 1) {
    var pathObject = data[i];
    var propertyNames = Object.getOwnPropertyNames(pathObject);
    // Iterating the properties of the a given pathObject.
    for (var j = 0; j < propertyNames.length; j = j + 1) {
      var propertyName = propertyNames[j];
      // Do what's necessary to organize the end specification.
      _organizeOpenApiProperties(openApiObject, pathObject, propertyName);
    }
  }
}

/**
 * Aggregates a list of wrong properties in problems.
 * Searches in object based on a list of wrongSet.
 * @param {Array|object} list - a list to iterate
 * @param {Array} wrongSet - a list of wrong properties
 * @param {Array} problems - aggregate list of found problems
 */
function seekWrong(list, wrongSet, problems) {
  var iterator = new RecursiveIterator(list, 0, false);
  for (var item = iterator.next(); !item.done; item = iterator.next()) {
    var isDirectChildOfProperties =
      item.value.path[item.value.path.length - 2] === 'properties';

    if (wrongSet.indexOf(item.value.key) > 0 && !isDirectChildOfProperties) {
      problems.push(item.value.key);
    }
  }
}

/**
 * Returns a list of problematic tags if any.
 * @function
 * @param {Array} sources - a list of objects to iterate and check
 * @returns {Array} problems - a list of problems encountered
 */
function findDeprecated(sources) {
  var wrong = _getOpenApiSchemaWrongProperties();
  // accumulate problems encountered
  var problems = [];
  sources.forEach(function(source) {
    // Iterate through `source`, search for `wrong`, accumulate in `problems`.
    seekWrong(source, wrong, problems);
  });
  return problems;
}

module.exports = {
  addDataToOpenApiObject: addDataToOpenApiObject,
  openApizeObj: openApizeObj,
  findDeprecated: findDeprecated,
};
