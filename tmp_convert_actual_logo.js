import path from 'node:path';
import sharp from 'sharp';

const inputPath =
  'c:/Users/Administrator/Documents/ROWLAND/raffle-project/raffle-app/public/images/icon.jpg';
const output192 =
  'c:/Users/Administrator/Documents/ROWLAND/raffle-project/raffle-app/public/images/icon-192.png';
const output512 =
  'c:/Users/Administrator/Documents/ROWLAND/raffle-project/raffle-app/public/images/icon-512.png';

async function convertLogo() {
  try {
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 192, g: 0, b: 12, alpha: 1 } })
      .toFormat('png')
      .toFile(output192);

    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 192, g: 0, b: 12, alpha: 1 } })
      .toFormat('png')
      .toFile(output512);

    console.log(
      'Successfully converted ACTUAL myRaffle logo (icon.jpg) to icon-192.png and icon-512.png using Sharp!',
    );
  } catch (err) {
    console.error('Error converting logo:', err);
  }
}

convertLogo();
