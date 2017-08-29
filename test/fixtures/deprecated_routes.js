'use strict';

module.exports.setup = function(app) {
  /**
   * @openapi
   * /deprecated:
   *   get:
   *     description: Returns a string
   *     path: '/deprecated'
   *     responses:
   *       200:
   *         description: deprecated path
   */
  app.get('/deprecated', function(req, res) {
    res.send('Deprecated "path" property!');
  });
};
