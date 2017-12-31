var intTypes   = "bBhHiI",
		floatTypes = "fcCeEL",
		charTypes  = "nNZ",
    specialTypes = "M";

module.exports = {

    format: function(data, format) {
    	data = data.trim();
      if (format == '') {
        sails.log.warn('No data type for data' ,data);
        return data;
      } else if (intTypes.indexOf(format) > -1) {
    		return parseInt(data);
			} else if (floatTypes.indexOf(format) > -1) {
				return parseFloat(data);
      } else if (charTypes.indexOf(format) > -1) {
      	return data;
      } else if (specialTypes.indexOf(format) > -1) {
        //This could be a number or a string........................
        if (!isNaN(parseFloat(data)) && isFinite(data)) {
          return parseInt(data);
        } else {
          return data;
        }
      } else {
      	//Oh Noes!
      	sails.log.warn('Unknown data type', format);
      	return data;
      }

    },


    getErrorMsg: function(row, subsys, ecode) {
      error = {
        row: row,
        error: subsys,
        eCode: ecode,
        type: 'Unknown',
        msg: 'An error that ArduPlotter is unaware of occurred!'
      };
      //http://copter.ardupilot.com/wiki/common-diagnosing-problems-using-logs/#Unexpected_ERRORS_including_Failsafes
      switch(error.error) {
        case 1: //Main (never used)
          break;
        case 2://Radio
          error.type = 'Radio';
          if (error.eCode = 1) {
            error.msg = "'Late Frame' which means the APM's onboard ppm encoder did not provide an update for at least 2 seconds";
          } else if (error.eCode = 0) {
            error.msg = "error resolved which means the ppm encoder started providing data again";
          }
          break;
        case 3:
          error.type = "Compass";
          break;
        case 4:
          error.type = "Optical flow";
          break;
        case 5:
          error.type = "Throttle failsafe";
          if (error.eCode = 1) {
              error.msg = "throttle dropped below FS_THR_VALUE meaning likely loss of contact between RX/TX";
          } else if (error.eCode = 0) {
              error.msg = "above error resolve meaning RX/TX contact likely restored";
          }
          break;
        case 6: //Battery failsafe
          error.type = "Battery failsafe"
          if (error.eCode = 1) {
            error.msg = "battery voltage dropped below LOW_VOLT or total battery capacity used exceeded BATT_CAPACITY";
          }
          break;
        case 7:
          error.type = "GPS failsafe";
          var flightModeErrs = [
              "GPS lock restored",
              "GPS lock lost for at least 5 seconds"
          ];
          error.msg = flightModeErrs[error.eCode];
          break;
        case 8:
          error.type = "GCS (Ground station) failsafe";
          break;
        case 9:
          error.type = "Fence";
          var flightModeErrs = [
            "Vehicle is back within the fences",
            "Altitude fence breached",
            "Circular fence breached",
            "Both altitude and circular fences breached"
          ];
          error.msg = flightModeErrs[error.eCode];
          break;
        case 10:
          error.type = "Flight Mode";
          var flightModeErrs = [
              "The vehicle was unable to enter the Stabilize flight mode",
              "The vehicle was unable to enter the Acro flight mode",
              "The vehicle was unable to enter the AltHold flight mode",
              "The vehicle was unable to enter the Auto flight mode",
              "The vehicle was unable to enter the Guided flight mode",
              "The vehicle was unable to enter the Loiter flight mode",
              "The vehicle was unable to enter the RTL flight mode",
              "The vehicle was unable to enter the Circle flight mode",
              "The vehicle was unable to enter the Position flight mode",
              "The vehicle was unable to enter the Land flight mode",
              "The vehicle was unable to enter the OF_Loiter flight mode"
          ];
          error.msg = flightModeErrs[error.eCode];
          break;
        case 11:
          error.type = "GPS";
          var flightModeErrs = [
              "GPS Glitch cleared",
              "",
              "GPS Glitch"
          ];
          error.msg = flightModeErrs[error.eCode];
          break;
        case 12:
          error.type = "Crash Check";
          if (error.eCode == 1) {
              error.msg = "Crash detected";
          }
          break;
        case 13:
          error.type = "Flip";
          if (error.eCode == 2) {
              error.msg = "Flip abandoned (because of 2 second timeout)"
          }
          break;
        case 14:
          error.type = "AutoTune";
          if (error.eCode == 2) {
              error.msg = "Bad Gains (failed to determine proper gains)";
          }
          break;
        case 15:
          error.type = "Parachute";
          if (error.eCode == 2) {
              error.msg = "Too low to deploy parachute";
          }
          break;
        case 16:
          error.type = "EKF/InertialNav Check";
          var flightModeErrs = [
              "GPS Glitch cleared",
              "",
              "GPS Glitch"
          ];
          error.msg = flightModeErrs[error.eCode];

          if (error.eCode == 2) {
              error.msg = "Bad Variance";
          } else if (error.eCode == 0) {
              error.msg = "Bad Variance cleared";
          }
          break;
        case 17:
          error.type = "EKF/InertialNav Failsafe";
          if (error.eCode == 2) {
              error.msg = "EKF Failsafe triggered";
          }
          break;
        case 18:
          error.type = "Baro glitch";
          var flightModeErrs = [
              "Baro glitch cleared",
              "",
              "Baro glitch"
          ];
          error.msg = flightModeErrs[error.eCode];
          break;
      } //end switch
 
      if (error.type == 'Unknown' || error.msg == 'An error that ArduPlotter is unaware of occurred!') {
        sails.log.error('Unknown error code', error);
      }

      return error;

    }
};