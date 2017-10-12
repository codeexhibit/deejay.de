var tracks = [];
var selectedTrackElement = undefined;
var selectedIndex = -1;
var currentTime = 0;
var previousColor = undefined;


// Pitch(playback rate) control
var slider = document.createElement("div");
slider.style.background = "#292929";
slider.style.position = "absolute";
slider.style.right = "14px";
slider.style.top = "70px";
slider.style.width = "2px";
slider.style.height = "58px";
outputDiv.appendChild(slider);

var ctrlPitchHeight = 7;
var ctrlPitch = document.createElement("img");
ctrlPitch.setAttribute("id", "ctrlPitch");
ctrlPitch.setAttribute("src", "/assets/lautstaerkeregler.png");
ctrlPitch.setAttribute("ondragstart", "return false");
ctrlPitch.style.position = "absolute";
ctrlPitch.style.right = "10px";
ctrlPitch.style.top = "96px";
ctrlPitch.style.cursor = 'pointer';
outputDiv.appendChild(ctrlPitch);

var spanPitch = document.createElement("span");
spanPitch.setAttribute("id", "spanPitch");
spanPitch.innerHTML = "0.0%";
spanPitch.style.color = "black";
spanPitch.style.position = "absolute";
spanPitch.style.fontSize = "9px";
spanPitch.style.right = "23px";
spanPitch.style.top = "126px";
spanPitch.style.cursor = 'pointer';
outputDiv.appendChild(spanPitch);


function findPageOffsetY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return curtop;
}

var currentPitch = 0;
var maxPitch = 8;
var isPitchDrag = false;
var mouseStartY = undefined;
var pitchStartY = undefined;
var delta = 0;

var sliderY = parseInt(slider.style.top);
var sliderHeight = parseInt(slider.style.height);

function onCtrlPitchPress(e) {
    isPitchDrag = true;
    delta = 0;
    mouseStartY = e.screenY;
    pitchStartY = parseInt(ctrlPitch.style.top) + ctrlPitchHeight / 2;
}

function onMouseMove(e) {
    if (isPitchDrag) {
        delta = e.screenY - mouseStartY;

        if (pitchStartY + delta > sliderY + sliderHeight) {
            delta = sliderY + sliderHeight - pitchStartY;
        } else if (pitchStartY + delta < sliderY) {
            delta = sliderY - pitchStartY;
        }

        var percent = (2 * maxPitch * (pitchStartY + delta - sliderY - sliderHeight / 2) / sliderHeight).toFixed(1);
        setPitch(percent);
    }
}

function onMouseUp(e) {
    isPitchDrag = false;

    if (delta === 0) {
        ctrlPitch.style.top = "96px";
        player.playbackRate = 1;
        spanPitch.innerHTML = "0.0%";
    }
}

function setPitch(percent) {
    if (percent > maxPitch) {
        percent = maxPitch;
    } else if (percent < -maxPitch) {
        percent = -maxPitch;
    }

    percent = Math.round(percent * 10) / 10;

    player.playbackRate = 1 + percent / 100;
    ctrlPitch.style.top = (sliderY - ctrlPitchHeight / 2 + (1 + percent / maxPitch) * sliderHeight / 2) + "px";
    spanPitch.innerHTML = percent.toFixed(1) + "%";

    currentPitch = percent;
}


ctrlPitch.addEventListener("mousedown", onCtrlPitchPress, false);
document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("mouseup", onMouseUp, false);
window.addEventListener("keydown", keyEvent);

var iFrame = document.getElementById("myIframe");

iFrame.onload = function(e) {
    if (iFrame.src === "https://www.deejay.de/content.php?param=/start") {
        var cart = iFrame.contentWindow.document.getElementById("sidebar");
        tracks = cart.getElementsByTagName("dl");
    } else if (iFrame.src === "https://www.deejay.de/content.php?param=/m_Info/sm_Cart") {
        var cart = iFrame.contentWindow.document.getElementsByTagName("tbody")[0];
        tracks = cart.getElementsByTagName("tr");
    } else {
        tracks = iFrame.contentWindow.document.getElementsByClassName("main_container");
    }

    selectedTrackElement = undefined;
    selectedIndex = -1;

    iFrame.contentWindow.document.addEventListener("mousemove", onMouseMove, false);
    iFrame.contentWindow.document.addEventListener("mouseup", onMouseUp, false);
    iFrame.contentWindow.document.addEventListener("keydown", keyEvent);
}

function keyEvent(key) {
    if (document.activeElement &&
        document.activeElement.tagName &&
        (
            document.activeElement.tagName.toLowerCase() === "textarea" ||
            document.activeElement.tagName.toLowerCase() === "input")
    ) {
        return;
    }

    if (iFrame.contentWindow.document.activeElement &&
        iFrame.contentWindow.document.activeElement.tagName &&
        (
            iFrame.contentWindow.document.activeElement.tagName.toLowerCase() === "textarea" ||
            iFrame.contentWindow.document.activeElement.tagName.toLowerCase() === "input")
    ) {
        return;
    }

    if (key.code === "ArrowRight") {
        window.player.currentTime += 5;
        key.preventDefault();
    } else if (key.code === "ArrowLeft") {
        window.player.currentTime -= 5;
        key.preventDefault();
    }
    if (key.code === "ArrowUp") {
        onPrevClick();
        setPitch(0)
        key.preventDefault();
    } else if (key.code === "ArrowDown") {
        onNextClick();
        setPitch(0)
        key.preventDefault();
    }
    if (key.code === "PageDown") {
        selectedIndex++;
        if (selectedIndex >= tracks.length) {
            selectedIndex = tracks.length - 1;
        }
        playSelectedRecord();
        key.preventDefault();
    } else if (key.code === "PageUp") {
        selectedIndex--;
        if (selectedIndex < 0) {
            selectedIndex = 0;
        }
        playSelectedRecord();
        key.preventDefault();
    } else if (key.key === "+") {
        setPitch(currentPitch + 0.1);
        key.preventDefault();
    } else if (key.key === "-") {
        setPitch(currentPitch - 0.1);
        key.preventDefault();
    } else if (key.keyCode === 32) {
        if (window.player.paused || window.player.ended) {

            play(false);
            window.player.currentTime = currentTime;
        } else {
            currentTime = window.player.currentTime;
            pause();
        }
        key.preventDefault();
    }
}

function playSelectedRecord() {
    if (selectedTrackElement) {
        selectedTrackElement.style.background = previousColor;
    }

    selectedTrackElement = tracks[selectedIndex];

    if (selectedTrackElement) {
        previousColor = selectedTrackElement.style.background;
        selectedTrackElement.style.background = "rgba(255, 217, 170, 0.5)";

        if (iFrame.src === "https://www.deejay.de/content.php?param=/start" ||
            iFrame.src === "https://www.deejay.de/content.php?param=/m_Info/sm_Cart") {
            var play = selectedTrackElement.getElementsByClassName("play")[0];
            play.click();
        } else {
            var playAll = selectedTrackElement.getElementsByClassName("playAll")[0];
            playAll.click();

            var openit = selectedTrackElement.getElementsByClassName("openit")[0];
            openit.click();
        }

        window.scroll(0, findPageOffsetY(selectedTrackElement) - 150);
    }
}




/*function getClosest(elem, selector) {
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
        if ( elem.matches( selector ) ) return elem;
    }
    return null;
};*/