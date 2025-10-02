import { v2 as cloudinary } from 'cloudinary';

// Cloudinary supports configuration via single CLOUDINARY_URL env var
// Example: cloudinary://<api_key>:<api_secret>@<cloud_name>
const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

if (!CLOUDINARY_URL) {
  throw new Error('Bitte definieren Sie CLOUDINARY_URL in der Umgebungsvariable');
}

cloudinary.config({
  secure: true,
});

export default cloudinary;


