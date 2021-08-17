const path = require('path');

const multer = require("multer")
const fs = require('fs')
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg')
const ffmpeg = createFFmpeg({ log: true })

//Handling of file upload to the server-------------------------------------------------------
//multer setup
const fileStorage = multer.diskStorage({
  destination: 'temp',
  filename: (req, file, cb) => {
    const id = req.headers.socketid;
    let fileName = 'upload_' + id + path.extname(file.originalname);
    cb(null, fileName)
  }
});

//multer middleware
const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 100000000, // 1000000 Bytes = 1 MB
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(flac|ogg|wav)$/)) {
        return cb(new Error('File is not a flac, ogg or wav format'))
      }
      cb(undefined, true)
    }
  }
});

//Compression of the audio file--------------------------------------------------------------
async function compressFile(req, res) {
  const id = req.headers.socketid;
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  ffmpeg.FS('writeFile', 'file.wav', await fetchFile('./temp/upload_' + id +'.wav'));
  await ffmpeg.run('-i', 'file.wav', 'temp.mp3');
  await fs.promises.writeFile('./temp/done__'+ id +'.mp3', ffmpeg.FS('readFile', 'temp.mp3'));
  io.to(id).emit('event','File_Ready');
  fs.unlink(__dirname + '/temp/upload_'+id+'.wav', unlinkCb);
}


// Handling of the file download to the client once it has been compressed--------------------

//middleware for /download route 
function downloadFile(req, res) {
  //user clicked the download button
  const id = req.headers.socketid;
  const file = path.join(__dirname, '/temp/done__' + id + '.mp3')
  res.download(file, 'compressedAudio.mp3', function(err){

    if (err) {
      console.log(err);
    } else {
      deleteDoneFiles(id);
    }
  
  });
}

//delete done files

function deleteDoneFiles (id){
  fs.unlink(__dirname + '/temp/done__'+id+'.mp3', unlinkCb);

  //tell the browser we are done
  io.to(id).emit('event','Done');
}

function unlinkCb(e){
  //console.log(e);
}

// Server-------------------------------------------------------------------------------
const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

//Express
app.use(cors())
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

//Socket.io
io.on('connection', (socket) => {
  console.log('a user connected   '+ socket.id);
  let socketId = socket.id;
  socket.emit('socketId', socketId);
  socket.on('disconnect', () => {
    console.log('disconnect  '+ socketId);
    deleteDoneFiles(socketId);
  });
});

app.post('/upload' , upload.single('audioFile'), compressFile);
app.get('/download', downloadFile);

server.listen(3004, () => {
  console.log(`Example app listening at http://localhost:3004`)
})

