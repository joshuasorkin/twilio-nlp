const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const WaveFile = require('wavefile').WaveFile;
const port = 8080;
const path = require('path');

//include Google speech to text
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

//configure transcription request
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

    let recognizeStream = null;

    ws.on("message",function incoming(message) {
        const msg = JSON.parse(message);
        switch(msg.event){
            case "connected":
                console.log(`A new call has connected.`);

                //create stream to Google Speech to Text API
                recognizeStream = client
                    .streamingRecognize(request)
                    .on("error",console.error)
                    .on("data",data => {
                        console.log(data.results[0].alternatives[0].transcript);
                    })
                break;
            case "start":
                console.log(`Let flow the Media Stream ${msg.streamSid}`);
                break;
            case "media":
                //write media packets to the recognize stream
                recognizeStream.write(msg.media.payload);
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