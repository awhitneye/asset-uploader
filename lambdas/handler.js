'use strict';
const AWS = require('aws-sdk');
// const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
const uuid = require('uuid');
const { BucketName, ApiGatewayRootUrl } = require('../env');

let s3 = new AWS.S3({
  region: 'us-east-2',
  signatureVersion: 'v4',
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

const genericErrorResponse = (err = 'Internal Error', code = 500) => {
  return {
    statusCode: code,
    headers : CORS,
    body: JSON.stringify({
      message: err,
      input: event,
    }),
  }
};

//GET
module.exports.getAssetDownloadUrl = async (event) => {
  const assetId = event.pathParameters.assetId;
  let signedUrlParams = {
    Bucket: BucketName,
    Key: assetId,
  }

  try {
    const { Metadata } = await S3.headObject(signedUrlParams).promise();
    const status = Metadata["status"];
    // 1. no metadata?
    // 2. no status?
    if(status !== "uploaded") return genericErrorResponse('Asset not uploaded', 503);
    signedUrlParams["Expires"] = 60;
    const signedUrl = s3.getSignedUrl('getObject', signedUrlParams);

    return {
      statusCode: 200,
      headers : CORS,
      body: JSON.stringify({
        message: `GET executed! asset was ${assetId}. SignedUrl is ${signedUrl}.`,
        input: event,
        "download_url" : signedUrl
      }),
    };
  } catch (err) {
    return genericErrorResponse(err);
  }
};

// "PUT" URL
module.exports.createAssetUploadUrl = async (event) => {
  const assetKey = uuid();
  let signedUrlParams = {
    Bucket: BucketName,
    Key: assetKey,
    Expires: 60
  }

  try {
    const signedPostUrl = s3.getSignedUrl('putObject', signedUrlParams);
    return {
      statusCode: 200,
      headers : CORS,
      body: JSON.stringify({
        message: `PUT executed! url is ${signedPostUrl}`,
        input: event,
        "upload_url" : signedPostUrl,
        "id" : assetKey
      }),
    };
  } catch (err) {
    return genericErrorResponse(err);
  }
};

// *POST TO BUCKET*
// --- If a POST is truly desired, it will return information required
// --- for an HTML form submission.  The solution is available here:

// module.exports.createAssetUploadData = async (event) => {
//   const assetKey = uuid();
//   let signedUrlParams = {
//     Bucket: BucketName,
//     Fields:
//      {
        //   key : assetKey
        // },
//     Expires: 60
//   }

//   try {
//     const { url, fields } =  await S3.createPresignedPost(signedUrlParams);
//     return {
//       statusCode: 201,
//       headers : CORS,
//       body: JSON.stringify({
//         message: `POST executed! url is ${signedPostUrl}`,
//         input: event,
//         "upload_url" : url,
//         "form_data" : fields,
//         "id" : assetKey
//       }),
//     };
//   } catch (err) {
//     return genericErrorResponse(err);
//   }
// };

//PUT to update Metadata
module.exports.markAssetUploaded = async (event) => {
  const { assetId } = event.pathParameters;

  let updateAssetParams = {
    Bucket: BucketName,
    Key: assetId,
    CopySource: `${BucketName}/${assetId}`,
    Metadata: {
      "status": "uploaded",
    },
    MetadataDirective: 'REPLACE'
  }
  

  try {
      const copyData = await S3.copyObject(updateAssetParams).promise();
      const OGversion = copyData.CopySourceVersionId;
      const newVersion = copyData.VersionId;
      // make sure that if versioning is accidentally not on, we don't delete the obj
      if (OGversion && OGversion !== newVersion) {
        var deletionParams = {
          Bucket: BucketName,
          Key: assetId,
          BypassGovernanceRetention: true,
          VersionId: OGversion
        };
        await s3.deleteObject(deletionParams).promise();
      }
      
      // delete object in the bucket with the old version
      return {
        statusCode: 200,
        headers : CORS,
        body: JSON.stringify({
          message: `PUT executed! param was ${assetId}`,
          input: event,
          "status" : "uploaded"
        }),
      };
    } catch (err) {
      return genericErrorResponse(err)
    }
  
};
