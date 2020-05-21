'use strict';

const Client = require('../index').Client;
const Template = require('../index').Template;
const Signer = require('../index').Signer;
const Field = require('../index').Field;
const config = require('./config');

const client = new Client(config.accessKey, config.businessId);

const fieldData = config.fieldData;

async function main() {
    const documentTemplate = new Template();
    // let documentTemplate = await client.getDocumentByHash(config.templateId);
    console.log('document', documentTemplate);

    let docTemplateObj = documentTemplate.toObject();
    console.log('docTemplateObj', docTemplateObj);
    documentTemplate.setSandbox(true);

    let signers = await documentTemplate.getSigners();
    let fields =  await documentTemplate.getFields() || [];
    console.log('fields', fields);
    fields.forEach(field => {
        console.debug('field', field);

        switch(field.type) {
            case 'signature':
                let signerDef = signers.find(signer => signer.id === field.signer);
                console.log('Signing as ', signerDef);
                let signer = new Signer();
                signer.setRole(signerDef.role);
                signer.setName(config.signerName);
                signer.setEmail(config.signerEmail);
                break;
            default:
                const fieldId = field.identifier;
                if (fieldData.hasOwnProperty(fieldId)) {
                    field.setValue(fieldData[fieldId]);
                    console.debug(field.toObject());
                    // documentTemplate.appendField(field);
                }
                console.log(field.identifier);
        }

    });

    client.createDocumentFromTemplate(documentTemplate).then(function(doc) {
        fields.forEach(field => doc.appendFormField(field));
        console.log(doc.getDocumentHash());
    })
    .catch(function(err) {
        console.log(err);
    });

}
main();
