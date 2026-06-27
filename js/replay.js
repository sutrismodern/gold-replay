// =========================================
// Replay Engine
// =========================================

const Replay = {
    get start() {
        return App.replay.start;
    },

    set start(value) {
        App.replay.start = this.clampIndex(value);
    },

    get index() {
        return App.replay.index;
    },

    set index(value) {
        App.replay.index = this.clampIndex(value);
    },

    get playing() {
        return App.replay.playing;
    },

    set playing(value) {
        App.replay.playing = Boolean(value);
    },

    get speed() {
        return App.replay.speed;
    },

    set speed(value) {
        App.replay.speed = Math.max(100, Number(value) || 1000);
    },

    clampIndex(index) {
        if (!App.candles.length) return 0;

        const parsed = Number(index);
        if (!Number.isFinite(parsed)) return 0;

        return Math.min(
            Math.max(Math.floor(parsed), 0),
            App.candles.length - 1
        );
    },

    hasData() {
        return App.candles.length > 0;
    },

    current() {
        if (!this.hasData()) return null;
        return App.candles[this.index];
    },

    visibleCandles() {
        if (!this.hasData()) return [];
        return App.candles.slice(0, this.index + 1);
    },

    sync() {
        Chart.render();
        UI.updateCounter();
        UI.updateStatus();
    },

    reset(startIndex = App.replay.start) {
        if (!this.hasData()) {
            this.index = 0;
            this.sync();
            return false;
        }

        this.index = startIndex;
        Trade.reset();
        Trade.replayTo(this.index);
        this.sync();
        return true;
    },

    next() {
        if (!this.hasData()) return false;
        if (this.index >= App.candles.length - 1) return false;

        this.index++;
        Trade.update(this.current());
        this.sync();
        return true;
    },

    prev() {
        if (!this.hasData()) return false;
        if (this.index <= this.start) return false;

        this.index--;
        Trade.rebuildTo(this.index);
        this.sync();
        return true;
    },

    goto(index) {
        if (!this.hasData()) return false;

        const target = this.clampIndex(index);
        this.index = target;
        Trade.rebuildTo(target);
        this.sync();
        return true;
    },

    play() {
        if (this.playing || !this.hasData()) return false;

        this.playing = true;
        App.replay.timer = setInterval(() => {
            if (!this.next()) this.pause();
        }, this.speed);

        UI.updateStatus();
        return true;
    },

    pause() {
        this.playing = false;

        if (App.replay.timer) {
            clearInterval(App.replay.timer);
            App.replay.timer = null;
        }

        UI.updateStatus();
        return true;
    }
};
