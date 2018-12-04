### Preliminary instructions

## Run npm install

## Create a env.js file.
 - make sure AWS credentials file is properly updated in .aws, with Key, Secret Key, etc.
 - update serverless.yml with whatever standards you choose (region, etc.)

## sls deploy to whatever stage you like

#retrieve the Root url for each endpoint after deploy.  This will consist of the 'root url', appended with either /asset or /asset/{some_informaion}.  Update env.js similar to the following example (with your own root):
 - module.exports = {
    BucketName : '',
    UserPoolId :'',
    ClientId : '',
    ApiGatewayRootUrl : 'https://7n9r8esh5k.execute-api.us-east-2.amazonaws.com/dev/',
    UserPoolArn: ''
    };

## create a user pool to work with, or select one you like. This is for testing.
 - update serverless file authorizer arns to match the arn of user pool
 - update the env.js file accordingly


## create a bucket on the Amazon developer console
 - You must explicitly enable versioning on your bucket. By default, versioning is disabled.
 - update serverless file bucket name accordingly
 - update the env.js file accordingly

### INTERFACE

## creating a signed url to upload assets, and how to use the url
The service will have a POST endpoint to upload a new asset.
- POST @ 'ApiGatewayRootUrl' + '/asset', Body: empty
- Sample response will look like: 
{
“upload_url”: <s3-signed-url-for-upload>,
“id”: <asset-id>
}
- The user will now be able to make a *PUT* call to the s3 signed url to upload the asset
- PLEASE NOTE: files must be uploaded using a PUT to the specified url, and *not* a POST.
- If a POST is truly desired, please see handler.js for an available endpoint.


