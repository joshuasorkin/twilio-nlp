const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();

class EntityExtractor{
    async analyze(text){
        const document = {
            content:text,
            type:'PLAIN_TEXT'
        }
        const [result] = await client.analyzeEntities({document});
        const entities = result.entities;
        return entities;
    }
}

module.exports = EntityExtractor;