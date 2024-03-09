//*********      Plot SOM and UM     *********** */
function plotScatter(ensID, SVG, cl, data, mapType) {
    let dx = data.dx
    let x = data["px_" + ensID]
    let y = data["py_" + ensID]
    //console.log(x)
    let wid = SVG.clientWidth / dx
    let widt = wid * 0.25;

    document.documentElement.style.setProperty('--widt', widt*2);

    for (ix = 0; ix < x.length; ix++) {
        let px = (x[ix] + 0.5) * wid;
        let py = (y[ix] + 0.5) * wid;
        
        SVG.innerHTML += '<circle id="' + ensID + '_' + ix +'_'+mapType+'" cx="' + px.toString() + '" cy="' + py.toString() + '" r="' + widt.toString() + '" style="fill:' + cl + '; transform-origin:50% 50%; transform-box: fill-box">  </circle>';
        
        let btn = document.getElementById(ensID + '_' + ix + '_'+mapType)
        btn.classList.add("Punkt");
        btn.classList.add("Ens_" + ensID);
    }
}

function plotScatAll(data, ID, mapType) {
    var SVG = document.getElementById(ID)

    for (i = 0; i < data.Ensemble.length; i++) {
        let cmap = 'hsv'

        let Cm = evaluate_cmap(i / data.Ensemble.length, cmap, false)
        let cl = 'rgb(' + Cm.join(',') + ')'

        plotScatter(i.toString(), SVG, cl, data, mapType)
    }
}


function drawUM(dx, um, ID) {
    let cmap = 'gray'
    
    let can = document.getElementById(ID)
    let ctx = can.getContext("2d");

    let wid = can.clientWidth  / dx
    // let wid = 1000 / dx //Achtung! irgendwie komisch,ist das nur in firefox so, dass css nur scaliert???

    let xArr = new Array();
    for (y = 0; y < dx; y++) {
        xArr[y] = Math.min.apply(Math, um[y])
    }

    UM_min = Math.min.apply(Math, xArr)

    for (x = 0; x < dx; x++) {
        for (y = 0; y < dx; y++) {
            let Cm = evaluate_cmap((um[y][x] - UM_min)/(1-UM_min), cmap, false)

            let px = (x * wid);
            let py = (y * wid);

            ctx.fillStyle = 'rgb(' + Cm.join(',') + ')'
            ctx.fillRect(px, py, wid + 2, wid + 2);
        }
    }
}

function drawFeature(dx, som, n, ID) {
    let cmap = 'viridis'


    let can = document.getElementById(ID)
    let ctx = can.getContext("2d");

    let wid = can.clientWidth  / dx
    // let wid = 1000 / dx //Achtung! irgendwie komisch,ist das nur in firefox so, dass css nur scaliert???

    let feat = []
    for (ix = 0; ix < dx * dx; ix++) {
        feat[ix] = som[ix][n]
    }

    let mm = Math.min(...feat);
    feat = feat.map(x => x - mm);
    mm = Math.max(...feat);
    feat = feat.map(x => x / mm);

    for (ix = 0; ix < dx * dx; ix++) {

        [x, y] = unreveal(ix, dx);

        let Cm = evaluate_cmap(feat[ix], cmap, false)

        let px = (x * wid);
        let py = (y * wid);

        ctx.fillStyle = 'rgb(' + Cm.join(',') + ')'
        ctx.fillRect(px, py, wid + 2, wid + 2);

    }
}

//*********      diverse Fkt aus SOM   *********** */

function unreveal(i, dx) {
    var y = Math.floor(i / dx);
    var x = i % dx;
    return [x, y]
}

function rereveal(x, y, dx) {
    let id = y*dx+x
    return id
}