function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const row = lines[i].split(/\t|,|;/).map(value => value.trim());
        if (row.length < 6) continue;

        const date = row[0].replace(/\./g, "-");
        const time = row[1];
        const unix = Math.floor(new Date(`${date}T${time}`).getTime() / 1000);

        const candle = {
            time: unix,
            open: Number(row[2]),
            high: Number(row[3]),
            low: Number(row[4]),
            close: Number(row[5])
        };

        if (
            !Number.isFinite(candle.time) ||
            !Number.isFinite(candle.open) ||
            !Number.isFinite(candle.high) ||
            !Number.isFinite(candle.low) ||
            !Number.isFinite(candle.close)
        ) {
            continue;
        }

        data.push(candle);
    }

    data.sort((a, b) => a.time - b.time);

    App.candles = data;
    App.replay.start = 0;
    App.replay.index = 0;

    Trade.reset(true);
    Replay.reset(0);

    UI.updateStatus(`Loaded ${data.length} candles`);
}
