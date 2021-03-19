const core = require('@actions/core');

const fs = require('fs');
const path = require("path");
const S3 = require('aws-sdk/clients/s3');

async function main() {
  const filePath = core.getInput('path', { required: true });
  const bucket = core.getInput('bucket', { required: true });
  const prefix = core.getInput('prefix');
  const _public = core.getInput('public') == 'true';
  const storage_class = core.getInput('storage-class') || "STANDARD";

  try {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    core.debug(`Reading file: ${filePath}`);
    const fileContents = fs.readFileSync(filePath);

    const params = {
      Bucket: bucket,
      Key: `${prefix && prefix+"/" || ""}${path.basename(filePath)}`,
      StorageClass: `${storage_class}`,
    };

    if (_public) {
      params.ACL = 'public-read';
    }
    core.debug(`Upload parameters:\n${params}`);

    params.Body = fileContents;

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        core.info(`File uploaded successfully. ${data.Location}`);
        core.setOutput('url', data.Location);
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

main().catch(err => core.error(`Failed to upload file: ${err}`));
