const UI={

    counter:document.getElementById("counter"),

    updateCounter(){

        this.counter.innerHTML=

        "Bar : "

        +Replay.index

        +" / "

        +App.candles.length;

    }

};