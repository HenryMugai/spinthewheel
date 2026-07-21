/* ==========================================================
   SPIN2WIN - KIBAO EDITION
   wheel.js

   PART 1A
   ENGINE + GLOBALS + IMAGE LOADER + RESPONSIVE RESIZE
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL ENGINE
========================================================== */

let wheelCanvas = null;
let ctx = null;

/* Canvas size */

let wheelSize = 500;

/* Renderer scale */

let renderScale = 1;

/* Centre */

let centerX = 250;
let centerY = 250;

/* Main wheel radius */

let radius = 220;

/* Safe drawing radius (keeps artwork inside slices) */

let safeRadius = 200;

/* Device pixel ratio */

let pixelRatio = 1;

/* Rotation */

let wheelRotation = 0;

/* Animation */

let spinning = false;
let animationFrame = null;

/* ==========================================================
   WHEEL DATA
========================================================== */

let prizes = [];
let sliceAngle = 0;

/* ==========================================================
   IMAGE CACHE
========================================================== */

const imageCache = new Map();

let hubLogo = null;

/* ==========================================================
   IMAGE LOADER
========================================================== */

function loadImage(src){

    if(!src) return null;

    if(imageCache.has(src)){

        return imageCache.get(src);

    }

    const img = new Image();

    img.decoding = "async";

    img.loading = "eager";

    img.src = src;

    img.onload = () => {

        if(ctx){

            redrawWheel();

        }

    };

    img.onerror = () => {

        console.warn("Unable to load image:", src);

    };

    imageCache.set(src,img);

    return img;

}

/* ==========================================================
   HUB LOGO
========================================================== */

function loadHubLogo(){

    if(hubLogo){

        return hubLogo;

    }

    hubLogo = new Image();

    hubLogo.decoding = "async";

    hubLogo.src = " ../assets/images/logo/black.png";

    hubLogo.onload = () => {

        console.log("✅ Hub logo loaded:", hubLogo.src);

        redrawWheel();

    };

    hubLogo.onerror = () => {

        console.error("❌ Hub logo failed:", hubLogo.src);

    };

    return hubLogo;

}
/* ==========================================================
   LOAD PRIZES
========================================================== */

function refreshWheelData(){

    prizes = getEnabledPrizes();

    if(!Array.isArray(prizes)){

        prizes = [];

    }

    if(prizes.length===0){

        sliceAngle = 0;

        return;

    }

    sliceAngle = (Math.PI * 2) / prizes.length;

    prizes.forEach(prize=>{

        loadImage(prize.image);

    });

}

/* ==========================================================
   RESPONSIVE RESIZE
========================================================== */

function resizeWheel(){

    if(!wheelCanvas || !ctx){

        return;

    }

    const wrapper = wheelCanvas.parentElement;

    if(!wrapper){

        return;

    }

    const wrapperWidth = wrapper.clientWidth;

    const wrapperHeight = wrapper.clientHeight;

    /*
    --------------------------------------------------------
    Responsive wheel size

    Desktop : up to 620px

    Tablet  : scales naturally

    Mobile  : leaves breathing room
    --------------------------------------------------------
    */

    wheelSize = Math.min(

        wrapperWidth,

        wrapperHeight,

        620

    );

    wheelSize = Math.max(

        wheelSize,

        280

    );

    pixelRatio = Math.max(

        window.devicePixelRatio || 1,

        1

    );

    wheelCanvas.width = Math.round(

        wheelSize * pixelRatio

    );

    wheelCanvas.height = Math.round(

        wheelSize * pixelRatio

    );

    wheelCanvas.style.width = wheelSize + "px";

    wheelCanvas.style.height = wheelSize + "px";

    ctx.setTransform(

        pixelRatio,

        0,

        0,

        pixelRatio,

        0,

        0

    );

    ctx.imageSmoothingEnabled = true;

    ctx.imageSmoothingQuality = "high";

    centerX = wheelSize / 2;

    centerY = wheelSize / 2;

    /*
    --------------------------------------------------------
    Version 3 renderer sizing
    --------------------------------------------------------
    */

    renderScale = wheelSize / 500;

    radius = wheelSize * 0.44;

    safeRadius = radius * 0.88;

    /*
    --------------------------------------------------------
    Preload assets
    --------------------------------------------------------
    */

    loadHubLogo();

    redrawWheel();

}














/* ==========================================================
   PART 1B
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

    if(prizes.length===0){

        return;

    }

    /*
    --------------------------------------------------------
    Wheel shadow
    --------------------------------------------------------
    */

    drawWheelShadow();

    /*
    --------------------------------------------------------
    Rotate wheel
    --------------------------------------------------------
    */

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

    /*
    --------------------------------------------------------
    Static components
    --------------------------------------------------------
    */

    drawOuterRing();

    drawCenterHub();

    drawPointer();

}

/* ==========================================================
   DRAW ALL SLICES
========================================================== */

function drawSlices(){

    if(!prizes.length){

        return;

    }

    for(

        let i = 0;

        i < prizes.length;

        i++

    ){

        drawSlice(

            prizes[i],

            i

        );

    }

}

/* ==========================================================
   DRAW SINGLE SLICE
========================================================== */

function drawSlice(

    prize,

    index

){

    const startAngle =

        (index * sliceAngle) -

        Math.PI / 2;

    const endAngle =

        startAngle +

        sliceAngle;

    /*
    --------------------------------------------------------
    Slice Body
    --------------------------------------------------------
    */

    ctx.beginPath();

    ctx.moveTo(

        0,

        0

    );

    ctx.arc(

        0,

        0,

        radius,

        startAngle,

        endAngle

    );

    ctx.closePath();

    ctx.fillStyle =

        prize.color ||

        "#DDDDDD";

    ctx.fill();

    /*
    --------------------------------------------------------
    Subtle glossy overlay
    --------------------------------------------------------
    */

    ctx.save();

    ctx.clip();

    const gloss =

        ctx.createLinearGradient(

            0,

            -radius,

            0,

            radius

        );

    gloss.addColorStop(

        0,

        "rgba(255,255,255,.30)"

    );

    gloss.addColorStop(

        .35,

        "rgba(255,255,255,.08)"

    );

    gloss.addColorStop(

        1,

        "rgba(0,0,0,.10)"

    );

    ctx.fillStyle = gloss;

    ctx.fillRect(

        -radius,

        -radius,

        radius * 2,

        radius * 2

    );

    ctx.restore();

    /*
    --------------------------------------------------------
    White separator
    --------------------------------------------------------
    */

    ctx.beginPath();

    ctx.moveTo(

        0,

        0

    );

    ctx.lineTo(

        Math.cos(startAngle) * radius,

        Math.sin(startAngle) * radius

    );

    ctx.lineWidth =

        Math.max(

            2,

            radius * 0.009

        );

    ctx.strokeStyle =

        "rgba(255,255,255,.95)";

    ctx.stroke();

    /*
    --------------------------------------------------------
    Gold edge
    --------------------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        0,

        0,

        radius - 1,

        startAngle,

        endAngle

    );

    ctx.lineWidth =

        Math.max(

            1,

            radius * 0.005

        );

    ctx.strokeStyle =

        "rgba(255,215,0,.45)";

    ctx.stroke();

    /*
    --------------------------------------------------------
    Prize Renderer
    --------------------------------------------------------
    */

    drawPrizeContent(

        prize,

        startAngle +

        (sliceAngle / 2)

    );

}



















/* ==========================================================
   PART 1C
   VERSION 3 PRIZE RENDERER
========================================================== */

function drawPrizeContent(prize, angle){

    ctx.save();

    ctx.rotate(angle);

    const img = imageCache.get(prize.image);

    /* ------------------------------------------------------
       RESPONSIVE SCALE
    ------------------------------------------------------ */

    const scale = renderScale;

    /* ------------------------------------------------------
       LAYOUT ENGINE
    ------------------------------------------------------ */

    const layout = {

        image:{

            enabled:true,

            radius:0.49,

            size:radius * 0.22,

            rotation:0,

            offsetY:0

        },

        text:{

            radius:0.77,

            rotation:Math.PI/2,

            offsetY:0,

            font:Math.max(14,18*scale),

            lineHeight:20*scale,

            color:prize.textColor || "#222",

            weight:"700",

            lines:[prize.name]

        }

    };

    /* ------------------------------------------------------
       HELPERS
    ------------------------------------------------------ */

    function hideImage(){

        layout.image.enabled=false;

    }

    function setImage(radiusPercent,sizePercent,offsetY=0,rotation=0){

        layout.image.radius=radiusPercent;

        layout.image.size=radius*sizePercent;

        layout.image.offsetY=offsetY*scale;

        layout.image.rotation=rotation;

    }

    function setText(lines,fontSize){

        layout.text.lines=lines;

        layout.text.font=Math.max(

            13,

            fontSize*scale

        );

        layout.text.lineHeight=

            layout.text.font*0.96;

    }

    function setTextPosition(radiusPercent,offsetY=0){

        layout.text.radius=radiusPercent;

        layout.text.offsetY=offsetY*scale;

    }

    /* ------------------------------------------------------
       PRIZE LAYOUTS
    ------------------------------------------------------ */

    switch(prize.name){

        case "KES 100 Airtime":

            hideImage();

            setText(

                [

                    "FREE 100/-",

                    "SAFARICOM",

                    "AIRTIME"

                ],

                18

            );

            setTextPosition(

                0.64

            );

            break;

        case "Try Again":

            hideImage();

            setText(

                [

                    "TRY",

                    "AGAIN"

                ],

                21

            );

            setTextPosition(

                0.66

            );

            break;

        case "Bucket Hat":

            setImage(

                0.47,

                0.18,

                -8

            );

            setText(

                [

                    "BUCKET",

                    "HAT"

                ],

                17

            );

            setTextPosition(

                0.77,

                12

            );

            break;

        case "T-Shirt":

            setImage(

                0.47,

                0.19,

                -6

            );

            setText(

                [

                    "T-SHIRT"

                ],

                18

            );

            setTextPosition(

                0.77,

                12

            );

            break;

        case "Chaser":

            setImage(

                0.47,

                0.18,

                -6

            );

            setText(

                [

                    "CHASER"

                ],

                18

            );

            setTextPosition(

                0.77,

                12

            );

            break;

    }

    /* ------------------------------------------------------
       DRAW IMAGE
    ------------------------------------------------------ */

    if(

        layout.image.enabled &&

        img &&

        img.complete

    ){

        ctx.save();

        ctx.translate(

            radius*layout.image.radius,

            layout.image.offsetY

        );

        ctx.rotate(

            layout.image.rotation

        );

        ctx.shadowColor=

            "rgba(0,0,0,.18)";

        ctx.shadowBlur=

            radius*0.025;

        ctx.drawImage(

            img,

            -layout.image.size/2,

            -layout.image.size/2,

            layout.image.size,

            layout.image.size

        );

        ctx.restore();

    }

    /* ------------------------------------------------------
       DRAW TEXT
    ------------------------------------------------------ */

    ctx.save();

    ctx.translate(

        radius*layout.text.radius,

        layout.text.offsetY

    );

    ctx.rotate(

        layout.text.rotation

    );

    ctx.fillStyle=

        layout.text.color;

    ctx.font=

        `${layout.text.weight} ${layout.text.font}px Poppins`;

    ctx.textAlign="center";

    ctx.textBaseline="middle";

    ctx.lineJoin="round";

    ctx.strokeStyle="rgba(255,255,255,.20)";

    ctx.lineWidth=1;

    const totalHeight=

        (layout.text.lines.length-1)*

        layout.text.lineHeight;

    layout.text.lines.forEach(

        function(line,index){

            const y=

                (index*layout.text.lineHeight)-

                (totalHeight/2);

            ctx.strokeText(

                line,

                0,

                y

            );

            ctx.fillText(

                line,

                0,

                y

            );

        }

    );

    ctx.restore();

    ctx.restore();

}








/* ==========================================================
   PART 1D
   VERSION 3
   OUTER RING + CENTER HUB
========================================================== */

/* ==========================================================
   OUTER RING
========================================================== */

function drawOuterRing(){

    const outerRadius = radius + (radius * 0.045);

    /*
    ----------------------------------------------------------
    Shadow
    ----------------------------------------------------------
    */

    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,.30)";

    ctx.shadowBlur = radius * 0.08;

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        outerRadius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = "#C69214";

    ctx.fill();

    ctx.restore();

    /*
    ----------------------------------------------------------
    Gold Gradient Ring
    ----------------------------------------------------------
    */

    const gold = ctx.createRadialGradient(

        centerX,

        centerY,

        outerRadius * 0.75,

        centerX,

        centerY,

        outerRadius

    );

    gold.addColorStop(0,"#FFF7B2");
    gold.addColorStop(.18,"#F6DA6C");
    gold.addColorStop(.45,"#D4A92F");
    gold.addColorStop(.75,"#A66D08");
    gold.addColorStop(1,"#6B4300");

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        outerRadius,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = radius * 0.07;

    ctx.strokeStyle = gold;

    ctx.stroke();

    /*
    ----------------------------------------------------------
    Inner Highlight
    ----------------------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        outerRadius - radius * 0.03,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgba(255,255,255,.55)";

    ctx.stroke();

}

/* ==========================================================
   CENTER HUB
========================================================== */

function drawCenterHub(){

    /*
    ----------------------------------------------------------
    Smaller hub than Version 2
    ----------------------------------------------------------
    */

    const hubRadius = radius * 0.13;

    /*
    ----------------------------------------------------------
    Shadow
    ----------------------------------------------------------
    */

    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,.30)";

    ctx.shadowBlur = radius * 0.06;

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        hubRadius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = "#7A5107";

    ctx.fill();

    ctx.restore();

    /*
    ----------------------------------------------------------
    Metallic Face
    ----------------------------------------------------------
    */

    const face = ctx.createRadialGradient(

        centerX,

        centerY,

        hubRadius * 0.20,

        centerX,

        centerY,

        hubRadius

    );

    face.addColorStop(0,"#FFFCE5");
    face.addColorStop(.30,"#F8E189");
    face.addColorStop(.70,"#D2A52A");
    face.addColorStop(1,"#9B6907");

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        hubRadius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = face;

    ctx.fill();

    /*
    ----------------------------------------------------------
    Outer Ring
    ----------------------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        hubRadius,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = radius * 0.015;

    ctx.strokeStyle = "#FFFFFF";

    ctx.stroke();

    /*
    ----------------------------------------------------------
    Inner Ring
    ----------------------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        hubRadius * 0.84,

        0,

        Math.PI * 2

    );

    ctx.lineWidth = radius * 0.01;

    ctx.strokeStyle = "rgba(255,255,255,.45)";

    ctx.stroke();

    /*
    ----------------------------------------------------------
    Logo
    ----------------------------------------------------------
    */

    if(

        hubLogo &&

        hubLogo.complete

    ){

        const logoSize = hubRadius * 1.55;

        ctx.drawImage(

            hubLogo,

            centerX - logoSize / 2,

            centerY - logoSize / 2,

            logoSize,

            logoSize

        );

    }

    /*
    ----------------------------------------------------------
    Glass Reflection
    ----------------------------------------------------------
    */

    ctx.beginPath();

    ctx.arc(

        centerX,

        centerY,

        hubRadius * 0.72,

        Math.PI * 1.05,

        Math.PI * 1.85

    );

    ctx.lineWidth = radius * 0.012;

    ctx.strokeStyle = "rgba(255,255,255,.35)";

    ctx.stroke();

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