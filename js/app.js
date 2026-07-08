/* ==========================================================
   SPIN2WIN - KIBAO EDITION
   app.js
========================================================== */

"use strict";

/* ==========================================================
   DOM
========================================================== */

let canvas = null;
let spinButton = null;
let loadingScreen = null;

/* ==========================================================
   STATE
========================================================== */

let isSpinning = false;

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeApplication

);

/* ==========================================================
   INITIALIZE
========================================================== */

function initializeApplication(){

    console.log("Starting Spin2Win...");

    cacheDOM();

    bindEvents();

    initializeModules();

    hideLoadingScreen();

}

/* ==========================================================
   CACHE DOM
========================================================== */

function cacheDOM(){

    canvas = document.getElementById("wheelCanvas");

    spinButton = document.getElementById("spinBtn");

    loadingScreen = document.getElementById("loading-screen");

}

/* ==========================================================
   MODULES
========================================================== */

function initializeModules(){

    initializeModule(

        "Popup",

        initializePopup

    );

    initializeModule(

        "Sounds",

        initializeSounds

    );

    initializeModule(

        "Wheel",

        function(){

            initializeWheel(

                canvas

            );

        }

    );

}

/* ==========================================================
   SAFE MODULE INITIALIZER
========================================================== */

function initializeModule(name,fn){

    if(typeof fn !== "function"){

        console.warn(

            `${name} module missing.`

        );

        return;

    }

    try{

        fn();

        console.log(

            `✓ ${name} initialized`

        );

    }

    catch(error){

        console.error(

            `${name} failed:`,

            error

        );

    }

}

/* ==========================================================
   EVENTS
========================================================== */

function bindEvents(){

    if(!spinButton){

        return;

    }

    spinButton.addEventListener(

        "click",

        startSpin

    );

}

/* ==========================================================
   START SPIN
========================================================== */

function startSpin(){

    if(isSpinning){

        return;

    }

    if(typeof getRandomPrize !== "function"){

        console.error(

            "getRandomPrize() missing."

        );

        return;

    }

    if(typeof spinWheel !== "function"){

        console.error(

            "spinWheel() missing."

        );

        return;

    }

    isSpinning = true;

    spinButton.disabled = true;

    if(typeof playClickSound === "function"){

        playClickSound();

    }

    if(typeof playSpinSound === "function"){

        playSpinSound();

    }

    const prize =

        getRandomPrize();

    spinWheel(

        prize,

        function(){

            finishSpin(

                prize

            );

        }

    );

}

/* ==========================================================
   FINISH SPIN
========================================================== */

function finishSpin(prize){

    try{

        if(typeof recordSpin === "function"){

            recordSpin(

                prize

            );

        }

        if(typeof playResultSound === "function"){

            playResultSound(

                prize

            );

        }

        if(typeof showWinnerPopup === "function"){

            showWinnerPopup(

                prize

            );

        }

    }

    finally{

        isSpinning = false;

        if(spinButton){

            spinButton.disabled = false;

        }

    }

}

/* ==========================================================
   LOADER
========================================================== */

function hideLoadingScreen(){

    if(!loadingScreen){

        return;

    }

    setTimeout(function(){

        loadingScreen.style.opacity = "0";

        loadingScreen.style.pointerEvents = "none";

        setTimeout(function(){

            loadingScreen.style.display = "none";

        },400);

    },500);

}

/* ==========================================================
   DEBUG
========================================================== */

window.addEventListener(

    "error",

    function(event){

        console.error(

            "Application Error:",

            event.message,

            "\nFile:",

            event.filename,

            "\nLine:",

            event.lineno

        );

    }

);