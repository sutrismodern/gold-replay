// =========================================
// Trading Engine
// Sprint 3 - Version 1
// =========================================

const Trade = {

    // =====================================
    // DATA
    // =====================================

    nextId: 1,

    pending: [],

    positions: [],

    history: [],

    // =====================================
    // CREATE PENDING ORDER
    // =====================================

    createPending(data) {

        const order = {

            id: this.nextId++,

            type: data.type,

            entry: Number(data.entry),

            sl: Number(data.sl),

            tp: Number(data.tp),

            volume: Number(data.volume ?? 1),

            status: "PENDING",

            createdBar: Replay.index

        };

        this.pending.push(order);

        console.log("Pending Created", order);

        return order;

    },

    // =====================================
    // REMOVE PENDING
    // =====================================

    removePending(id) {

        this.pending = this.pending.filter(

            p => p.id !== id

        );

    },

    // =====================================
    // GET PENDING
    // =====================================

    getPending(id) {

        return this.pending.find(

            p => p.id === id

        );

    },

    // =====================================
    // UPDATE
    // Dipanggil setiap Replay.next()
    // =====================================

    update() {

        this.checkPending();

    },

    // =====================================
    // CHECK PENDING
    // =====================================

    checkPending() {

        if (this.pending.length === 0)
            return;

        const candle = Replay.current();

        const activated = [];

        this.pending.forEach(order => {

            if (
                order.type === "BUY_STOP" &&
                candle.high >= order.entry
            ) {

                activated.push(order);

            }

            if (
                order.type === "SELL_STOP" &&
                candle.low <= order.entry
            ) {

                activated.push(order);

            }

        });

        activated.forEach(order => {

            this.activate(order);

        });

    },

    // =====================================
    // ACTIVATE ORDER
    // =====================================

    activate(order) {

        const position = {

            id: order.id,

            type: order.type === "BUY_STOP"
                ? "BUY"
                : "SELL",

            entry: order.entry,

            sl: order.sl,

            tp: order.tp,

            volume: order.volume,

            openBar: Replay.index,

            status: "OPEN"

        };

        this.positions.push(position);

        this.removePending(order.id);

        console.log("Position Opened", position);

    }

};