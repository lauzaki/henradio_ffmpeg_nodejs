
const form = document.getElementById("form");
const downloadBtn = document.getElementById("downloadBtn");
const processing = document.getElementById("processing");
const socketId = document.getElementById("socketId");
const menu = document.getElementById("menu");
const againBtn = document.getElementById("againBtn");


form.addEventListener("submit", submitForm);
downloadBtn.addEventListener("click", download);
againBtn.addEventListener("click", refleshPage);

// Handling of the session

let sessionId;

var socket = io.connect();
socket.onAny((event, ...args) => {
    switch (args[0]){
        case 'File_Ready':
            displayDownload();
        break;
        case 'Done':
            menu.style.display = "block";
        break;
        default:
            sessionId = args[0];
            socketId.value = sessionId;
            console.log(sessionId)
  }});



//display download btn
function displayDownload (){
    downloadBtn.style.display = 'block';
    processing.style.display = "none";
}

//download compressed file
function download() {
    downloadBtn.style.display = 'none';
    
     axios({
        method: 'get',
        url: 'download',
        responseType: 'blob',
        headers: {
            'SocketId': sessionId
          }})
      .then( res => {
        const url = URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'compressed_audio.mp3');
        document.body.appendChild(link);
        link.click();
      });
     
  }
  
  //reflesh page on AgainBtn click
  
  function refleshPage(){
      location.reload();
  
  }

// Upload of the audio file

form.addEventListener("submit", submitForm);

function submitForm(e) {
    e.preventDefault();
    form.style.display = "none";
    processing.style.display = "block";
    const audio = document.getElementById("audioFile");
    const formData = new FormData();
    formData.append("audioFile", audio.files[0], 'audio.wav');
    fetch("/upload", {
        method: 'post',
        body: formData,
        headers: {
            'SocketId': sessionId
          },
    })
        .catch((err) => ("Error occured", err));
}