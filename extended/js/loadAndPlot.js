var jDat;
let mapType1 = "Demo";

var Mins = []
var Maxs = []
var Matrix = [];

var featAct = 0; //wichfeature is displayed (0=map)
var oneDim = 0; //reduce Sonification to active Dimension

const SonParaNames = ["Chroma", "Roughness", "Sharpness", "Loudness Fluctuation", "Chroma Panorama", "Noise Panorama", "Noise Color"]
const SlidActions = ["detune", "rough", "bright", "beat", "ChPan", "NoiPan", "NoiCol"]

fetch('../Data/SOM7.json')
    .then((response) => response.json())
    .then((jData) => {

        jDat = jData;

        //*********      init plot     *********** */
        plotScatAll(jData, "UM_Plot", mapType1);
        drawUM(jData.dx, jData.umatrix, "UM_Bg");

        //*********      Plot UM     *********** */

        let btn = document.createElement("button");
        btn.innerHTML = "<span class=\"switchText\">Map</span>";
        btn.name = 'map';
        btn.className = "SelBtn selected";
        btn.onclick = function () {
            drawUM(jData.dx, jData.umatrix, "UM_Bg");
            featAct = 0;

            var current = document.getElementsByClassName("selected");
            current[0].className = current[0].className.replace(" selected", "");
            this.className += " selected"
        };
        var par = document.getElementById("SelectButtons");
        par.appendChild(btn);

        //*********      Plot button Features     *********** */

        for (i = 0; i < jData.Features.length; i++) {

            let btn = document.createElement("button");
            // btn.innerHTML = "<label class=\"switch\"><input id=\"checkboxSOM_"+i+"\" type=\"checkbox\" checked \"><span class=\"sliderCheckBox\"></span><span class=\"switchText\">"+jData.Features[i]+"</span></label>";
            btn.innerHTML = "<span class=\"switchText\">" + jData.Features[i] + "</span>";
            btn.className = "SelBtn";
            btn.name = i;
            btn.onclick = function () {
                drawFeature(jData.dx, jData.som, parseInt(btn.name), "UM_Bg");
                featAct = parseInt(btn.name) + 1;

                var current = document.getElementsByClassName("selected");
                current[0].className = current[0].className.replace(" selected", "");
                this.className += " selected";
            };
            var par = document.getElementById("SelectButtons");
            par.appendChild(btn);
        }

        btn = document.createElement("button");
        btn.innerHTML = "<span class=\"switchText\">Training Data</span>";
        btn.name = 'map';
        // btn.innerHTML = "Karte";
        btn.className = "SelBtn active";
        btn.onclick = function () {
            toggleDots();
            this.classList.toggle('active');
        };
        par.appendChild(btn);

        MinMAx() //calulate Min/Max values for scaling SOM to Slider


        //------------ create Mod Matrix ----------------//
        Matrix = Array.from(Array(jDat.Features.length), () => new Array(SonParaNames.length).fill(0));

        tbl = document.createElement('table');
        tbl.classList.add('ModTab');

        for (i = 0; i < jData.Features.length + 1; i++) {
            const tr = tbl.insertRow();
            for (let j = 0; j < SonParaNames.length + 1; j++) {

                if (i > 0 && j == 0) {
                    const th = document.createElement('th');
                    th.appendChild(document.createTextNode(jData.Features[i - 1]));
                    tr.appendChild(th);
                    // td.style.border = '1px solid #fff';
                } else if (i == 0 && j > 0) {
                    const th = document.createElement('th');
                    th.appendChild(document.createTextNode(SonParaNames[j - 1]));
                    tr.appendChild(th);
                    // td.style.border = '1px solid #fff';
                } else if (i == 0 && j == 0) {
                    const th = document.createElement('th');
                    tr.appendChild(th);
                    // td.style.border = '1px solid #fff';
                } else {
                    const td = tr.insertCell();
                    let btn = document.createElement("button");

                    btn.className = "MatBtn";
                    btn.name = (i - 1) + '_' + (j - 1);
                    btn.onclick = function () {
                        ids = btn.name.split('_')
                        let val_temp = (Matrix[ids[0]][ids[1]] + 1) % 3;

                        for (k = 0; k < jData.Features.length; k++) {
                            // reset Matrix as a Sonification Paramter can be modulated by only one SOM-Feature
                            if (k != ids[0]) {
                                Matrix[k][ids[1]] = 0
                                let btn2 = document.getElementsByName(k + "_" + ids[1])[0]
                                btn2.classList.remove('greenM')
                                btn2.classList.remove('redM')
                            }
                        }

                        Matrix[ids[0]][ids[1]] = val_temp;

                        if (val_temp == 1) {
                            btn.classList.add('greenM')
                            btn.classList.remove('redM')
                        } else if (val_temp == 2) {
                            btn.classList.remove('greenM')
                            btn.classList.add('redM')
                        } else {
                            btn.classList.remove('greenM')
                            btn.classList.remove('redM')
                        }
                    };

                    if (i == j) {
                        Matrix[i - 1][j - 1] = 1
                        btn.classList.add('greenM')
                    }
                    td.appendChild(btn);
                }
            }
        }

        const ModDiv = document.getElementById("ModMavtDiv");
        ModDiv.appendChild(tbl);
    });




//*********      misc. Fkt    *********** */

function toggleDots() {
    const parentElement = document.getElementById('UM_Plot');
    const childElements = parentElement.querySelectorAll('*');

    childElements.forEach(child => {
        child.classList.toggle('invis');
    });
}

function MinMAx() {
    let featT = []
    for (i = 0; i < jDat.Features.length; i++) {
        featT = []
        for (ix = 0; ix < jDat.dx * jDat.dx; ix++) {
            featT[ix] = jDat.som[ix][i]
        }
        Mins[i] = Math.min(...featT);
        Maxs[i] = Math.max(...featT) - Mins[i];
    }
}


//-------- interaction with Map and Sliders -----------//

const b1D = document.querySelector('[data-action="1d"]');
b1D.onclick = function () {
    this.classList.toggle('active')
    oneDim *= -1
    oneDim += 1

};

//----------------- Map interaction ----------------//

let bounds = document.getElementById('UM_Klick');
bounds.addEventListener("mousedown", function (e1) {
    SoundOn();
    XY2Sound(e1);
    bounds.addEventListener("mousemove", XY2Sound)
})

bounds.addEventListener("mouseup", function () {
    bounds.removeEventListener("mousemove", XY2Sound);
    SoundOff();
})
bounds.addEventListener("mouseout", function () {
    bounds.removeEventListener("mousemove", XY2Sound);
    SoundOff();
})

//-------- again for touch -----------//
bounds.addEventListener("touchstart", function (e1) {
    SoundOn();
    XY2Sound(e1);
    bounds.addEventListener("mousemove", XY2Sound)
})

bounds.addEventListener("touchend", function () {
    bounds.removeEventListener("mousemove", XY2Sound);
    SoundOff();
})
bounds.addEventListener("touchcancel", function () {
    bounds.removeEventListener("mousemove", XY2Sound);
    SoundOff();
})

//-------- interaction with sliders -----------//

const slideParent = document.getElementById('SliderKlick');
const slideChild = slideParent.querySelectorAll('[class="slid"]');

slideChild.forEach(child => {
    child.addEventListener("mousedown", function () {
        SoundOn();
    })
    child.addEventListener("mouseup", function () {
        SoundOff();
    })
    child.addEventListener("mouseout", function () {
        SoundOff();
    })

    //Touch
    child.addEventListener("touchstart", function () {
        SoundOn();
    })
    child.addEventListener("touchend", function () {
        SoundOff();
    })
    child.addEventListener("touchcancel", function () {
        SoundOff();
    })
});

//-------- interaction functions -----------//

function XY2Sound(e) {
    let x = e.clientX - bounds.getBoundingClientRect().left;
    let y = e.clientY - bounds.getBoundingClientRect().top;

    let wid = bounds.clientWidth / jDat.dx;
    x = Math.floor(x / wid);
    y = Math.floor(y / wid);

    vallys = jDat.som[rereveal(x, y, jDat.dx)];

    changeSound(vallys)
}

function changeSound(vallys) { // move sliders when clicking on map
    for (let j = 0; j < SonParaNames.length; j++) {
        for (i = 0; i < jDat.Features.length; i++) {
            if (i == featAct - 1 || oneDim == 0) {
                if (Matrix[i][j] == 1){
                    sAct = document.querySelector('[data-action=' + SlidActions[j] + ']');
                    sAct.value = Math.round((vallys[i] - Mins[i]) * 1000 / Maxs[i]);
                }else if(Matrix[i][j] == 2){
                    sAct = document.querySelector('[data-action=' + SlidActions[j] + ']');
                    sAct.value = Math.round((vallys[i] - Mins[i]) * (-1000) / Maxs[i]+1000);
                }
            }
        }
    }
    updateAllParams();
}