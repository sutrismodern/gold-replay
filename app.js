document.getElementById("btnNext").onclick = () => {
    Replay.next();
};

document.getElementById("btnPrev").onclick = () => {
    Replay.prev();
};

UI.updateCounter();
UI.updateStatus();
