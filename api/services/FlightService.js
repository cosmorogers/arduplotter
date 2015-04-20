var intTypes   = "bBhHiIM",
		floatTypes = "fcCeEL",
		charTypes  = "nNZ";

module.exports = {

    format: function(data, format) {
    	data = data.trim();
    	if (intTypes.indexOf(format) > -1) {
    		return parseInt(data);
			} else if (floatTypes.indexOf(format) > -1) {
				return parseFloat(data);
      } else if (charTypes.indexOf(format) > -1) {
      	return data;
      } else {
      	//Oh Noes!
      	sails.log.warn('Unkown data type', format);
      	return data;
      }

    }
};