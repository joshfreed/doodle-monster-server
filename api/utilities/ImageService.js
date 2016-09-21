'use strict';

class ImageService {
  makeThumbnail(imageData) {
    const factor = 3;
    return new Promise((resolve, reject) => {
      require('lwip').open(imageData, "png", (err, image) => {
        if (err) {
          return reject(err);
        }

        const width = image.width() / factor;
        const height = image.height() / factor;

        image.resize(width, height, "lanczos", (err, image) => {
          if (err) {
            return reject(err);
          }

          image.toBuffer('png', (err, buffer) => {
            if (err) {
              return reject(err);
            }

            resolve(buffer);
          });
        });
      });
    });
  }
}

module.exports = ImageService;
