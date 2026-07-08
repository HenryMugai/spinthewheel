/* ==========================================================
   SPIN2WIN - KIBAO EDITION
   popup.js
========================================================== */

"use strict";

/* ==========================================================
   DOM
========================================================== */

let popupOverlay = null;

let popupIcon = null;

let popupTitle = null;

let popupSubtitle = null;

let popupMessage = null;

let winnerName = null;

let closeButton = null;

/* ==========================================================
   INITIALIZE
========================================================== */

function initializePopup(){

    popupOverlay = document.getElementById("winnerPopup");

    popupIcon = document.getElementById("popupIcon");

    popupTitle = document.getElementById("popupTitle");

    popupSubtitle = document.getElementById("popupSubtitle");

    popupMessage = document.getElementById("popupMessage");

    winnerName = document.getElementById("winnerName");

    closeButton = document.getElementById("closePopup");

    if(!popupOverlay){

        console.warn("Winner popup not found.");

        return;

    }

    popupOverlay.classList.add("hidden");

    if(closeButton){

        closeButton.addEventListener(

            "click",

            hideWinnerPopup

        );

    }

    popupOverlay.addEventListener(

        "click",

        function(event){

            if(event.target === popupOverlay){

                hideWinnerPopup();

            }

        }

    );

}

/* ==========================================================
   SHOW POPUP
========================================================== */

function showWinnerPopup(prize){

    if(!popupOverlay || !prize){

        return;

    }

    winnerName.textContent = prize.name;

    switch(prize.type){

        /* ===============================
           WIN
        =============================== */

        case "win":

            popupIcon.textContent = "🎉";

            popupTitle.textContent = "Congratulations!";

            popupSubtitle.textContent = "You have won";

            popupMessage.textContent =
                "Please visit the Kibao activation desk to collect your prize.";

            closeButton.textContent = "COLLECT PRIZE";

            popupTitle.style.color = "#2e7d32";

            break;

        /* ===============================
           RETRY
        =============================== */

        case "retry":

            popupIcon.textContent = "🔄";

            popupTitle.textContent = "Try Again!";

            popupSubtitle.textContent = "Almost there!";

            popupMessage.textContent =
                "You have another chance. Press SPIN again.";

            closeButton.textContent = "SPIN AGAIN";

            popupTitle.style.color = "#f57c00";

            break;

        /* ===============================
           LOSE
        =============================== */

        case "lose":

            popupIcon.textContent = "😔";

            popupTitle.textContent = "Better Luck Next Time";

            popupSubtitle.textContent = "Unfortunately";

            popupMessage.textContent =
                "This spin didn't win a prize. We hope you'll try again!";

            closeButton.textContent = "CLOSE";

            popupTitle.style.color = "#d32f2f";

            break;

        /* ===============================
           DEFAULT
        =============================== */

        default:

            popupIcon.textContent = "🎁";

            popupTitle.textContent = "Spin Complete";

            popupSubtitle.textContent = "";

            popupMessage.textContent = "";

            closeButton.textContent = "CLOSE";

    }

    popupOverlay.classList.remove("hidden");

    popupOverlay.classList.add("show");

}

/* ==========================================================
   HIDE
========================================================== */

function hideWinnerPopup(){

    popupOverlay.classList.remove("show");

    popupOverlay.classList.add("hidden");

}

/* ==========================================================
   EXPORTS
========================================================== */

window.initializePopup = initializePopup;

window.showWinnerPopup = showWinnerPopup;

window.hideWinnerPopup = hideWinnerPopup;