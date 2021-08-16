const path = require('path');
const express = require('express')
const app = express()
const multer = require("multer")
const fs = require('fs')
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const ffmpeg = createFFmpeg({ log: true });

const port = 3000

//multer setup
const fileStorage = multer.diskStorage({
  destination: 'temp/uploads',
  filename: (req, file, cb) => {
    let fileName = file.fieldname + '_' + path.extname(file.originalname);
    cb(null, fileName)
  }
});

//multer middleware
const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 1000000000 // 1000000 Bytes = 1 MB
  }
});

async function compressFile(req, res) {
  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'file.wav', await fetchFile('./temp/uploads/music_.wav'));
  await ffmpeg.run('-i', 'file.wav', 'test.mp3');
  await fs.promises.writeFile('./temp/compressed/test.mp3', ffmpeg.FS('readFile', 'test.mp3'));
  process.exit(0);
}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/upload' , upload.single('music'), compressFile);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})