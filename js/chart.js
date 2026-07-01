// ===============================
// GOLD REPLAY CHART ENGINE
// ===============================

const chartContainer = document.getElementById("chart");
const status = document.getElementById("status");

App.chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: chartContainer.clientHeight,

    layout: {
        background: {
            color: "#131722"
        },
        textColor: "#D1D4DC"
    },

    grid: {
        vertLines: {
            color: "#1f2937"
        },
        horzLines: {
            color: "#1f2937"
        }
    },

    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal
    },

    rightPriceScale: {
        borderColor: "#485c7b"
    },

    timeScale: {
        borderColor: "#485c7b",
        timeVisible: true
    }
});

App.candleSeries = App.chart.addCandlestickSeries({
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderVisible: false,
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350"
});

window.addEventListener("resize", () => {
    App.chart.applyOptions({
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight
    });
});

const csvFile = document.getElementById("csvFile");
const btnLoad = document.getElementById("btnLoad");

btnLoad.addEventListener("click", () => {
    if (!csvFile.files.length) {
        alert("Pilih file CSV terlebih dahulu.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        parseCSV(event.target.result);
    };

    reader.readAsText(csvFile.files[0]);
});

const Chart = {
    priceLines: [],
    clickHandlers: [],

    render() {
        if (!App.candleSeries) return;

        const timeScale = App.chart.timeScale();
        const visibleRange = timeScale.getVisibleLogicalRange();

        App.candleSeries.setData(Replay.visibleCandles());
        this.renderTradeLines();

        if (visibleRange) {
            timeScale.setVisibleLogicalRange(visibleRange);
        }
    },

    clear() {
        if (!App.candleSeries) return;

        App.candleSeries.setData([]);
        this.clearTradeLines();
    },

    onPriceClick(handler) {
        this.clickHandlers.push(handler);
    },

    emitPriceClick(price) {
        this.clickHandlers.forEach(handler => handler(price));
    },

    priceFromClick(param) {
        if (!param || !param.point || typeof param.point.y !== "number") return null;

        if (typeof App.candleSeries.coordinateToPrice === "function") {
            return App.candleSeries.coordinateToPrice(param.point.y);
        }

        return null;
    },

    renderTradeLines() {
        this.clearTradeLines();

        Trade.pending.forEach(order => {
            this.addPriceLine({
                price: order.entry,
                color: order.type === "BUY_STOP" ? "#22c55e" : "#ef4444",
                title: `#${order.id} ${order.type.replace("_", " ")}`,
                style: this.lineStyle("Dashed")
            });

            this.addRiskLines(order);
        });

        Trade.positions.forEach(position => {
            this.addPriceLine({
                price: position.entry,
                color: position.type === "BUY" ? "#22c55e" : "#ef4444",
                title: `#${position.id} ${position.type} ENTRY`,
                style: this.lineStyle("Solid")
            });

            this.addRiskLines(position);
        });
    },

    addRiskLines(trade) {
        if (trade.sl !== null) {
            this.addPriceLine({
                price: trade.sl,
                color: "#f97316",
                title: `#${trade.id} SL`,
                style: this.lineStyle("Dotted")
            });
        }

        if (trade.tp !== null) {
            this.addPriceLine({
                price: trade.tp,
                color: "#38bdf8",
                title: `#${trade.id} TP`,
                style: this.lineStyle("Dotted")
            });
        }
    },

    addPriceLine(options) {
        const priceLine = App.candleSeries.createPriceLine({
            price: options.price,
            color: options.color,
            lineWidth: 1,
            lineStyle: options.style,
            axisLabelVisible: true,
            title: options.title
        });

        this.priceLines.push(priceLine);
    },

    clearTradeLines() {
        if (!App.candleSeries) return;

        this.priceLines.forEach(priceLine => {
            App.candleSeries.removePriceLine(priceLine);
        });

        this.priceLines = [];
    },

    lineStyle(name) {
        if (!LightweightCharts.LineStyle) return 0;
        return LightweightCharts.LineStyle[name] ?? LightweightCharts.LineStyle.Solid ?? 0;
    }
};

App.chart.subscribeClick(param => {
    const price = Chart.priceFromClick(param);
    if (price === null || !Number.isFinite(price)) return;

    Chart.emitPriceClick(price);
});

status.innerHTML = "Chart Ready - Waiting CSV...";
