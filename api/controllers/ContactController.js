/**
 * ContactController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  index: function (req, res) {
    submitted = false;
    if (req.method === 'POST') {
      // For example
      Contact.create({
        name: req.param('name'),
        email: req.param('email'),
        message: req.param('message')
      }).done(function(err, user) {

        // Error handling
        if (err) {
          return console.log(err);

        // The User was created successfully!
        }else {
          console.log("contact created:", user);
        }
      });
    }
    // Send a JSON response
    return res.view({
      'submitted' : submitted,
      active: 'contact'
    });
  },



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContactController)
   */
  _config: {}

  
};
