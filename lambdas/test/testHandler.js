'use strict';

const { expect } = require('chai');
const { getAssetDownloadUrl, createAssetUploadData, createAssetUploadUrl, markAssetUploaded } = require('../handler');

describe('Test /asset endpoints', function() {

    let tempId;

    before(async function() {
    });

    after(async function() {
    });

    //if the POST option is used, status code expected to be 201
    it('should create a signed-url for putting asset into s3'), async() => {
        const result = await createAssetUploadUrl();
        expect(result).to.have.property(statusCode, 200);

        const body = JSON.parse(result.body);
        expect(body).to.have.property('upload_url');
        expect(body).to.have.property('id');
        tempId = body.id;
    };

    it('should update the asset as uploaded'), async() => {
        const sampleEvent = {
            pathParameters: {
                assetId : tempId 
            },
            body: {
                "status" : "uploaded"
            }
        };
    
        const result = await markAssetUploaded(sampleEvent);
        expect(result).to.have.property(statusCode, 200);
    
        const body = JSON.parse(result.body);
        expect(body).to.have.property('status', 'uploaded');
    };

    it('should create a signed-url for downloading an asset from s3'), async() => {
        const result = await getAssetDownloadUrl();
        expect(result).to.have.property(statusCode, 200);

        const body = JSON.parse(result.body);
        expect(body).to.have.property('download_url');
        expect(body).to.have.property('id');
        tempId = body.id;
    };

});
