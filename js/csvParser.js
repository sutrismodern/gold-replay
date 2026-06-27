function parseCSV(text) {

    const lines = text.trim().split(/\r?\n/);

    const data = [];

    for (let i = 1; i < lines.length; i++) {

        if (!lines[i].trim()) continue;

        const row = lines[i].split(/\t|,|;/);

        if (row.length < 6) continue;

        const date = row[0].trim().replace(/\./g, "-");
        const time = row[1].trim();

        const unix = Math.floor(
            new Date(date + "T" + time).getTime() / 1000
        );

        if (isNaN(unix)) continue;

        data.push({

            time: unix,

            open: parseFloat(row[2]),

            high: parseFloat(row[3]),

            low: parseFloat(row[4]),

            close: parseFloat(row[5])

        });

    }

 App.candles = data;

Replay.reset();

    status.innerHTML =
        "Loaded " + data.length + " candles";

    console.log(data);

}