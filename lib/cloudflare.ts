// Worker + R2 setup

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    },
});

export async function getPresignedUrl(fileType: string) {
    const ex = fileType.split('/')[1];
    const key = `${uuid()}.${ex}`;

    const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { url, key };
}

export async function uploadFile(file: Buffer, key: string, fileType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        Body: file,
        ContentType: fileType,
    });

    await s3.send(command);

    return { key };
}