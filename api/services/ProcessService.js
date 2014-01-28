// ProcessService.js - in api/services
exports.process = function(json) {

    var processed = {
        mode: {
            count: 0,
            modes: {}
        },
        params: [],
        power: {
            exists: false,
            thr: [],
            thrint: [],
            voltage: [],
            current: [],
            bvolt: [],
            totcurr: [],
        },
        gps: {
            exists: false,
            status: [],
            time: [],
            nsats: [],
            hdop: [],
            lat: [],
            lng: [],
            relAlt: [],
            alt: [],
            spd: [],
            gcrs: []
        },
        ctun: {
            exists: false,
            thrIn: [],
            sonAlt: [],
            barAlt: [],
            WPAlt: [],
            navThr: [],
            angBst: [],
            CRate: [],
            thrOut: [],
            DCRate: []
        }
    };

    for (var k in json) {
        var row = json[k],
        rowNum = parseInt(k);
        
        switch (row[0]) {
            case 'MODE':
                var mode = {
                    'name' : row[1].trim(),
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

            case 'PARM':
                processed.params.push({'name': row[1], 'value': row[2]});
                break;

            case 'CURR':
                processed.power.exists = true;
                processed.power.thr.push([rowNum, parseFloat(row[1])]);
                processed.power.thrint.push([rowNum, parseFloat(row[2])]);
                processed.power.voltage.push([rowNum, row[3]/100]);
                processed.power.current.push([rowNum, row[4]/100]);
                processed.power.bvolt.push([rowNum, row[5]/1000]);
                processed.power.totcurr.push([rowNum, parseFloat(row[6])]);
                break;

            case 'GPS':
                processed.gps.exists = true;
                processed.gps.status.push([rowNum, parseFloat(row[1])]);
                processed.gps.time.push(  [rowNum, parseFloat(row[2])]);
                processed.gps.nsats.push( [rowNum, parseFloat(row[3])]);
                processed.gps.hdop.push(  [rowNum, parseFloat(row[4])]);
                processed.gps.lat.push(   [rowNum, parseFloat(row[5])]);
                processed.gps.lng.push(   [rowNum, parseFloat(row[6])]);
                processed.gps.relAlt.push([rowNum, parseFloat(row[7])]);
                processed.gps.alt.push(   [rowNum, parseFloat(row[8])]);
                processed.gps.spd.push(   [rowNum, parseFloat(row[9])]);
                processed.gps.gcrs.push(  [rowNum, parseFloat(row[10])]);
                break;

            case 'CTUN':
                processed.ctun.exists = true;
                processed.ctun.thrIn.push([rowNum, parseFloat(row[1])]);
                processed.ctun.sonAlt.push([rowNum, parseFloat(row[2])]);
                processed.ctun.barAlt.push([rowNum, parseFloat(row[3])]);
                processed.ctun.WPAlt.push([rowNum, parseFloat(row[4])]);
                processed.ctun.navThr.push([rowNum, parseFloat(row[5])]);
                processed.ctun.angBst.push([rowNum, parseFloat(row[6])]);
                processed.ctun.CRate.push([rowNum, parseFloat(row[7])]);
                processed.ctun.thrOut.push([rowNum, parseFloat(row[8])]);
                processed.ctun.DCRate.push([rowNum, parseFloat(row[9])]);
                break;

        }

    }

    //Clean up the last mode
    processed.mode.modes[processed.mode.count].end = rowNum;

    return processed;

};