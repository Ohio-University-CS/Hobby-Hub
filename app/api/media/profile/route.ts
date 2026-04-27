import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
        folder: 'profile',
        timestamp: timestamp
    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    );

    return Response.json({ signature, timestamp });
}