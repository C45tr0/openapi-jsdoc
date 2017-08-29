## Getting started

`openapi-jsdoc` returns the validated OpenAPI specification as JSON or YAML.

```javascript
var openApiJSDoc = require('openapi-jsdoc');

var options = {
  openApiDefinition: {
    info: {
      title: 'Hello World', // Title (required)
      version: '1.0.0', // Version (required)
    },
  },
  apis: ['./routes.js'], // Path to the API docs
};

// Initialize openapi-jsdoc -> returns validated OpenApi spec in json format
var openApiSpec = openApiJSDoc(options);
```

At this time you can do with the openApiSpec whatever you want.
The simplest way would be serving it straight to the outside world:

```javascript
app.get('/api-docs.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(openApiSpec);
});
```

You could also use a framework like [swagger-tools](https://www.npmjs.com/package/swagger-tools) to serve the spec and a swagger-ui.

### How to document the API

The API can now be documented in JSDoc-style with OpenApi spec in YAML.

```javascript
/**
 * @openapi
 * /login:
 *   post:
 *     description: Login to the application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *            properties:
 *              username:
 *                type: string
 *                description: Username to use for login.
 *              password:
 *                type: string
 *                description: User's password
 *     responses:
 *       200:
 *         description: login
 */
app.post('/login', function(req, res) {
  res.json(req.body);
});
```

### Re-using Model Definitions

A model may be the same for multiple endpoints (Ex. User POST,PUT responses).
In place of writing (or copy and pasting) the same code into multiple locations,
which can be error prone when adding a new field to the schema. You can define
a model and re-use it across multiple endpoints. You can also reference another
model and add fields.
```javascript
/**
 * @openapi
 * components:
 *   schema:
 *     NewUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *     User:
 *       allOf:
 *         - $ref: '#/components/schemas/NewUser'
 *         - required:
 *           - id
 *         - properties:
 *           id:
 *             type: integer
 *             format: int64
 */

/**
 * @openapi
 * /users:
 *   get:
 *     description: Returns users
 *     responses:
 *       200:
 *         description: users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/users', function(req, res) {
  res.json([ {
    id: 1,
    username: 'jsmith',
  }, {1
    id: 2,
    username: 'jdoe',
  } ]);
});

/**
 * @openapi
 * /users:
 *   post:
 *     description: Returns users
 *     requestBody:
 *       required: true
 *       content:
 *         schema:
 *           $ref: '#/components/schemas/NewUser'
 *     responses:
 *       200:
 *         description: users
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/definitions/User'
 */
app.post('/users', function(req, res) {
  // Generate ID
  req.body.id = Math.floor(Math.random() * 100) * 1
  res.json(req.body);
});
```

### Load external definitions

You can load external definitions or paths after ``openApiJSDoc()`` function.
```javascript
// Initialize openapi-jsdoc -> returns validated OpenApi spec in json format
var openApiSpec = openApiJSDoc(options);
// load external schema json
openApiSpec.definitions.in_login = require("config/schemajson/in.login.schema.json");
openApiSpec.definitions.out_login = require("config/schemajson/out.login.schema.json");
// or set manual paths
openApiSpec.paths["api/v1/cool"] = {"get" : { ... } }
};
```
