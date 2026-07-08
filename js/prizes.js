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
        id: 1,
        name: "Unlucky",
        chance: 15,
        color: "#EF5350",
        textColor: "#FFFFFF",
        image: "assets/images/prizes/unlucky.png",
        enabled: true,
        type: "lose"
    },

    {
        id: 2,
        name: "Hydrate",
        chance: 20,
        color: "#42A5F5",
        textColor: "#FFFFFF",
        image: "assets/images/prizes/hydrate.png",
        enabled: true,
        type: "win"
    },

    {
        id: 3,
        name: "Unlucky",
        chance: 15,
        color: "#E53935",
        textColor: "#FFFFFF",
        image: "assets/images/prizes/unlucky.png",
        enabled: true,
        type: "lose"
    },

    {
        id: 4,
        name: "Bucket Hat",
        chance: 15,
        color: "#FB8C00",
        textColor: "#FFFFFF",
        image: "assets/images/prizes/bucket_hat.png",
        enabled: true,
        type: "win"
    },
        
    {
        id: 5,
        name: "T-Shirt",
        chance: 10,
        color: "#66BB6A",
        textColor: "#FFFFFF",
        image: "assets/images/prizes/tshirt.png",
        enabled: true,
        type: "win"
    },

    {
        id: 6,
        name: "Try Again",
        chance: 10,
        color: "#FFD54F",
        textColor: "#111111",
        image: "assets/images/prizes/try_again.png",
        enabled: true,
        type: "retry"
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