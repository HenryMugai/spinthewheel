/* ==========================================================
   SPIN2WIN - KIBAO EDITION
   wheel.js

   SECTION 1 : Engine + Renderer
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL ENGINE
========================================================== */

let wheelCanvas = null;
let ctx = null;

let wheelSize = 500;

let centerX = 250;
let centerY = 250;

let radius = 210;

let wheelRotation = 0;

let spinning = false;

let animationFrame = null;

/* ==========================================================
   WHEEL DATA
========================================================== */

let prizes = [];

let sliceAngle = 0;

const imageCache = new Map();

/* ==========================================================
   IMAGE LOADER
========================================================== */

function loadImage(src){

    if(!src){

        return null;

    }

    if(imageCache.has(src)){

        return imageCache.get(src);

    }

    const img = new Image();

    img.src = src;

    img.onload = function(){

        if(ctx){

            drawWheel();

        }

    };

    img.onerror = function(){

        console.warn("Unable to load image:",src);

    };

    imageCache.set(src,img);

    return img;

}

/* ==========================================================
   LOAD PRIZES
========================================================== */

function refreshWheelData(){

    prizes = getEnabledPrizes();

    if(!Array.isArray(prizes)){

        prizes = [];

    }

    if(prizes.length === 0){

        sliceAngle = 0;

        return;

    }

    sliceAngle = (Math.PI * 2) / prizes.length;

    prizes.forEach(prize=>{

        loadImage(prize.image);

    });

}

/* ==========================================================
   RESIZE
========================================================== */

function resizeWheel(){

    if(!wheelCanvas){

        return;

    }

    const wrapper = wheelCanvas.parentElement;

    wheelSize = Math.min(

        wrapper.clientWidth,

        wrapper.clientHeight,

        600

    );

    const dpr = window.devicePixelRatio || 1;

    wheelCanvas.width = wheelSize * dpr;

    wheelCanvas.height = wheelSize * dpr;

    wheelCanvas.style.width = wheelSize + "px";

    wheelCanvas.style.height = wheelSize + "px";

    ctx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );

    centerX = wheelSize / 2;

    centerY = wheelSize / 2;

    radius = wheelSize * 0.46;

}

/* ==========================================================
   DRAW COMPLETE WHEEL
========================================================== */

function drawWheel(){

    if(!ctx){

        return;

    }

    refreshWheelData();

    ctx.clearRect(

        0,

        0,

        wheelSize,

        wheelSize

    );

    if(prizes.length === 0){

        return;

    }

    ctx.save();

    ctx.translate(

        centerX,

        centerY

    );

    ctx.rotate(

        wheelRotation

    );

    drawSlices();

    ctx.restore();

    drawOuterRing();

    drawCenterHub();

    drawPointer();

}

/* ==========================================================
   DRAW ALL SLICES
========================================================== */

function drawSlices(){

    prizes.forEach(function(prize,index){

        drawSlice(

            prize,

            index

        );

    });

}

/* ==========================================================
   DRAW SINGLE SLICE
========================================================== */

function drawSlice(prize,index){

    const start =

        index * sliceAngle - Math.PI / 2;

    const end =

        start + sliceAngle;

    const gradient = ctx.createRadialGradient(

        0,

        0,

        radius * 0.15,

        0,

        0,

        radius

    );

    gradient.addColorStop(

        0,

        "#FFFFFF"

    );

    gradient.addColorStop(

        1,

        prize.color

    );

    ctx.beginPath();

    ctx.moveTo(

        0,

        0

    );

    ctx.arc(

        0,

        0,

        radius,

        start,

        end

    );

    ctx.closePath();

    ctx.fillStyle = gradient;

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    drawPrizeContent(

        prize,

        start + sliceAngle / 2

    );

}

/* ==========================================================
   DRAW PRIZE CONTENT
========================================================== */

function drawPrizeContent(prize,angle){

    ctx.save();

    ctx.rotate(angle);

    const img = imageCache.get(

        prize.image

    );

    /*
    ---------------------------------------
    Draw image only if it loaded correctly
    ---------------------------------------
    */

    if(

        img &&

        img.complete &&

        img.naturalWidth > 0

    ){

        ctx.drawImage(

            img,

            radius * 0.48,

            -20,

            40,

            40

        );

    }

    /*
    ---------------------------------------
    Draw Prize Name
    ---------------------------------------
    */

    ctx.translate(

        radius * 0.78,

        0

    );

    ctx.rotate(

        Math.PI / 2

    );

    ctx.fillStyle =

        prize.textColor || "#111111";

    ctx.font =

        `600 ${Math.max(13,wheelSize*0.03)}px Poppins`;

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(

        prize.name,

        0,

        0

    );

    ctx.restore();

}














/* ==========================================================
   SECTION 2 : Animation
========================================================== */

/* ==========================================================
   ANIMATION SETTINGS
========================================================== */

const SPIN_DURATION = 5500;

const EXTRA_ROTATIONS = 6;

/* ==========================================================
   EASING
========================================================== */

function easeOutQuint(t){

    return 1 - Math.pow(

        1 - t,

        5

    );

}

/* ==========================================================
   ANGLE UTILITIES
========================================================== */

function normalizeAngle(angle){

    const fullRotation = Math.PI * 2;

    angle %= fullRotation;

    if(angle < 0){

        angle += fullRotation;

    }

    return angle;

}

/* ==========================================================
   STOP ANIMATION
========================================================== */

function stopAnimation(){

    if(animationFrame){

        cancelAnimationFrame(

            animationFrame

        );

        animationFrame = null;

    }

}

/* ==========================================================
   POINTER TICK
========================================================== */

let previousTick = -1;

function handlePointerTick(){

    if(

        prizes.length === 0 ||

        sliceAngle === 0

    ){

        return;

    }

    const pointerAngle = normalizeAngle(

        -wheelRotation + Math.PI / 2

    );

    const currentTick = Math.floor(

        pointerAngle / sliceAngle

    );

    if(currentTick !== previousTick){

        previousTick = currentTick;

        if(typeof playTickSound === "function"){

            playTickSound();

        }

    }

}

/* ==========================================================
   ANIMATE WHEEL
========================================================== */

function animateWheel(

    targetRotation,

    callback

){

    stopAnimation();

    spinning = true;

    previousTick = -1;

    const startRotation = wheelRotation;

    const distance =

        targetRotation -

        startRotation;

    const startTime =

        performance.now();

    function frame(now){

        const elapsed =

            now - startTime;

        const progress = Math.min(

            elapsed /

            SPIN_DURATION,

            1

        );

        const eased =

            easeOutQuint(

                progress

            );

        wheelRotation =

            startRotation +

            distance * eased;

        handlePointerTick();

        drawWheel();

        if(progress < 1){

            animationFrame =

                requestAnimationFrame(

                    frame

                );

            return;

        }

        wheelRotation =

            normalizeAngle(

                wheelRotation

            );

        spinning = false;

        animationFrame = null;

        drawWheel();

        if(typeof callback === "function"){

            callback();

        }

    }

    animationFrame =

        requestAnimationFrame(

            frame

        );

}



















/* ==========================================================
   SECTION 3 : Physics
========================================================== */

/* ==========================================================
   POINTER SETTINGS
========================================================== */

const POINTER_ANGLE = -Math.PI / 2;

/* ==========================================================
   FIND PRIZE INDEX
========================================================== */

function getPrizeIndex(prize){

    return prizes.findIndex(

        item => item.id === prize.id

    );

}

/* ==========================================================
   SLICE CENTER ANGLE
========================================================== */

function getSliceCenter(index){

    return (

        (index * sliceAngle) +

        (sliceAngle / 2)

    );

}

/* ==========================================================
   TARGET ROTATION
========================================================== */

function calculateTargetRotation(prize){

    refreshWheelData();

    if(prizes.length === 0){

        return wheelRotation;

    }

    const prizeIndex = getPrizeIndex(prize);

    if(prizeIndex === -1){

        return wheelRotation;

    }

    /*
    -------------------------------------------------------
    Each slice is drawn starting at:

        index * sliceAngle - PI/2

    Therefore the centre of a slice is:

        start + sliceAngle/2
    -------------------------------------------------------
    */

    const sliceCenter =

        (prizeIndex * sliceAngle) -

        (Math.PI / 2) +

        (sliceAngle / 2);

    /*
    -------------------------------------------------------
    Rotate until the slice centre sits directly
    beneath the fixed top pointer.
    -------------------------------------------------------
    */

    let target =

        POINTER_ANGLE -

        sliceCenter;

    while(target <= wheelRotation){

        target += Math.PI * 2;

    }

    target += EXTRA_ROTATIONS * Math.PI * 2;

    return target;

}

/* ==========================================================
   CURRENT SLICE UNDER POINTER
========================================================== */

function getCurrentSliceIndex(){

    if(prizes.length === 0){

        return -1;

    }

    /*
    -------------------------------------------------------
    Pointer is fixed at the top.
    Convert wheel rotation back into wheel space.
    -------------------------------------------------------
    */

    let angle =

        normalizeAngle(

            POINTER_ANGLE -

            wheelRotation +

            Math.PI / 2

        );

    let index = Math.floor(

        angle / sliceAngle

    );

    if(index >= prizes.length){

        index = 0;

    }

    return index;

}

/* ==========================================================
   CURRENT PRIZE
========================================================== */

function getCurrentPrize(){

    const index =

        getCurrentSliceIndex();

    if(index < 0){

        return null;

    }

    return prizes[index];

}

/* ==========================================================
   SPIN STATE
========================================================== */

function canSpin(){

    return (

        !spinning &&

        prizes.length > 0

    );

}


















/* ==========================================================
   SECTION 4 : Effects
========================================================== */

/* ==========================================================
   EFFECT SETTINGS
========================================================== */

const RING_WIDTH = 14;
const HUB_RADIUS = 34;
const HUB_INNER_RADIUS = 12;

/* ==========================================================
   OUTER RING
========================================================== */

function drawOuterRing(){

    ctx.save();

    /*
    ---------------------------------------
    Drop Shadow
    ---------------------------------------
    */

    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    /*
    ---------------------------------------
    Metallic Gold Gradient
    ---------------------------------------
    */

    const gradient = ctx.createLinearGradient(

        centerX - radius,

        centerY - radius,

        centerX + radius,

        centerY + radius

    );

    gradient.addColorStop(0.00,"#FFF9D9");
    gradient.addColorStop(0.18,"#FFE082");
    gradient.addColorStop(0.50,"#D4AF37");
    gradient.addColorStop(0.82,"#F6D365");
    gradient.addColorStop(1.00,"#FFF9D9");

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        radius + 10,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = RING_WIDTH;

    ctx.strokeStyle = gradient;

    ctx.stroke();

    /*
    ---------------------------------------
    White Highlight
    ---------------------------------------
    */

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        radius + 4,

        Math.PI * 1.02,

        Math.PI * 1.78

    );

    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgba(255,255,255,.7)";

    ctx.stroke();

    /*
    ---------------------------------------
    Inner White Border
    ---------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        radius,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = 2;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    ctx.restore();

}

/* ==========================================================
   CENTER HUB
========================================================== */

function drawCenterHub(){

    ctx.save();

    /*
    ---------------------------------------
    Shadow
    ---------------------------------------
    */

    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    /*
    ---------------------------------------
    Hub Gradient
    ---------------------------------------
    */

    const hubGradient = ctx.createRadialGradient(

        centerX - 8,

        centerY - 8,

        2,

        centerX,

        centerY,

        HUB_RADIUS

    );

    hubGradient.addColorStop(0.00,"#FFFFFF");
    hubGradient.addColorStop(0.45,"#FFF5CC");
    hubGradient.addColorStop(0.75,"#E6C34D");
    hubGradient.addColorStop(1.00,"#B8860B");

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        HUB_RADIUS,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = hubGradient;

    ctx.fill();

    ctx.lineWidth = 3;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    /*
    ---------------------------------------
    Inner Circle
    ---------------------------------------
    */

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        HUB_INNER_RADIUS,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = "#FFFFFF";

    ctx.fill();

    /*
    ---------------------------------------
    Gloss Reflection
    ---------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX - 6,

        centerY - 8,

        HUB_RADIUS * 0.42,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = "rgba(255,255,255,.28)";

    ctx.fill();

    ctx.restore();

}

/* ==========================================================
   WHEEL SHADOW
========================================================== */

function drawWheelShadow(){

    ctx.save();

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        radius + 14,

        0,

        Math.PI * 2

    );

    ctx.shadowColor = "rgba(0,0,0,.30)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = "rgba(0,0,0,0.01)";

    ctx.fill();

    ctx.restore();

}












/* ==========================================================
   SECTION 5 : Pointer
========================================================== */

/* ==========================================================
   POINTER SETTINGS
========================================================== */

const POINTER_WIDTH = 42;

const POINTER_HEIGHT = 54;

const POINTER_OFFSET = 22;

const POINTER_BORDER = 2.5;

/* ==========================================================
   DRAW POINTER
========================================================== */

function drawPointer(){

    const x = centerX;

    const y = centerY - radius - POINTER_OFFSET;

    ctx.save();

    ctx.translate(

        x,

        y

    );

    /*
    ---------------------------------------
    Shadow
    ---------------------------------------
    */

    ctx.shadowColor = "rgba(0,0,0,.35)";

    ctx.shadowBlur = 12;

    ctx.shadowOffsetY = 4;

    /*
    ---------------------------------------
    Main Gradient
    ---------------------------------------
    */

    const gradient = ctx.createLinearGradient(

        0,

        0,

        0,

        POINTER_HEIGHT

    );

    gradient.addColorStop(0.00,"#FF8A80");
    gradient.addColorStop(0.40,"#F44336");
    gradient.addColorStop(1.00,"#8B0000");

    /*
    ---------------------------------------
    Pointer Body
    ---------------------------------------
    */

    ctx.beginPath();

    ctx.moveTo(

        0,

        POINTER_HEIGHT

    );

    ctx.lineTo(

        -POINTER_WIDTH / 2,

        4

    );

    ctx.quadraticCurveTo(

        0,

        -12,

        POINTER_WIDTH / 2,

        4

    );

    ctx.closePath();

    ctx.fillStyle = gradient;

    ctx.fill();

    ctx.lineWidth = POINTER_BORDER;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    /*
    ---------------------------------------
    Gloss Highlight
    ---------------------------------------
    */

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.moveTo(

        0,

        POINTER_HEIGHT - 10

    );

    ctx.lineTo(

        -7,

        12

    );

    ctx.quadraticCurveTo(

        0,

        4,

        7,

        12

    );

    ctx.closePath();

    ctx.fillStyle = "rgba(255,255,255,.30)";

    ctx.fill();

    /*
    ---------------------------------------
    Mount Ring
    ---------------------------------------
    */

    const ringGradient = ctx.createRadialGradient(

        0,

        0,

        2,

        0,

        0,

        10

    );

    ringGradient.addColorStop(

        0,

        "#FFFFFF"

    );

    ringGradient.addColorStop(

        1,

        "#C0C0C0"

    );

    ctx.beginPath();

    ctx.arc(

        0,

        0,

        10,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = ringGradient;

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    /*
    ---------------------------------------
    Center Screw
    ---------------------------------------
    */

    const screwGradient = ctx.createRadialGradient(

        -2,

        -2,

        1,

        0,

        0,

        5

    );

    screwGradient.addColorStop(

        0,

        "#FFFFFF"

    );

    screwGradient.addColorStop(

        1,

        "#888888"

    );

    ctx.beginPath();

    ctx.arc(

        0,

        0,

        5,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = screwGradient;

    ctx.fill();

    ctx.restore();

}

/* ==========================================================
   POINTER HIT TEST
========================================================== */

function getPointerAngle(){

    return -Math.PI / 2;

}


























/* ==========================================================
   SECTION 6 : Utilities
========================================================== */

/* ==========================================================
   REDRAW
========================================================== */

function redrawWheel(){

    if(!ctx){

        return;

    }

    drawWheel();

}

/* ==========================================================
   REFRESH
========================================================== */

function refreshWheel(){

    refreshWheelData();

    preloadImages();

    redrawWheel();

}

/* ==========================================================
   PRELOAD IMAGES
========================================================== */

function preloadImages(){

    prizes.forEach(prize=>{

        loadImage(

            prize.image

        );

    });

}

/* ==========================================================
   GETTERS
========================================================== */

function getWheelPrizes(){

    return [...prizes];

}

function getWheelRotation(){

    return wheelRotation;

}

function isWheelSpinning(){

    return spinning;

}

function getWheelSize(){

    return wheelSize;

}

function getWheelRadius(){

    return radius;

}

/* ==========================================================
   RESET
========================================================== */

function resetWheel(){

    stopAnimation();

    spinning = false;

    wheelRotation = 0;

    redrawWheel();

}

/* ==========================================================
   IMAGE CACHE
========================================================== */

function clearImageCache(){

    imageCache.clear();

}

/* ==========================================================
   DEBOUNCE
========================================================== */

function debounce(callback,delay){

    let timeoutId;

    return function(...args){

        clearTimeout(

            timeoutId

        );

        timeoutId = setTimeout(

            ()=>callback(...args),

            delay

        );

    };

}

/* ==========================================================
   WINDOW RESIZE
========================================================== */

const handleResize = debounce(function(){

    if(!wheelCanvas){

        return;

    }

    resizeWheel();

},150);

window.addEventListener(

    "resize",

    handleResize

);














/* ==========================================================
   SECTION 7 : Public API
========================================================== */

/* ==========================================================
   INITIALIZE WHEEL
========================================================== */

function initializeWheel(canvas){

    if(!canvas){

        console.error(

            "initializeWheel(): Canvas element not supplied."

        );

        return false;

    }

    wheelCanvas = canvas;

    ctx = wheelCanvas.getContext(

        "2d",

        {

            alpha: true,

            desynchronized: true

        }

    );

    if(!ctx){

        console.error(

            "Unable to acquire Canvas 2D context."

        );

        return false;

    }

    refreshWheelData();

    preloadImages();

    resizeWheel();

    redrawWheel();

    console.info(

        `Wheel initialized with ${prizes.length} prize(s).`

    );

    return true;

}

/* ==========================================================
   SPIN WHEEL
========================================================== */

function spinWheel(prize,callback){

    if(spinning){

        console.warn(

            "Wheel is already spinning."

        );

        return false;

    }

    if(!prize){

        console.error(

            "spinWheel(): Prize not supplied."

        );

        return false;

    }

    refreshWheelData();

    const targetRotation =

        calculateTargetRotation(

            prize

        );

    animateWheel(

        targetRotation,

        function(){

            wheelRotation =

                normalizeAngle(

                    wheelRotation

                );

            redrawWheel();

            if(typeof callback === "function"){

                callback(prize);

            }

        }

    );

    return true;

}

/* ==========================================================
   RELOAD WHEEL
========================================================== */

function reloadWheel(){

    refreshWheel();

}

/* ==========================================================
   DESTROY
========================================================== */

function destroyWheel(){

    stopAnimation();

    spinning = false;

    wheelRotation = 0;

    prizes = [];

    sliceAngle = 0;

    clearImageCache();

    if(ctx && wheelCanvas){

        ctx.clearRect(

            0,

            0,

            wheelCanvas.width,

            wheelCanvas.height

        );

    }

    wheelCanvas = null;

    ctx = null;

}

/* ==========================================================
   GLOBAL EXPORTS
========================================================== */

window.initializeWheel = initializeWheel;

window.spinWheel = spinWheel;

window.reloadWheel = reloadWheel;

window.destroyWheel = destroyWheel;

window.redrawWheel = redrawWheel;

window.refreshWheel = refreshWheel;

window.resetWheel = resetWheel;

window.getWheelPrizes = getWheelPrizes;

window.getWheelRotation = getWheelRotation;

window.getWheelRadius = getWheelRadius;

window.getWheelSize = getWheelSize;

window.isWheelSpinning = isWheelSpinning;