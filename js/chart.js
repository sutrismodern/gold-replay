// ===============================
// GOLD REPLAY V0.1
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

status.innerHTML = "Chart Ready - Waiting CSV...";

// ======================================
// LOAD CSV
// ======================================

const csvFile = document.getElementById("csvFile");
const btnLoad = document.getElementById("btnLoad");

btnLoad.addEventListener("click", () => {

    if (!csvFile.files.length) {

        alert("Pilih file CSV terlebih dahulu.");

        return;

    }

    const reader = new FileReader();

    reader.onload = function (e) {

        parseCSV(e.target.result);

    };

    reader.readAsText(csvFile.files[0]);

});


// ======================================
// CHART ENGINE
// ======================================

const Chart = {

    render() {

        if (!App.candles.length)
            return;

        App.candleSeries.setData(

            App.candles.slice(
                0,
                Replay.index + 1
            )

        );

    }

};

