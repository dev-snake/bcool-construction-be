import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config();

async function testS3() {
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET;

  console.log('--- AWS S3 Configuration ---');
  console.log(`Region: ${region}`);
  console.log(
    `Access Key ID: ${accessKeyId ? '***' + accessKeyId.slice(-4) : 'MISSING'}`,
  );
  console.log(`Secret Access Key: ${secretAccessKey ? '********' : 'MISSING'}`);
  console.log(`Bucket: ${bucket || 'MISSING'}`);
  console.log('-----------------------------\n');

  if (!accessKeyId || !secretAccessKey || !bucket) {
    console.error('❌ Error: Missing S3 credentials or bucket name in .env');
    process.exit(1);
  }

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    console.log(`Testing connection to bucket "${bucket}"...`);

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
    });

    const response = await s3Client.send(command);

    console.log('✅ Success! Successfully connected to S3 and listed objects.');
    console.log('Response metadata:', response.$metadata);

    if (response.Contents && response.Contents.length > 0) {
      console.log(`Found ${response.Contents.length} object(s) in the bucket.`);
    } else {
      console.log('Bucket is empty, but connection was successful.');
    }
  } catch (error: any) {
    console.error('❌ S3 Connection Failed:');
    console.error(`Error Code: ${error.code || error.name}`);
    console.error(`Message: ${error.message}`);

    if (error.name === 'InvalidAccessKeyId') {
      console.error('Tip: Check if your AWS_ACCESS_KEY_ID is correct.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('Tip: Check if your AWS_SECRET_ACCESS_KEY is correct.');
    } else if (error.name === 'NoSuchBucket') {
      console.error(
        `Tip: The bucket "${bucket}" does not exist in region "${region}".`,
      );
    } else if (error.name === 'AccessDenied') {
      console.error(
        'Tip: Your credentials do not have permission to list objects in this bucket.',
      );
    }

    process.exit(1);
  }
}

testS3();
