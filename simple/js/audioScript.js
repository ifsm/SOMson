let mu = 0.5; // Mittelwert für Gauss für Amplituden Gewichtung
let vv = 0; // Zählvariable für Chroma (enspr. phasor bei Tim)

let nOsz = 9; //number of oszilators for chroma
let dim = 0.2; //allgemein Lautstärke abschwächen

function setup() {
    // mimics the autoplay policy
    noCanvas(); //prevent default p5js canvas
    getAudioContext().suspend();

    env = new p5.Envelope();
    env.setADSR(0.2, 0.2, 0.9, 0.1);

    mixGain = new p5.Gain();
    mixGain.amp(0.9);
    mixGain.connect();
    // mixGain.amp(env);

    Oszis = {};
    ModsAM = {};

    for (let i = 0; i < nOsz; ++i) {
        Oszis[i]  = new p5.Oscillator('sine');
        Oszis[i].freq(100);
        Oszis[i].amp(0.1);
        Oszis[i].start();
        Oszis[i].disconnect();
        Oszis[i].connect(mixGain);
        // Oszis[i].amp(env);

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

    // modulatorAM = new p5.Oscillator('sine');
    // modulatorAM.freq(0);
    // modulatorAM.amp(0.5);
    // modulatorAM.disconnect();
    // modulatorAM.start();
    // modulatorAM.scale(-1,1,0.1,1) 

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
        ModsAM[i].amp(0.9*ampy)
        Oszis[i].amp(ModsAM[i]);

    }
     // console.log(Math.pow(2, (vv+8)%9)*25)
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
        // modulatorAM.freq(8*sBeat.value/1000);

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


function updateAllParams(){
    vv =4/12*int(sDet.value)/1000 ;//slider normieren
    mu = 0.5 + (0.24*sBri.value/1000);
    updateOszi();

    modulatorFM.amp(scaleRough(sRogh.value/1000, 0.6));
    // modulatorAM.freq(8*sBeat.value/1000);
    for (let i = 0; i < nOsz; ++i) {
        ModsAM[i].freq(8*sBeat.value/1000);
    }
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
}
function SoundOff(){
    for (let i = 0; i < nOsz; ++i) {
        Oszis[i].stop();
    }
}

function scaleRough(val, ratio){
    //ratio: wiviel Prozent sind linear
    return (1-ratio)*Math.pow(5,2.8*val)+(ratio*val*Math.pow(5,2.8))
}