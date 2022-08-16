const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const WaveFile = require('wavefile').WaveFile;
const port = 8080;
const path = require('path');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const request = {
    config: {
        encoding:"MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-GB"
    },
    interimResults:true
}

let chunks = [];

//handle websocket connnection
wss.on("connection",function connection(ws) {
    console.log("New Connection Initiated");
    ws.on("message",function incoming(message) {
        const msg = JSON.parse(message);
        switch(msg.event){
            case "connected":
                console.log(`A new call has connected.`);
                break;
            case "start":
                console.log(`Let flow the Media Stream ${msg.streamSid}`);
                break;
            case "media":
                console.log("Media message...");
                break;
            case "stop":
                console.log(`Call has ended`);
                break;
        }
    });
});

//handle HTTP request
app.get("/", (req,res) => res.sendFile(path.join(__dirname,"/index.html")));

app.post("/", async (req,res) => {
    console.log(req.headers.host);
    res.set("Content-Type","text/xml");
    res.send(
        `<Response>
            <Start>
                <Stream url='wss://${req.headers.host}/stream' />
            </Start>
            <Say>
                Start speaking to see your audio transcribed in the console.
            </Say>
            <Pause length='30' />
        </Response>`
    )
    
});

app.post('/stream',(req,res) =>{

})

//start server
console.log(`listening at port ${port}`);
server.listen(port);