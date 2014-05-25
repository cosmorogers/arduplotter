// ProcessService.js - in api/services
exports.process = function(json) {
    var nameMappings = {
        'ctun' : {
            'dcrt' : 'dcrate',
            'crt'  : 'crate',
        },
        'att' : {
            'desroll' : 'rollin',
            'despitch' : 'pitchin',
            'desyaw' : 'yawin',
        },
        'gps' : {
            'timems' : 'time',
        }
    }

    var processed = {
        params: {},
        att: {
            exists: false,
            mapped: false,
            rollin:  { col: null, values: [] },
            roll:    { col: null, values: [] },
            pitchin: { col: null, values: [] },
            pitch:   { col: null, values: [] },
            yawin:   { col: null, values: [] },
            yaw:     { col: null, values: [] },
            navyaw:  { col: null, values: [] },
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
        curr: {
            exists:  false,
            mapped:  false,
            thr:     { col: null, values: [] },
            thrint:  { col: null, values: [] },
            volt:    { col: null, values: [] },
            curr:    { col: null, values: [] },
            vcc:     { col: null, values: [] },
            currtot: { col: null, values: [] },
            totcur: 0,
            avgcur: 0,
        },
        ctun: {
            exists: false,
            mapped: false,
            thrin:  { col: null, values: [] },
            sonalt: { col: null, values: [] },
            baralt: { col: null, values: [] },
            wpalt:  { col: null, values: [] },
            navthr: { col: null, values: [] },
            angbst: { col: null, values: [] },
            crate:  { col: null, values: [] },
            throut: { col: null, values: [] },
            dcrate: { col: null, values: [] }
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
            status: { col: null, values: [] },
            time:   { col: null, values: [] },
            nsats:  { col: null, values: [] },
            hdop:   { col: null, values: [] },
            lat:    { col: null, values: [] },
            lng:    { col: null, values: [] },
            relalt: { col: null, values: [] },
            alt:    { col: null, values: [] },
            spd:    { col: null, values: [] },
            gcrs:   { col: null, values: [] },
            timestart: null,
            timeend: null,
            avgSpd: 0,
            lAvgSpd: [],
            googleMaps: [],
            readings: [],
        },
        imu: {
            exists: false,
            timems: { col: null, values: [] },
            gyrx: { col: null, values: [] },
            gyry: { col: null, values: [] },
            gyrz: { col: null, values: [] },
            accx: { col: null, values: [] },
            accy: { col: null, values: [] },
            accz: { col: null, values: [] },
            count: 0,
            trimmed: {accx: [], accy: [], accz: []}
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
            mode: { col: null },
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
                var name = row[1].trim().toLowerCase();
                processed.params[name] = {'name': row[1], 'value': row[2]};
                break;

            case 'FMT':
                var val = row[3].trim().toLowerCase();


                if (typeof processed[val] != "undefined") {
                    for (var i in row) {
                        var p = row[i].trim().toLowerCase();
                        if (typeof nameMappings[val] != "undefined" && typeof nameMappings[val][p] != "undefined") {
                            p = nameMappings[val][p];
                        }
                        if (typeof processed[val][p] != "undefined") {
                            processed[val][p].col = i - 4;
                        }
                    };
                    processed[val].mapped = true;
                }

                break;

            case 'ATT':
                processed.att.exists = true;
                processed.att.rollin.values.push(  [rowNum, parseFloat(row[processed.att.rollin.col])]);
                processed.att.roll.values.push(    [rowNum, parseFloat(row[processed.att.roll.col])]);
                processed.att.pitchin.values.push( [rowNum, parseFloat(row[processed.att.pitchin.col])]);
                processed.att.pitch.values.push(   [rowNum, parseFloat(row[processed.att.pitch.col])]);
                processed.att.yawin.values.push(   [rowNum, parseFloat(row[processed.att.yawin.col])]);
                processed.att.yaw.values.push(     [rowNum, parseFloat(row[processed.att.yaw.col])]);
                processed.att.navyaw.values.push(  [rowNum, parseFloat(row[processed.att.navyaw.col])]);
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
                processed.curr.exists = true;
                processed.curr.thr.values.push(     [rowNum, parseFloat(row[processed.curr.thr.col])]);
                processed.curr.thrint.values.push(  [rowNum, parseFloat(row[processed.curr.thrint.col])]);
                processed.curr.volt.values.push(    [rowNum, parseFloat(row[processed.curr.volt.col])/100]);
                processed.curr.curr.values.push(    [rowNum, parseFloat(row[processed.curr.curr.col])/100]);
                processed.curr.vcc.values.push(     [rowNum, parseFloat(row[processed.curr.vcc.col])/1000]);
                processed.curr.currtot.values.push( [rowNum, parseFloat(row[processed.curr.currtot.col])]);

                processed.curr.avgcur += parseFloat(row[processed.curr.curr.col]/100);
                processed.curr.totcur =  parseFloat(row[processed.curr.currtot.col]);

                break;

            case 'CTUN':
                processed.ctun.exists = true;
                processed.ctun.thrin.values.push(  [rowNum, parseFloat(row[processed.ctun.thrin.col])]);
                processed.ctun.sonalt.values.push( [rowNum, parseFloat(row[processed.ctun.sonalt.col])]);
                processed.ctun.baralt.values.push( [rowNum, parseFloat(row[processed.ctun.baralt.col])]);
                processed.ctun.wpalt.values.push(  [rowNum, parseFloat(row[processed.ctun.wpalt.col])]);
                processed.ctun.navthr.values.push( [rowNum, parseFloat(row[processed.ctun.navthr.col])]);
                processed.ctun.angbst.values.push( [rowNum, parseFloat(row[processed.ctun.angbst.col])]);
                processed.ctun.crate.values.push(  [rowNum, parseFloat(row[processed.ctun.crate.col])]);
                processed.ctun.throut.values.push( [rowNum, parseFloat(row[processed.ctun.throut.col])]);
                processed.ctun.dcrate.values.push( [rowNum, parseFloat(row[processed.ctun.dcrate.col])]);
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

                if (processed.gps.timestart === null) {
                    processed.gps.timestart = parseFloat(row[processed.gps.time.col]);
                }
                processed.gps.timeend = row[processed.gps.time.col];

                processed.gps.avgSpd += parseFloat(row[processed.gps.spd.col]);
                processed.gps.lAvgSpd.push([rowNum, processed.gps.avgSpd / processed.gps.spd.values.length]);

                processed.gps.googleMaps.push([parseFloat(row[processed.gps.lat.col]),  parseFloat(row[processed.gps.lng.col])]);

                processed.gps.readings.push(rowNum);
                break;

            case 'IMU':
                processed.imu.exists = true;
                processed.imu.timems.values.push( [rowNum, parseFloat(row[processed.imu.timems.col])]);
                processed.imu.gyrx.values.push( [rowNum, parseFloat(row[processed.imu.gyrx.col])]);
                processed.imu.gyry.values.push( [rowNum, parseFloat(row[processed.imu.gyry.col])]);
                processed.imu.gyrz.values.push( [rowNum, parseFloat(row[processed.imu.gyrz.col])]);
                processed.imu.accx.values.push( [rowNum, parseFloat(row[processed.imu.accx.col])]);
                processed.imu.accy.values.push( [rowNum, parseFloat(row[processed.imu.accy.col])]);
                processed.imu.accz.values.push( [rowNum, parseFloat(row[processed.imu.accz.col])]);

                processed.imu.count++;
                //Only take a sample for graph otherwise imu data is too huge!
                if (processed.imu.count % 10 == 0) {
                    processed.imu.trimmed.accx.push([rowNum, parseFloat(row[processed.imu.accx.col])]);
                    processed.imu.trimmed.accy.push([rowNum, parseFloat(row[processed.imu.accy.col])]);
                    processed.imu.trimmed.accz.push([rowNum, parseFloat(row[processed.imu.accz.col])]);
                }

                break;

            case 'INAV':

                break;

            case 'MODE':
                if (processed.mode.mode.col != null) {
                    var mode = {
                        'name' : row[processed.mode.mode.col].trim(),
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
                }
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

    processed.gps.avgSpd = (processed.gps.avgSpd / processed.gps.spd.values.length).toFixed(2);
    processed.curr.avgcur = (processed.curr.avgcur / processed.curr.curr.values.length).toFixed(2);
    processed.curr.totcur = processed.curr.totcur.toFixed(2);

    return processed;

};
