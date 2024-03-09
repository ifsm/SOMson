let mu = 0.5; // mean of gauss for chroma amplitude weight
let vv = 0; // counter of chroma band

let nOsz = 9; //number of oszilators for chroma
let dim = 0.1; //dim. overall Volumenb of Chroma
let oszPan = 0; //Oszillator pan

function setup() {
    // mimics the autoplay policy
    noCanvas(); //prevent default p5js canvas
    getAudioContext().suspend();

    env = new p5.Envelope();
    env.setADSR(0.2, 0.2, 0.9, 0.1);

    mixGain = new p5.Gain();
    mixGain.amp(0.9);
    mixGain.connect();

    Oszis = {};
    ModsAM = {};

    for (let i = 0; i < nOsz; ++i) {
        Oszis[i]  = new p5.Oscillator('sine');
        Oszis[i].freq(100);
        Oszis[i].amp(0.1);
        // Oszis[i].start();
        Oszis[i].disconnect();
        Oszis[i].connect(mixGain);

        ModsAM[i] = new p5.Oscillator('sine');
        ModsAM[i].freq(0);
        ModsAM[i].amp(0.1);
        ModsAM[i].disconnect();
        ModsAM[i].start();

    }

    modulatorFM = new p5.Oscillator('sine');
    modulatorFM.freq(30);
    modulatorFM.amp(0);
    modulatorFM.disconnect();
    modulatorFM.start();


    Noise = new p5.Noise()
    Noise.amp(.6)
    Noise.disconnect();

    eqN = new p5.EQ(8); //equalizer for shaping noise color
    eqN.process(Noise);
    for (let i=0; i<eqN.bands.length; i++){
        eqN.bands[i].freq(pow(2,(i+1))*40);
        eqN.bands[i].gain(0)
        eqN.bands[i].res(0.5)
    }
    eqN.bands[0].res(0.1)
    eqN.bands[7].res(0.01)


    updateOszi()
}

function updateOszi(){
     
    for (let i = 0; i < nOsz; ++i) {
        // chroma
        Oszis[i].freq(Math.pow(2, (vv+i)%9)*25);
        // FM
        Oszis[i].freq(modulatorFM);
        // Gauss
        let ampy=dim*2.66*Math.exp(-0.5*Math.pow((((vv+i)%9)/9-mu)*6.66,2));
        Oszis[i].amp(ampy);
        
        // Beating
        ModsAM[i].amp(0.9*ampy);
        Oszis[i].amp(ModsAM[i]);

        // panning
        Oszis[i].pan(oszPan);
    }
}

//--------------CONTROL SLIDER-------------
// Chroma
const sDet = document.querySelector('[data-action="detune"]');
sDet.addEventListener(
    "input",
    () => { 
        vv =4/12*int(sDet.value)/1000 ;//normalising slider, 4/12 Chroma -> Major Third
        updateOszi();
    },
    false
);

// change Roughness amount / FM-index
const sRogh= document.querySelector('[data-action="rough"]');
sRogh.addEventListener(
    "input",
    () => {
        modulatorFM.amp(scaleRough(sRogh.value/1000, 0.6));
    },
    false
);

// change Beating Frequncy / AM
const sBeat= document.querySelector('[data-action="beat"]');
sBeat.addEventListener(
    "input",
    () => {
        for (let i = 0; i < nOsz; ++i) {
            ModsAM[i].freq(8*sBeat.value/1000);
        }
    },
    false
);

//change timbre / mean of Gauss
const sBri= document.querySelector('[data-action="bright"]');
sBri.addEventListener(
    "input",
    () => {
        mu = 0.5 + (0.24*sBri.value/1000);
        updateOszi();
    },
    false
);

// change Panning of Chroma
const sCpan = document.querySelector('[data-action="ChPan"]');
sCpan.addEventListener(
    "input",
    () => { 
        oszPan =int(sCpan.value)/500 -1;
        updateOszi();
    },
    false
);

// change Panning of noise
const sNpan = document.querySelector('[data-action="NoiPan"]');
sNpan.addEventListener(
    "input",
    () => { 
        Noise.pan(sNpan.value/500 -1);
    },
    false
);

// change Color of noise
const sNco = document.querySelector('[data-action="NoiCol"]');
sNco.addEventListener(
    "input",
    () => { 
        setEQ(sNco.value);
    },
    false
);


function updateAllParams(){
    vv =4/12*int(sDet.value)/1000;
    mu = 0.5 + (0.24*sBri.value/1000);

    oszPan =int(sCpan.value)/500 -1;
    updateOszi();

    modulatorFM.amp(scaleRough(sRogh.value/1000, 0.6));
    // modulatorAM.freq(8*sBeat.value/1000);
    for (let i = 0; i < nOsz; ++i) {
        ModsAM[i].freq(8*sBeat.value/1000);
    }

    Noise.pan(sNpan.value/500 -1);
    setEQ(sNco.value);
}

//--------------BUTTON ZEUG-------------
function mousePressed() {
    userStartAudio();
    // env.play()
}

function SoundOn(){
    for (let i = 0; i < nOsz; ++i) {
        Oszis[i].start();
    }
    Noise.start()
}
function SoundOff(){
    for (let i = 0; i < nOsz; ++i) {
        Oszis[i].stop();
    }
    Noise.stop();
}

//-------------------- misc functions -------------//

function scaleRough(val, ratio){
    //ratio: wiviel Prozent sind linear
    return (1-ratio)*Math.pow(5,2.8*val)+(ratio*val*Math.pow(5,2.8))
}

function setEQ(v){
    let minGaim=-15; //minimum des EQ
    let VolOffset=0

    for (let i=0; i<eqN.bands.length; i++){    
        mi=i/(eqN.bands.length-1)*minGaim;
        ma=minGaim-i/(eqN.bands.length-1)*minGaim-mi;
        // VolOffset=3-i

        VolOffset=(3-2*Math.pow(((v-100)/900),2))-1

        // console.log(VolOffset)

        eqN.bands[i].gain(mi+(v/1000)*ma+VolOffset)
    }
}