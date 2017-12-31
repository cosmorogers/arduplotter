/**
* FlightDetails.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    name   : { type: 'string', index: true },
    type   : { type: 'string', index: true},
    flight : { type: 'string', index: true },
  },
};

