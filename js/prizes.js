/* ==========================================================
   SPIN2WIN - KIBAO EDITION
   prizes.js
========================================================== */

/**
 * Default prize configuration.
 * If the admin has previously saved custom prizes,
 * those values will overwrite these defaults.
 */

const DEFAULT_PRIZES = [

    {
        id:1,
        name:"Bucket Hat",
        chance:10,
        color:"#FFE100",
        textColor:"#C62828",
        image:"assets/images/prizes/bucket_hat.png",
        enabled:true,
        type:"win"
    },

    {
        id:2,
        name:"KES 100 Airtime",
        chance:10,
        color:"#43A047",
        textColor:"#FFFFFF",
        image:"assets/images/prizes/credit.png",
        enabled:true,
        type:"win"
    },

    {
        id:3,
        name:"Try Again",
        chance:30,
        color:"#E31E24",
        textColor:"#FFFFFF",
        image:"assets/images/prizes/try_again.png",
        enabled:true,
        type:"retry"
    },

    {
        id:4,
        name:"T-Shirt",
        chance:10,
        color:"#FFE100",
        textColor:"#C62828",
        image:"assets/images/prizes/tshirt.png",
        enabled:true,
        type:"win"
    },

    {
        id:5,
        name:"Chaser",
        chance:10,
        color:"#43A047",
        textColor:"#FFFFFF",
        image:"assets/images/prizes/chaser.png",
        enabled:true,
        type:"win"
    },

    {
        id:6,
        name:"Try Again",
        chance:30,
        color:"#E31E24",
        textColor:"#FFFFFF",
        image:"assets/images/prizes/try_again.png",
        enabled:true,
        type:"retry"
    }

];

/* ==========================================================
   LOCAL STORAGE KEY
========================================================== */

const PRIZE_STORAGE_KEY = "spin2win_prizes";

/* ==========================================================
   LOAD PRIZES
========================================================== */

function loadPrizes(){

    const stored = localStorage.getItem(PRIZE_STORAGE_KEY);

    if(!stored){

        return DEFAULT_PRIZES;

    }

    try{

        return JSON.parse(stored);

    }

    catch(error){

        console.error("Unable to load saved prizes.");

        return DEFAULT_PRIZES;

    }

}

/* ==========================================================
   SAVE PRIZES
========================================================== */

function savePrizes(prizes){

    localStorage.setItem(

        PRIZE_STORAGE_KEY,

        JSON.stringify(prizes)

    );

}

/* ==========================================================
   RESET TO DEFAULTS
========================================================== */

function resetPrizes(){

    savePrizes(DEFAULT_PRIZES);

}

/* ==========================================================
   GET ENABLED PRIZES
========================================================== */

function getEnabledPrizes(){

    return loadPrizes().filter(prize => prize.enabled);

}

/* ==========================================================
   GET TOTAL CHANCE
========================================================== */

function getTotalChance(){

    const prizes = getEnabledPrizes();

    return prizes.reduce(

        (sum, prize) => sum + prize.chance,

        0

    );

}

/* ==========================================================
   WEIGHTED RANDOM SELECTION
========================================================== */

function getRandomPrize(){

    const prizes = getEnabledPrizes();

    const totalChance = getTotalChance();

    let random = Math.random() * totalChance;

    for(const prize of prizes){

        random -= prize.chance;

        if(random <= 0){

            return prize;

        }

    }

    return prizes[0];

}