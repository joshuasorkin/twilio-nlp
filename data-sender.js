//include entity extractor
const EntityExtractor = require('./entity-extractor');
const entityExtractor = new EntityExtractor();

class DataSender{
    sendTranscription(client,content){
        client.send(
            JSON.stringify({
                event:"interim-transcription",
                text:content
            })
        );
    }

    async sendEntities(client,content){
        let entities = entityExtractor.analyze(content);
        client.send(
            JSON.stringify({
                event:"interim-entities",
                text:JSON.stringify(entities)
            })
        )
    }

    sendAll(client,content){
        this.sendTranscription(client,content);
        this.sendEntities(client,content);
    }
}

module.exports = DataSender;