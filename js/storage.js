const App = {
    candles: [],

    chart: null,
    candleSeries: null,

    replay: {
        start: 0,
        index: 0,
        playing: false,
        timer: null,
        speed: 1000
    },

    trading: {
        nextId: 1,
        pending: [],
        positions: [],
        history: [],
        settings: {
            symbol: "XAUUSD",
            pointValue: 100,
            spread: 0,
            slippage: 0,
            intrabarMode: "conservative"
        }
    },

    drawings: [],

    indicators: {
        ema: [],
        atr: null
    }
};
