import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accessKeyId = import.meta.env.VITE_CONTABO_ACCESS_KEY;
const secretAccessKey = import.meta.env.VITE_CONTABO_SECRET_KEY;
const bucketName = import.meta.env.VITE_CONTABO_BUCKET_NAME;
const endpoint = import.meta.env.VITE_CONTABO_ENDPOINT;

if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
  console.warn('Contabo S3 credentials are not set. Please add them to your .env file.');
}

export const s3Client = new S3Client({
  endpoint: endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  forcePathStyle: true,
});

export const uploadVideo = async (file: File, path: string): Promise<string> => {
  if (!bucketName || !endpoint) {
    throw new Error('Contabo S3 credentials are not configured');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: path,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  // Return public URL
  return `${endpoint}/${bucketName}/${path}`;
};
