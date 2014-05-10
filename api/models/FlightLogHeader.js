/**
 * Flight Log Header
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	filename: 'STRING',
  	createdAt: {
  		type: 'DATE',
  		index: true
  	},
  	logId: 'STRING',
  	size: 'INTEGER',/*
  	logContains: {
	  	att: 'BOOLEAN',
	  	curr: 'BOOLEAN',
	  	ctun: 'BOOLEAN',
	  	err: 'BOOLEAN',
	  	gps: 'BOOLEAN',
	  	imu: 'BOOLEAN'
	  }*/
    
  }

};
