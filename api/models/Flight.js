/**
* Flight.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    processed : { type: 'boolean' },
    createdAt : { type: 'date', index: true },
    size      : { type: 'integer' },
    filename  : { type: 'string' },
    filehash  : { type: 'string' }
  },
};

