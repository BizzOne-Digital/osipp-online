const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'osipp-products', allowed_formats: ['jpg','jpeg','png','webp'], transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }] } });
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const deleteImage = async (url) => { if (!url || !url.includes('cloudinary')) return; try { const p = url.split('/'); const f = p[p.length-1].split('.')[0]; await cloudinary.uploader.destroy(`${p[p.length-2]}/${f}`); } catch(e) { console.error('Cloudinary del err:', e.message); } };
module.exports = { upload, deleteImage, cloudinary };
