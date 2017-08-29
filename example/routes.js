'use strict';

/* istanbul ignore next */
// This file is an example, it's not functionally used by the module.

// Sets up the routes.
module.exports.setup = function(app) {

  /**
   * @openapi
   * /:
   *   get:
   *     description: Returns the homepage
   *     responses:
   *       200:
   *         description: hello world
   */
  app.get('/', function(req, res) {
    res.send('Hello World!');
  });

  /**
   * @openapi
   * components:
   *   schemas:
   *     Login:
   *       required:
   *         - username
   *         - password
   *       properties:
   *         username:
   *           type: string
   *         password:
   *           type: string
   *         path:
   *           type: string
   */

  /**
   * @openapi
   * tags:
   *   name: Users
   *   description: User management and login
   */

  /**
   * @openapi
   * tags:
   *   - name: Login
   *     description: Login
   *   - name: Accounts
   *     description: Accounts
   */

  /**
   * @openapi
   * /login:
   *   post:
   *     description: Login to the application
   *     tags: [Users, Login]
   *     requestBody:
   *       $ref: '#/components/schemas/LoginBody'
   *     responses:
   *       200:
   *         description: login
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Login'
   */
  app.post('/login', function(req, res) {
    res.json(req.body);
  });

  /**
   * @openapi
   * /users:
   *   get:
   *     description: Returns users
   *     tags:
   *      - Users
   *     responses:
   *       200:
   *         description: users
   */
  app.get('/users', function(req, res) {
    res.json({
      username: 'jsmith',
    });
  });

  /**
   * @openapi
   * /users:
   *   post:
   *     description: Returns users
   *     tags: [Users]
   *     requestBody:
   *       $ref: '#/components/schemas/LoginBody'
   *     responses:
   *       200:
   *         description: users
   */
  app.post('/users', function(req, res) {
    res.json(req.body);
  });

};
