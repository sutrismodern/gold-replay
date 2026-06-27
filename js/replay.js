// =========================================
// Replay Engine
// =========================================

const Replay = {

    // Posisi replay dimulai dari candle ke-100
    start: 0,

    // Candle yang sedang aktif
    index: 0,

    // State untuk sprint berikutnya
    playing: false,
    timer: null,
    speed: 1000,

    // -------------------------------------
    // Ambil candle aktif
    // -------------------------------------
    current() {
        return App.candles[this.index];
    },

    // -------------------------------------
    // Next Candle
    // -------------------------------------
    next() {

    if (!App.candles.length)
        return false;

    if (this.index >= App.candles.length - 1)
        return false;

    this.index++;

    Trade.update();

    Chart.render();

    UI.updateCounter();

    return true;

},

    // -------------------------------------
    // Previous Candle
    // -------------------------------------
    prev() {

        if (!App.candles.length)
        return false;

    if (this.index >= App.candles.length - 1)
        return false;

    this.index++;

    Trade.update();

    Chart.render();

    UI.updateCounter();

    return true;

    },

    // -------------------------------------
    // Reset Replay
    // -------------------------------------
    reset() {

        if (!App.candles.length)
        return false;

    if (this.index >= App.candles.length - 1)
        return false;

    this.index++;

    Trade.update();

    Chart.render();

    UI.updateCounter();

    return true;

    },

    // -------------------------------------
    // Lompat ke candle tertentu
    // -------------------------------------
    goto(index) {

        if (!App.candles.length)
        return false;

    if (this.index >= App.candles.length - 1)
        return false;

    this.index++;

    Trade.update();

    Chart.render();

    UI.updateCounter();

    return true;

    }

};