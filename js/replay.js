// =========================================
// Replay Engine
// =========================================

const Replay = {

    index: 100,

    start: 100,

    step: 1,

    next() {

        if (this.index >= App.candles.length - 1)
            return;

        this.index++;

        App.candleSeries.update(
            App.candles[this.index]
        );

        UI.updateCounter();

    },

    prev() {

        if (this.index <= this.start)
            return;

        this.index--;

        App.candleSeries.setData(
            App.candles.slice(0, this.index + 1)
        );

        UI.updateCounter();

    },

    reset(){

    this.index=this.start;

    App.candleSeries.setData(

        App.candles.slice(

            0,

            this.index+1

        )

    );

    UI.updateCounter();

}

};