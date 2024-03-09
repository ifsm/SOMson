var jDat;
let mapType1 = "Demo";

var Mins = []
var Maxs = []

var featAct = 0; //wichfeature is displayed (0=map)
var oneDim = 0; //reduce Sonification to active Dimension

fetch('Data/DemoTechnoSOM.json')
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
                featAct = parseInt(btn.name)+1;

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

const b1D= document.querySelector('[data-action="1d"]');
b1D.onclick = function () {
    this.classList.toggle('active')
    oneDim*=-1
    oneDim+=1

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

function changeSound(vallys){ // move sliders when clicking on map
    if(featAct==1 && oneDim==1){
        sDet.value = Math.round((vallys[0] - Mins[0]) * 1000 / Maxs[0]);
    }else if(featAct==2 && oneDim==1){
        sRogh.value = Math.round((vallys[1] - Mins[1]) * 1000 / Maxs[1]);
    }else if(featAct==3 && oneDim==1){
        sBri.value = Math.round((vallys[2] - Mins[2]) * 1000 / Maxs[2]);
    }else if(featAct==4 && oneDim==1){
        sBeat.value = Math.round((vallys[3] - Mins[3]) * 1000 / Maxs[3]);
    }else{
        sDet.value = Math.round((vallys[0] - Mins[0]) * 1000 / Maxs[0]);
        sRogh.value = Math.round((vallys[1] - Mins[1]) * 1000 / Maxs[1]);
        sBri.value = Math.round((vallys[2] - Mins[2]) * 1000 / Maxs[2]);
        sBeat.value = Math.round((vallys[3] - Mins[3]) * 1000 / Maxs[3]);
    }
    updateAllParams();
}    