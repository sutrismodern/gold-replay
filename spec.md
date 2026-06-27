# Gold Replay
Version : 0.1
Status : Development

---

# Vision

Gold Replay adalah aplikasi backtest manual XAUUSD yang berjalan 100% offline.

Tujuan utama aplikasi adalah mensimulasikan trading seperti kondisi live menggunakan data historis tanpa mengetahui candle masa depan.

---

# Roadmap

## Sprint 1 ✅

- Import CSV
- Parser MT4 / MT5
- Candlestick Chart
- Offline
- Dark Theme

---

## Sprint 2 🚧

Replay Engine

- Next Candle
- Previous Candle
- Go To Bar
- Replay Counter

Drawing Tools

- Horizontal Line
- Vertical Line
- Rectangle Zone

---

## Sprint 3

Trading Engine

- Buy Stop
- Sell Stop
- Pending Order
- TP
- SL
- Auto Close

---

## Sprint 4

History Engine

- Trade History
- Export CSV
- Total Pips
- Win Rate
- Profit Factor

---

## Sprint 5

Indicator Engine

- EMA
- ATR

---

# Trading Rules

## Position

- Maksimal 3 posisi aktif.

---

## Order

Order yang diperbolehkan

- Buy Stop
- Sell Stop

Market Order tidak digunakan.

---

## Pending Order

Jarak minimum pending order

2 USD

---

## Multi Position

Dual / Multi Position diperbolehkan.

Rule

Minimal 5 USD dari harga open posisi sebelumnya.

Maksimal 3 posisi.

---

## Trade Management

Metode trading

Set and Forget.

Tidak diperbolehkan

- Edit Entry
- Edit Stop Loss
- Edit Take Profit

Setelah order aktif.

---

## Exit

Trade akan ditutup otomatis apabila

- Take Profit tersentuh
atau
- Stop Loss tersentuh

---

# Replay Rules

Replay hanya berjalan menggunakan

Next Candle

Tidak menggunakan autoplay.

User tidak dapat melihat candle masa depan.

---

# Drawing Tools

Support

- Horizontal Line
- Vertical Line
- Rectangle Zone

Rectangle mempunyai

- Border
- Fill Color
- Transparency

---

# Indicator

EMA

- Custom Period
- Multiple EMA
- Custom Color

ATR

- Custom Period
- Current ATR
- Digunakan sebagai referensi target TP.

---

# History Trade

Kolom

- No
- Action
- Entry Date
- Exit Date
- Entry Price
- Exit Price
- Stop Loss
- Take Profit
- Result
- Total Pips

---

# Statistics

- Total Trade
- Win
- Lose
- Win Rate
- Total Pips
- Profit Factor
- Max Drawdown

---

# Future Features

- Strategy Preset
- Session Save
- Session Load
- Screenshot
- Export Image

---

# Project Structure

gold-replay

index.html

style.css

app.js

/js

chart.js

parser.js

replay.js

drawing.js

trade.js

history.js

indicator.js

storage.js

ui.js

/vendor

lightweight-charts.js

/assets

/data

---

# Development Rules

- Offline First
- Modular Code
- No Framework
- Pure HTML CSS JavaScript
- Lightweight
- Git Versioning