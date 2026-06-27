const UI = {

    updateCounter() {

        status.innerHTML =
            "Bar : "
            + Replay.index
            + " / "
            + App.candles.length;

    }

};