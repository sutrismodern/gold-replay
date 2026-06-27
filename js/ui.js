const UI = {
    counter: document.getElementById("counter"),
    status: document.getElementById("status"),
    tradeSummary: document.getElementById("tradeSummary"),
    pendingList: document.getElementById("pendingList"),
    positionsList: document.getElementById("positionsList"),
    historyList: document.getElementById("historyList"),

    updateCounter() {
        const total = App.candles.length;
        const current = total ? Replay.index + 1 : 0;

        this.counter.innerHTML = `Bar : ${current} / ${total}`;
    },

    updateStatus(message) {
        if (message) {
            this.status.innerHTML = message;
            this.renderTradingPanel();
            return;
        }

        if (!App.candles.length) {
            this.status.innerHTML = "Waiting CSV...";
            this.renderTradingPanel();
            return;
        }

        const candle = Replay.current();
        const mode = Replay.playing ? "Playing" : "Paused";
        const active = Trade.positions.length;
        const pending = Trade.pending.length;

        this.status.innerHTML = `${mode} | ${new Date(candle.time * 1000).toLocaleString()} | Pending: ${pending} | Open: ${active}`;
        this.renderTradingPanel();
    },

    renderTradingPanel() {
        if (!this.tradeSummary) return;

        this.tradeSummary.innerHTML = `Pending ${Trade.pending.length} | Open ${Trade.positions.length} | Closed ${Trade.history.length}`;
        this.renderPending();
        this.renderPositions();
        this.renderHistory();
    },

    renderPending() {
        if (!Trade.pending.length) {
            this.pendingList.className = "trade-list empty-list";
            this.pendingList.innerHTML = "No pending orders";
            return;
        }

        this.pendingList.className = "trade-list";
        this.pendingList.innerHTML = Trade.pending.map(order => `
            <div class="trade-card">
                <div class="trade-card-header">
                    <span class="trade-type ${order.type === "BUY_STOP" ? "buy" : "sell"}">${order.type.replace("_", " ")}</span>
                    <span class="trade-meta">#${order.id}</span>
                </div>
                <div class="trade-card-row">
                    <span>Entry</span>
                    <strong>${this.formatPrice(order.entry)}</strong>
                </div>
                <div class="trade-card-row trade-meta">
                    <span>SL ${this.formatOptionalPrice(order.sl)}</span>
                    <span>TP ${this.formatOptionalPrice(order.tp)}</span>
                </div>
                <div class="trade-card-actions">
                    <span class="trade-meta">Lot ${order.volume}</span>
                    <button data-cancel-order="${order.id}">Cancel</button>
                </div>
            </div>
        `).join("");
    },

    renderPositions() {
        if (!Trade.positions.length) {
            this.positionsList.className = "trade-list empty-list";
            this.positionsList.innerHTML = "No open positions";
            return;
        }

        this.positionsList.className = "trade-list";
        this.positionsList.innerHTML = Trade.positions.map(position => `
            <div class="trade-card">
                <div class="trade-card-header">
                    <span class="trade-type ${position.type === "BUY" ? "buy" : "sell"}">${position.type}</span>
                    <span class="trade-meta">#${position.id}</span>
                </div>
                <div class="trade-card-row">
                    <span>Entry</span>
                    <strong>${this.formatPrice(position.entry)}</strong>
                </div>
                <div class="trade-card-row trade-meta">
                    <span>SL ${this.formatOptionalPrice(position.sl)}</span>
                    <span>TP ${this.formatOptionalPrice(position.tp)}</span>
                </div>
                <div class="trade-card-actions">
                    <span class="trade-meta">Lot ${position.volume}</span>
                    <button data-close-position="${position.id}">Close</button>
                </div>
            </div>
        `).join("");
    },

    renderHistory() {
        if (!Trade.history.length) {
            this.historyList.className = "trade-list empty-list";
            this.historyList.innerHTML = "No closed trades";
            return;
        }

        this.historyList.className = "trade-list";
        this.historyList.innerHTML = Trade.history.slice().reverse().map(trade => {
            const profitClass = trade.profit >= 0 ? "profit-positive" : "profit-negative";

            return `
                <div class="trade-card">
                    <div class="trade-card-header">
                        <span class="trade-type ${trade.type === "BUY" ? "buy" : "sell"}">${trade.type}</span>
                        <span class="${profitClass}">${this.formatMoney(trade.profit)}</span>
                    </div>
                    <div class="trade-card-row trade-meta">
                        <span>${this.formatPrice(trade.entry)} -> ${this.formatPrice(trade.exit)}</span>
                        <span>${trade.closeReason}</span>
                    </div>
                </div>
            `;
        }).join("");
    },

    formatPrice(value) {
        return Number(value).toFixed(2);
    },

    formatOptionalPrice(value) {
        return value === null ? "-" : this.formatPrice(value);
    },

    formatMoney(value) {
        const amount = Number(value) || 0;
        return `${amount >= 0 ? "+" : ""}${amount.toFixed(2)}`;
    }
};
