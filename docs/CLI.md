## Command line usage of `openapi-jsdoc`

If the module is installed globally, a command line helper `$ openapi-jsdoc` will be available.
Otherwise `./bin/openapi-jsdoc` has access to the same interface.

### Usage

The easiest way to get started is using the help menu.

```
$ openapi-jsdoc -h
```

#### Specify a definition file

openapi-jsdoc will read the `api` array in your definition file by default for file paths it should read.

```
$ openapi-jsdoc -d openApiDef.js -o doc.json
```

This could be any .js or .json file which will be `require()`-ed and parsed/validated as JSON.

#### Specify input files (optional)

```
$ openapi-jsdoc route1.js route2.js
```
Free form input, can be before or after definition. [Glob patterns](https://github.com/isaacs/node-glob) are acceptable to match multiple files with same extension `*.js`, `*.php`, etc. or patterns selecting files in nested folders as `**/*.js`, `**/*.php`, etc.

#### Specify output file (optional)

```
$ openapi-jsdoc -o custom_specification.json
```

`openapi.json` by default. Output specification can accept also a `.yaml` or `.yml`. This generated OpenAPI specification can then be further tweaked with [`swagger-editor`](http://swagger.io/swagger-editor/) or similar.

#### Watch for changes (optional)

```
$ openapi-jsdoc -d openApiDef.js route1.js route2.js -w
```

The `-w` flag starts a watch task for input files with API documentation. This may be particularly useful when the output specification file is integrated with [Browsersync](https://browsersync.io/)
with [Swagger UI](http://swagger.io/swagger-ui/) or [ReDoc](https://github.com/Rebilly/ReDoc). Thus, the developer updates documentation in code with fast feedback in an interface showing live documentation based on the OpenAPI specification.
