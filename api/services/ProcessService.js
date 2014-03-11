// ProcessService.js - in api/services
exports.process = function(json) {

    var processed = {
        params: [],
        att: {
            exists: false,
            rollIn: [],
            roll: [],
            pitchIn: [],
            pitch: [],
            yawIn: [],
            yaw: [],
            navYaw: []
        },
        atun: {
            exists: false,
            axis: [],
            tuneStep: [],
            rateMin: [],
            rateMax: [],
            rpGain: [],
            rdGain: [],
            spGain: []
        },
        atde: {
            exists: false,
            angle: [],
            rate: []
        },
        cam: {
            exists: false,
            cams: [], //array of cameras
            gpsTime: [],
            lat: [],
            lng: [],
            alt: [],
            roll: [],
            pitch: [],
            yaw: []
        },
        cmd: {
            exists: false,
            cmds: [], //array of command objects so can list them all
            cTol: [],
            cNum: [],
            cId: [],
            cOpt: [],
            prm1: [],
            alt: [],
            lat: [],
            lng: []
        },
        compass: {
            exists: false,
            x: [],
            magX: [],
            magY: [],
            magZ: [],
            ofsX: [],
            ofsY: [],
            ofsZ: [],
            mofsX: [],
            mofsY: [],
            mofsZ: []
        },
        current: {
            exists: false,
            thr: [],
            thrInt: [],
            volt: [],
            curr: [],
            vcc: [],
            currTot: [],
        },
        ctun: {
            exists: false,
            thrIn: [],
            sonAlt: [],
            barAlt: [],
            wpAlt: [],
            navThr: [],
            angBst: [],
            cRate: [],
            thrOut: [],
            dcRate: []
        },
        err: {
            exists: false,
            errs: [],
        },
        ev: {
            exists: false,
            evt: [],
        },
        gps: {
            exists: false,
            mapped: false,
            status: {
                col: null,
                values: [],
            },
            time: {
                col: null,
                values: [],
            },
            nsats: {
                col: null,
                values: [],
            },
            hdop: {
                col: null,
                values: [],
            },
            lat: {
                col: null,
                values: [],
            },
            lng: {
                col: null,
                values: [],
            },
            relalt: {
                col: null,
                values: [],
            },
            alt: {
                col: null,
                values: [],
            },
            spd: {
                col: null,
                values: [],
            },
            gcrs: {
                col: null,
                values: [],
            },
            avgSpd: {
                col: null,
                values: [],
            },
            lAvgSpd: [],
            googleMaps: [],
            readings: [],
        },
        imu: {
            exists: false,
            timeMS: [],
            gyrX: [],
            gyrY: [],
            gyrZ: [],
            accX: [],
            accY: [],
            accZ: [],
        },
        inav: {
            exists: false,
            barAlt: [],
            iAlt: [],
            iClb: [],
            aCorX: [],
            aCorY: [],
            aCorZ: [],
            gLat: [],
            gLng: [],
            iLat: [],
            iLng: [],
        },
        mode: {
            count: 0,
            modes: {}, //array of modes!
        },
        ntun: {
            exists: false,
            wpDst: [],
            wpBrg: [],
            perX: [],
            perY: [],
            dVelX: [],
            dVelY: [],
            velX: [],
            velY: [],
            dAcX: [],
            dAcY: [],
            dRol: [],
            dpit: [],
        },
        pm: {
            exists: false,
            renCnt: [],
            renBlw: [],
            fixCnt: [],
            nLon: [],
            nLoop: [],
            maxT: [],
            pmt: [],
            i2cErr: [],
        }
    };

    for (var k in json) {
        var row = json[k],
        rowNum = parseInt(k);
        
        switch (row[0]) {
            case 'PARM':
                processed.params.push({'name': row[1], 'value': row[2]});
                break;

            case 'FMT':
                switch (row[3].trim()) {
                    case 'GPS':
                        for (var i in row) {
                            var p = row[i].trim().toLowerCase();
                            console.log(p, i, typeof processed.gps[p], (typeof processed.gps[p] != "undefined"));
                            if (typeof processed.gps[p] != "undefined") {
                                processed.gps[p].col = i - 4;
                                console.log(p + " is in col " + (i-4));
                            }
                        };
                        processed.gps.mapped = true;
                        break;
                }
                break;

            case 'ATT':
                processed.att.exists = true;
                processed.att.rollIn.push(  [rowNum, parseFloat(row[1])]);
                processed.att.roll.push(    [rowNum, parseFloat(row[2])]);
                processed.att.pitchIn.push( [rowNum, parseFloat(row[3])]);
                processed.att.pitch.push(   [rowNum, parseFloat(row[4])]);
                processed.att.yawIn.push(   [rowNum, parseFloat(row[5])]);
                processed.att.yaw.push(     [rowNum, parseFloat(row[6])]);
                processed.att.navYaw.push(  [rowNum, parseFloat(row[7])]);
                break;


            case 'ATUN':

                break;

            case 'ATDE':

                break;

            case 'CAM':

                break;

            case 'CMD':

                break;

            case 'COMPASS':

                break;

            case 'CURR':
                processed.current.exists = true;
                processed.current.thr.push(     [rowNum, parseFloat(row[1])]);
                processed.current.thrInt.push(  [rowNum, parseFloat(row[2])]);
                processed.current.volt.push(    [rowNum, row[3]/100]);
                processed.current.curr.push(    [rowNum, row[4]/100]);
                processed.current.vcc.push(     [rowNum, row[5]/1000]);
                processed.current.currTot.push( [rowNum, parseFloat(row[6])]);
                break;

            case 'CTUN':
                processed.ctun.exists = true;
                processed.ctun.thrIn.push(  [rowNum, parseFloat(row[1])]);
                processed.ctun.sonAlt.push( [rowNum, parseFloat(row[2])]);
                processed.ctun.barAlt.push( [rowNum, parseFloat(row[3])]);
                processed.ctun.wpAlt.push(  [rowNum, parseFloat(row[4])]);
                processed.ctun.navThr.push( [rowNum, parseFloat(row[5])]);
                processed.ctun.angBst.push( [rowNum, parseFloat(row[6])]);
                processed.ctun.cRate.push(  [rowNum, parseFloat(row[7])]);
                processed.ctun.thrOut.push( [rowNum, parseFloat(row[8])]);
                processed.ctun.dcRate.push( [rowNum, parseFloat(row[9])]);
                break;

            case 'ERR':
                processed.err.exists = true;
                error = {
                  error: parseInt(row[1]),
                  eCode: parseInt(row[2]),
                  type: 'unknown',
                  msg: 'unknown'
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
                    break;
                  case 10:
                    error.type = "Flight Mode";
                    var flightModeErrs = [
                        "the vehicle was unable to enter the Stabilize flight mode",
                        "the vehicle was unable to enter the Acro flight mode",
                        "the vehicle was unable to enter the AltHold flight mode",
                        "the vehicle was unable to enter the Auto flight mode",
                        "the vehicle was unable to enter the Guided flight mode",
                        "the vehicle was unable to enter the Loiter flight mode",
                        "the vehicle was unable to enter the RTL flight mode",
                        "the vehicle was unable to enter the Circle flight mode",
                        "the vehicle was unable to enter the Position flight mode",
                        "the vehicle was unable to enter the Land flight mode",
                        "the vehicle was unable to enter the OF_Loiter flight mode"
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
                }
                processed.err.errs.push(error);
                break;

            case 'EV':

                break;

            case 'GPS':
                processed.gps.exists = true;
                processed.gps.status.values.push( [rowNum, parseFloat(row[processed.gps.status.col])]);
                processed.gps.time.values.push(   [rowNum, parseFloat(row[processed.gps.time.col])]);
                processed.gps.nsats.values.push(  [rowNum, parseFloat(row[processed.gps.nsats.col])]);
                processed.gps.hdop.values.push(   [rowNum, parseFloat(row[processed.gps.hdop.col])]);
                processed.gps.lat.values.push(    [rowNum, parseFloat(row[processed.gps.lat.col])]);
                processed.gps.lng.values.push(    [rowNum, parseFloat(row[processed.gps.lng.col])]);
                processed.gps.relalt.values.push( [rowNum, parseFloat(row[processed.gps.relalt.col])]);
                processed.gps.alt.values.push(    [rowNum, parseFloat(row[processed.gps.alt.col])]);
                processed.gps.spd.values.push(    [rowNum, parseFloat(row[processed.gps.spd.col])]);
                processed.gps.gcrs.values.push(   [rowNum, parseFloat(row[processed.gps.gcrs.col])]);
                
                processed.gps.avgSpd += parseFloat(row[processed.gps.spd.col]);
                processed.gps.lAvgSpd.push([rowNum, processed.gps.avgSpd / processed.gps.spd.length]);

                processed.gps.googleMaps.push([parseFloat(row[processed.gps.lat.col]),  parseFloat(row[processed.gps.lng.col])]);

                processed.gps.readings.push(rowNum);
                break;

            case 'IMU':
                processed.imu.exists = true;
                processed.imu.timeMS.push( [rowNum, parseFloat(row[1])]);
                processed.imu.gyrX.push( [rowNum, parseFloat(row[2])]);
                processed.imu.gyrY.push( [rowNum, parseFloat(row[3])]);
                processed.imu.gyrZ.push( [rowNum, parseFloat(row[4])]);
                processed.imu.accX.push( [rowNum, parseFloat(row[5])]);
                processed.imu.accY.push( [rowNum, parseFloat(row[6])]);
                processed.imu.accZ.push( [rowNum, parseFloat(row[7])]);
                break;

            case 'INAV':

                break;

            case 'MODE':
                var mode = {
                    'name' : row[1].trim(),
                    'thrCrs' : parseFloat(row[2]),
                    'start': rowNum,
                    'end' : false,
                },
                next = processed.mode.count + 1;

                processed.mode.modes[next] = mode;

                if (processed.mode.count > 0) {
                    processed.mode.modes[processed.mode.count].end = rowNum;
                }

                processed.mode.count = next;
                break;

            case 'NTUN':

                break;

            case 'PM':

                break;

        }

    }

    //Clean up the last mode
    if (processed.mode.modes[processed.mode.count] != null) {
        processed.mode.modes[processed.mode.count].end = rowNum;
    }

    processed.gps.avgSpd = processed.gps.avgSpd / processed.gps.spd.length;

    return processed;

};
