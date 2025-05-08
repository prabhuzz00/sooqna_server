import cloudinary from './cloudinary.js';

export async function uploadAndTag(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', auto_tagging: 0.6 },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}
