const UI = {
    counter: document.getElementById("counter"),
    status: document.getElementById("status"),

    updateCounter() {
        const total = App.candles.length;
        const current = total ? Replay.index + 1 : 0;

        this.counter.innerHTML = `Bar : ${current} / ${total}`;
    },

    updateStatus(message) {
        if (message) {
            this.status.innerHTML = message;
            return;
        }

        if (!App.candles.length) {
            this.status.innerHTML = "Waiting CSV...";
            return;
        }

        const candle = Replay.current();
        const mode = Replay.playing ? "Playing" : "Paused";
        const active = Trade.positions.length;
        const pending = Trade.pending.length;

        this.status.innerHTML = `${mode} | ${new Date(candle.time * 1000).toLocaleString()} | Pending: ${pending} | Open: ${active}`;
    }
};
