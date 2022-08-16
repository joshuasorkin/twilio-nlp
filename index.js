const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const WaveFile = require('wavefile').WaveFile;
const port = 8080;
const path = require('path');

let assembly;
let chunks = [];

//handle websocket connnection
wss.on("connection",function connection(ws) {
    console.log("New Connection Initiated");
    ws.on("message",function incoming(message) {
        if (!assembly)
            return console.error("AssemblyAI websocket is not initialized");

        const msg = JSON.parse(message);
        switch(msg.event){
            case "connected":
                console.log(`A new call has connected.`);
                assembly.onerror = console.error;
                const texts={};
                assembly.onmessage = (assemblyMsg) => {
                    console.log("message received from assembly");
                    const res = JSON.parse(assemblyMsg.data);
                    texts[res.audio_start] = res.text;
                    const keys = Object.keys(texts);
                    keys.sort((a,b) => a-b);
                    let msg = '';
                    for (const key of keys){
                        if (texts[key]){
                            msg += ` ${texts[key]}`;
                        }
                    }
                    console.log(msg);
                    wss.clients.forEach(client => {
                        if(client.readyState === WebSocket.OPEN){
                            client.send(
                                JSON.stringify({
                                    event:"interim-transcription",
                                    text: msg
                                })
                            )
                        }
                    })
                }
                break;
            case "start":
                console.log(`Let flow the Media Stream ${msg.streamSid}`);
                break;
            case "media":
                const twilioData = msg.media.payload;
                let wav = new WaveFile();
                wav.fromScratch(1,8000,"8m",Buffer.from(twilioData,"base64"));
                wav.fromMuLaw();
                const twilio64Encoded = wav.toDataURI().split("base64,")[1];
                const twilioAudioBuffer = Buffer.from(twilio64Encoded,"base64");
                chunks.push(twilioAudioBuffer.slice(44));
                //console.log({chunks});
                if (chunks.length >= 5) {
                    const audioBuffer = Buffer.concat(chunks);
                    const encodedAudio = audioBuffer.toString("base64");
                    assembly.send(JSON.stringify({
                        audio_data:encodedAudio
                    }))
                    chunks = [];
                }
                break;
            case "stop":
                console.log(`Call has ended`);
                assembly.send(JSON.stringify({terminate_session:true}));
                break;
        }
    });
});

//handle HTTP request
app.get("/", (req,res) => res.sendFile(path.join(__dirname,"/index.html")));

app.post("/", async (req,res) => {
    /*
    try {
        assembly = await new WebSocket(
            "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=8000&",
            {headers: {authorization: "30bf5aaa75f94b44ad0ffa4950c5c016"}}
        )   
    }
    catch(err){
        console.log(err);
    }
    */
    console.log(req.headers.host);
    res.set("Content-Type","text/xml");
    res.send(
        `<Response>
            <Start>
                <Stream url='wss://${req.headers.host}' />
            </Start>
            <Say>
                Start speaking to see your audio transcribed in the console.
            </Say>
            <Pause length='30' />
        </Response>`
    )
    
});

//start server
console.log(`listening at port ${port}`);
server.listen(port);