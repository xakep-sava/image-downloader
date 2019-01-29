const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const outputPath = 'output';

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

let entryPoint = 'https://adamimages.sbdinc.com/GEM/Stanley/1000x1000_144r/';
let baseUrl = 'https://adamimages.sbdinc.com';
let currentItem = 0;

request(entryPoint, (error, response, body) => {
  if (!error) {
    let $ = cheerio.load(body);
    let images = $('a[href$=jpg]');

    console.log('Count: ' + images.length);

    serialDownload(images, $);
  }
});

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

let serialDownload = (images, $) => {
  if (images.length > currentItem) {
    let imagePath = outputPath + '/' + $(images[currentItem]).text();

    if (fs.existsSync(imagePath)) {
      currentItem++;

      serialDownload(images, $);
    } else {
      download(baseUrl + $(images[currentItem]).attr('href'), imagePath, async () => {
        await waitFor(50);
        console.log($(images[currentItem]).text() + ' - done');

        currentItem++;

        serialDownload(images, $);
      });
    }
  } else {
    console.log('Done');
  }
};

let download = (uri, filename, callback) => {
  if (!callback) {
    callback = () => {
    };
  }

  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
