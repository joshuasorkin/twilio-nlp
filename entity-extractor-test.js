
const EntityExtractor = require('./entity-extractor');
const entityExtractor = new EntityExtractor();

async function testIt(){
    let entities = await entityExtractor.analyze("");

    console.log('Entities:');
        entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
            console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
        }
        });
    //return result;
}

/*

    // Imports the Google Cloud client library
    const language = require('@google-cloud/language');

    // Creates a client
    const client = new language.LanguageServiceClient();

async function testIt(){


    const text = 'The queen of England is coming!';

    // Prepares a document, representing the provided text
    const document = {
    content: text,
    type: 'PLAIN_TEXT',
    };

    // Detects entities in the document
    const [result] = await client.analyzeEntities({document});

    const entities = result.entities;

    console.log('Entities:');
    entities.forEach(entity => {
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
        console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
    }
    });
}
*/

testIt();