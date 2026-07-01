// =========================================
// Trading Engine
// =========================================

const Trade = {
    get state() {
        if (!App.trading.orders) App.trading.orders = [];
        return App.trading;
    },

    get settings() {
        return this.state.settings;
    },

    get pending() {
        return this.state.pending;
    },

    set pending(value) {
        this.state.pending = value;
    },

    get positions() {
        return this.state.positions;
    },

    set positions(value) {
        this.state.positions = value;
    },

    get history() {
        return this.state.history;
    },

    set history(value) {
        this.state.history = value;
    },

    nextId() {
        return this.state.nextId++;
    },

    reset(clearOrders = false) {
        this.pending = [];
        this.positions = [];
        this.history = [];

        if (clearOrders) {
            this.state.orders = [];
            this.state.nextId = 1;
        }
    },

    createPending(data) {
        const order = this.normalizeOrder(data);

        this.validatePendingDistance(order);
        this.state.orders.push(order);

        if (order.createdBar <= Replay.index) {
            this.pending.push({ ...order });
            this.sortPending();
        }

        return order;
    },

    normalizeOrder(data) {
        const type = String(data.type || "").toUpperCase();

        if (!["BUY_STOP", "SELL_STOP"].includes(type)) {
            throw new Error("Unsupported pending order type");
        }

        const order = {
            id: this.nextId(),
            type,
            entry: Number(data.entry),
            sl: Number(data.sl),
            tp: Number(data.tp),
            volume: Number(data.volume ?? 1),
            status: "PENDING",
            createdBar: Replay.index,
            createdTime: Replay.current()?.time ?? null
        };

        if (!Number.isFinite(order.entry)) throw new Error("Invalid entry price");
        if (!Number.isFinite(order.volume) || order.volume <= 0) throw new Error("Invalid volume");

        order.sl = Number.isFinite(order.sl) ? order.sl : null;
        order.tp = Number.isFinite(order.tp) ? order.tp : null;

        return order;
    },

    validatePendingDistance(order) {
        const candle = Replay.current();
        if (!candle) return;

        const distance = Math.abs(order.entry - candle.close);
        const minimum = Number(this.settings.minPendingDistance) || 0;

        if (distance < minimum) {
            throw new Error(`Pending order minimum distance is ${minimum} USD`);
        }

        if (order.type === "BUY_STOP" && order.entry <= candle.close) {
            throw new Error("Buy Stop must be above current price");
        }

        if (order.type === "SELL_STOP" && order.entry >= candle.close) {
            throw new Error("Sell Stop must be below current price");
        }
    },

    removePending(id) {
        this.pending = this.pending.filter(order => order.id !== id);
    },

    cancelPending(id) {
        const order = this.state.orders.find(item => item.id === id);

        if (order && order.status === "PENDING") {
            order.status = "CANCELLED";
            order.cancelledBar = Replay.index;
            order.cancelledTime = Replay.current()?.time ?? null;
        }

        this.removePending(id);
        return order || null;
    },

    getPending(id) {
        return this.pending.find(order => order.id === id);
    },

    update(candle = Replay.current()) {
        if (!candle) return;

        this.addOrdersForBar(Replay.index);
        this.checkPending(candle);
        this.checkPositions(candle);
    },

    addOrdersForBar(barIndex) {
        this.state.orders.forEach(order => {
            const alreadyPending = this.pending.some(item => item.id === order.id);
            const alreadyOpen = this.positions.some(item => item.id === order.id);
            const alreadyClosed = this.history.some(item => item.id === order.id);

            if (
                order.status === "PENDING" &&
                order.createdBar <= barIndex &&
                !alreadyPending &&
                !alreadyOpen &&
                !alreadyClosed
            ) {
                this.pending.push({ ...order });
            }
        });

        this.sortPending();
    },

    sortPending() {
        this.pending.sort((a, b) => {
            if (a.createdBar !== b.createdBar) return a.createdBar - b.createdBar;
            return a.id - b.id;
        });
    },

    checkPending(candle) {
        if (!this.pending.length) return;

        const activated = [];

        this.sortPending();
        this.pending.forEach(order => {
            if (order.type === "BUY_STOP" && candle.high >= order.entry) {
                activated.push(order);
            }

            if (order.type === "SELL_STOP" && candle.low <= order.entry) {
                activated.push(order);
            }
        });

        activated.forEach(order => this.activate(order, candle));
    },

    activate(order, candle) {
        if (this.positions.some(position => position.id === order.id)) return null;
        if (this.history.some(trade => trade.id === order.id)) {
            this.removePending(order.id);
            return null;
        }

        if (!this.canOpenPosition(order)) return null;

        const direction = order.type === "BUY_STOP" ? "BUY" : "SELL";
        const entry = this.applySlippage(order.entry, direction, "OPEN");

        const position = {
            id: order.id,
            type: direction,
            entry,
            sl: order.sl,
            tp: order.tp,
            volume: order.volume,
            openBar: Replay.index,
            openTime: candle.time,
            status: "OPEN"
        };

        this.positions.push(position);
        this.removePending(order.id);

        const sourceOrder = this.state.orders.find(item => item.id === order.id);
        if (sourceOrder) sourceOrder.status = "OPEN";

        return position;
    },

    canOpenPosition(order) {
        const maxPositions = Number(this.settings.maxPositions) || Infinity;
        if (this.positions.length >= maxPositions) return false;

        const minDistance = Number(this.settings.minPositionDistance) || 0;
        return this.positions.every(position => {
            return Math.abs(position.entry - order.entry) >= minDistance;
        });
    },

    checkPositions(candle) {
        if (!this.positions.length) return;

        const closed = [];

        this.positions.slice().forEach(position => {
            const exit = this.resolveExit(position, candle);
            if (exit) closed.push({ position, exit });
        });

        closed.forEach(({ position, exit }) => this.closePosition(position.id, exit));
    },

    resolveExit(position, candle) {
        const hitSl = this.hitStopLoss(position, candle);
        const hitTp = this.hitTakeProfit(position, candle);

        if (!hitSl && !hitTp) return null;

        if (hitSl && hitTp) {
            return this.settings.intrabarMode === "optimistic"
                ? this.exitPayload(position, "TP", position.tp, candle)
                : this.exitPayload(position, "SL", position.sl, candle);
        }

        if (hitSl) return this.exitPayload(position, "SL", position.sl, candle);
        return this.exitPayload(position, "TP", position.tp, candle);
    },

    hitStopLoss(position, candle) {
        if (position.sl === null) return false;

        if (position.type === "BUY") return candle.low <= position.sl;
        return candle.high >= position.sl;
    },

    hitTakeProfit(position, candle) {
        if (position.tp === null) return false;

        if (position.type === "BUY") return candle.high >= position.tp;
        return candle.low <= position.tp;
    },

    exitPayload(position, reason, price, candle) {
        return {
            reason,
            price: this.applySlippage(price, position.type, "CLOSE"),
            bar: Replay.index,
            time: candle.time
        };
    },

    closePosition(id, exit) {
        if (this.history.some(trade => trade.id === id)) return null;

        const position = this.positions.find(item => item.id === id);
        if (!position) return null;

        const closedTrade = {
            ...position,
            exit: exit.price,
            closeBar: exit.bar,
            closeTime: exit.time,
            closeReason: exit.reason,
            status: "CLOSED",
            profit: this.calculateProfit(position, exit.price)
        };

        this.positions = this.positions.filter(item => item.id !== id);
        this.history.push(closedTrade);

        const sourceOrder = this.state.orders.find(item => item.id === id);
        if (sourceOrder) sourceOrder.status = "CLOSED";

        return closedTrade;
    },

    calculateProfit(position, exitPrice) {
        const direction = position.type === "BUY" ? 1 : -1;
        const points = (exitPrice - position.entry) * direction;
        return points * this.settings.pointValue * position.volume;
    },

    applySlippage(price, direction, action) {
        const slippage = Number(this.settings.slippage) || 0;
        if (!slippage) return price;

        const sign = direction === "BUY"
            ? (action === "OPEN" ? 1 : -1)
            : (action === "OPEN" ? -1 : 1);

        return price + (slippage * sign);
    },

    rebuildTo(index) {
        const orders = this.state.orders.map(order => ({
            ...order,
            status: order.status === "CANCELLED" && order.cancelledBar <= index
                ? "CANCELLED"
                : "PENDING"
        }));

        this.reset(false);
        this.state.orders = orders;

        for (let bar = 0; bar <= index; bar++) {
            const candle = App.candles[bar];
            if (!candle) continue;

            const previousIndex = Replay.index;
            App.replay.index = bar;
            this.update(candle);
            App.replay.index = previousIndex;
        }
    },

    replayTo(index) {
        this.rebuildTo(index);
    }
};
