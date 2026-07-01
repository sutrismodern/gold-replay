const orderEntry = document.getElementById("orderEntry");
const orderSL = document.getElementById("orderSL");
const orderTP = document.getElementById("orderTP");
const orderVolume = document.getElementById("orderVolume");

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
