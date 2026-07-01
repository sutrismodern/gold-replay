const orderEntry = document.getElementById("orderEntry");
const orderSL = document.getElementById("orderSL");
const orderTP = document.getElementById("orderTP");
const orderVolume = document.getElementById("orderVolume");
const pickHint = document.getElementById("pickHint");
const pickButtons = document.querySelectorAll("[data-pick-price]");

let activePickField = null;

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

    pickHint.className = "pick-hint active";
    pickHint.innerHTML = `Click chart to set ${activePickField.toUpperCase()}`;
}

function applyPickedPrice(price) {
    if (!activePickField) return;

    const value = Number(price).toFixed(2);

    if (activePickField === "entry") orderEntry.value = value;
    if (activePickField === "sl") orderSL.value = value;
    if (activePickField === "tp") orderTP.value = value;

    UI.updateStatus(`${activePickField.toUpperCase()} set at ${value}`);
    setPickMode(null);
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

document.addEventListener("click", event => {
    const cancelButton = event.target.closest("[data-cancel-order]");
    const closeButton = event.target.closest("[data-close-position]");

    if (cancelButton) {
        Trade.cancelPending(Number(cancelButton.dataset.cancelOrder));
        Chart.render();
    }

    if (closeButton) {
        closePositionAtMarket(Number(closeButton.dataset.closePosition));
    }
});

UI.updateCounter();
UI.updateStatus();
