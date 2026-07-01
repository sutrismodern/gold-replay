const orderEntry = document.getElementById("orderEntry");
const orderSL = document.getElementById("orderSL");
const orderTP = document.getElementById("orderTP");
const orderVolume = document.getElementById("orderVolume");
const pickHint = document.getElementById("pickHint");
const pickButtons = document.querySelectorAll("[data-pick-price]");

let activePickField = null;
let contextPrice = null;

const chartMenu = document.createElement("div");
chartMenu.id = "chartContextMenu";
chartMenu.className = "chart-menu";
chartMenu.innerHTML = `
    <button data-chart-action="buy-stop">Buy Stop Here</button>
    <button data-chart-action="sell-stop">Sell Stop Here</button>
    <button data-chart-action="entry">Set Entry</button>
    <button data-chart-action="sl">Set SL</button>
    <button data-chart-action="tp">Set TP</button>
`;
document.body.appendChild(chartMenu);

function getCurrentClose() {
    const candle = Replay.current();
    return candle ? candle.close : null;
}

function setEntryFromCurrentClose() {
    const close = getCurrentClose();

    if (close === null) {
        UI.updateStatus("Load CSV first");
        return;
    }

    orderEntry.value = Number(close).toFixed(2);
}

function setOrderPrice(field, price) {
    const value = Number(price).toFixed(2);

    if (field === "entry") orderEntry.value = value;
    if (field === "sl") orderSL.value = value;
    if (field === "tp") orderTP.value = value;

    return value;
}

function readOrderForm(type) {
    return {
        type,
        entry: orderEntry.value,
        sl: orderSL.value,
        tp: orderTP.value,
        volume: orderVolume.value || 1
    };
}

function createPendingOrder(type) {
    if (!App.candles.length) {
        UI.updateStatus("Load CSV first");
        return;
    }

    try {
        Trade.createPending(readOrderForm(type));
        Chart.render();
    } catch (error) {
        UI.updateStatus(error.message);
    }
}

function createPendingAtPrice(type, price) {
    setOrderPrice("entry", price);
    createPendingOrder(type);
}

function closePositionAtMarket(id) {
    const candle = Replay.current();
    const position = Trade.positions.find(item => item.id === id);

    if (!candle || !position) return;

    Trade.closePosition(id, {
        reason: "MANUAL",
        price: candle.close,
        bar: Replay.index,
        time: candle.time
    });

    Chart.render();
    UI.updateStatus("Position closed manually");
}

function setPickMode(field) {
    activePickField = activePickField === field ? null : field;

    pickButtons.forEach(button => {
        button.classList.toggle("active-pick", button.dataset.pickPrice === activePickField);
    });

    chartContainer.classList.toggle("picking-price", Boolean(activePickField));

    if (!activePickField) {
        pickHint.className = "pick-hint";
        pickHint.innerHTML = "Chart pick: off";
        return;
    }

    hideChartMenu();
    pickHint.className = "pick-hint active";
    pickHint.innerHTML = `Click chart to set ${activePickField.toUpperCase()}`;
}

function applyPickedPrice(price) {
    if (!activePickField) return;

    const value = setOrderPrice(activePickField, price);

    UI.updateStatus(`${activePickField.toUpperCase()} set at ${value}`);
    setPickMode(null);
}

function priceFromPointerEvent(event) {
    if (!App.candleSeries || typeof App.candleSeries.coordinateToPrice !== "function") return null;

    const rect = chartContainer.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const price = App.candleSeries.coordinateToPrice(y);

    return Number.isFinite(price) ? price : null;
}

function showChartMenu(event, price) {
    contextPrice = price;
    chartMenu.style.left = `${event.clientX}px`;
    chartMenu.style.top = `${event.clientY}px`;
    chartMenu.classList.add("visible");
}

function hideChartMenu() {
    chartMenu.classList.remove("visible");
    contextPrice = null;
}

document.getElementById("btnNext").onclick = () => {
    Replay.next();
};

document.getElementById("btnPrev").onclick = () => {
    Replay.prev();
};

document.getElementById("btnUseClose").onclick = () => {
    setEntryFromCurrentClose();
};

document.getElementById("btnBuyStop").onclick = () => {
    createPendingOrder("BUY_STOP");
};

document.getElementById("btnSellStop").onclick = () => {
    createPendingOrder("SELL_STOP");
};

pickButtons.forEach(button => {
    button.onclick = () => {
        if (!App.candles.length) {
            UI.updateStatus("Load CSV first");
            return;
        }

        setPickMode(button.dataset.pickPrice);
    };
});

Chart.onPriceClick(price => {
    applyPickedPrice(price);
});

chartContainer.addEventListener("contextmenu", event => {
    event.preventDefault();

    if (!App.candles.length) {
        UI.updateStatus("Load CSV first");
        return;
    }

    const price = priceFromPointerEvent(event);
    if (price === null) return;

    setPickMode(null);
    showChartMenu(event, price);
});

chartMenu.addEventListener("click", event => {
    const button = event.target.closest("[data-chart-action]");
    if (!button || contextPrice === null) return;

    const action = button.dataset.chartAction;

    if (action === "buy-stop") createPendingAtPrice("BUY_STOP", contextPrice);
    if (action === "sell-stop") createPendingAtPrice("SELL_STOP", contextPrice);
    if (["entry", "sl", "tp"].includes(action)) {
        const value = setOrderPrice(action, contextPrice);
        UI.updateStatus(`${action.toUpperCase()} set at ${value}`);
    }

    hideChartMenu();
});

document.addEventListener("click", event => {
    const cancelButton = event.target.closest("[data-cancel-order]");
    const closeButton = event.target.closest("[data-close-position]");

    if (!event.target.closest("#chartContextMenu")) {
        hideChartMenu();
    }

    if (cancelButton) {
        Trade.cancelPending(Number(cancelButton.dataset.cancelOrder));
        Chart.render();
    }

    if (closeButton) {
        closePositionAtMarket(Number(closeButton.dataset.closePosition));
    }
});

window.addEventListener("resize", hideChartMenu);
window.addEventListener("scroll", hideChartMenu, true);

UI.updateCounter();
UI.updateStatus();
