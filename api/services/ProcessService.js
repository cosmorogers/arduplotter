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
            status: [],
            time: [],
            nSats: [],
            hdop: [],
            lat: [],
            lng: [],
            relAlt: [],
            alt: [],
            spd: [],
            gcrs: [],
            avgSpd: 0,
            lAvgSpd: [],
            googleMaps: [],
        },
        imu: {
            exists: false,
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
                    break;
                  case 4:
                    break;
                  case 5:
                    break;
                  case 6: //Battery failsafe
                    error.type = "Battery failsafe"
                    if (error.eCode = 1) {
                      error.msg = "battery voltage dropped below LOW_VOLT or total battery capacity used exceeded BATT_CAPACITY";
                    }
                    break;
                  case 7:
                    break;
                  case 8:
                    break;
                  case 9:
                    break;
                  case 10:
                    break;
                  case 11:
                    break;
                  case 12:
                    break;
                }
                processed.err.errs.push(error);
                break;

            case 'EV':

                break;

            case 'GPS':
                processed.gps.exists = true;
                processed.gps.status.push( [rowNum, parseFloat(row[1])]);
                processed.gps.time.push(   [rowNum, parseFloat(row[2])]);
                processed.gps.nSats.push(  [rowNum, parseFloat(row[3])]);
                processed.gps.hdop.push(   [rowNum, parseFloat(row[4])]);
                processed.gps.lat.push(    [rowNum, parseFloat(row[6])]);
                processed.gps.lng.push(    [rowNum, parseFloat(row[7])]);
                processed.gps.relAlt.push( [rowNum, parseFloat(row[8])]);
                processed.gps.alt.push(    [rowNum, parseFloat(row[9])]);
                processed.gps.spd.push(    [rowNum, parseFloat(row[10])]);
                processed.gps.gcrs.push(   [rowNum, parseFloat(row[11])]);
                
                processed.gps.avgSpd += parseFloat(row[9]);
                processed.gps.lAvgSpd.push([rowNum, processed.gps.avgSpd / processed.gps.spd.length]);

                processed.gps.googleMaps.push([parseFloat(row[6]),  parseFloat(row[7])]);
                break;

            case 'IMU':

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
