import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

async function testUpload() {
  const region = process.env.AWS_REGION || 'ap-southeast-2';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET;

  console.log('--- Testing S3 Upload ---');
  console.log(`Region: ${region}`);
  console.log(`Bucket: ${bucket}`);
  console.log('--------------------------\n');

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });

  const fileName = `test-upload-${Date.now()}.txt`;
  
  try {
    console.log(`Attempting to upload ${fileName} with ACL "public-read"...`);
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: 'Hello from test-upload script!',
        ContentType: 'text/plain',
        ACL: 'public-read',
      }),
    );
    
    console.log('✅ Success! Upload completed with public-read ACL.');

  } catch (error: any) {
    console.error('❌ Upload Failed:');
    console.error(`Error Code: ${error.code || error.name}`);
    console.error(`Message: ${error.message}`);
    
    if (error.name === 'AccessDenied') {
      console.log('\n--- Probable Cause ---');
      console.log('Your bucket likely has "Block public access" enabled.');
      console.log('Let\'s try uploading WITHOUT ACL "public-read"...');
      
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: `no-acl-${fileName}`,
            Body: 'Hello without ACL!',
            ContentType: 'text/plain',
          }),
        );
        console.log('✅ Success! Upload without ACL worked.');
      } catch (retryError: any) {
        console.error('❌ Even without ACL, upload failed:', retryError.message);
      }
    }
  }
}

testUpload();
