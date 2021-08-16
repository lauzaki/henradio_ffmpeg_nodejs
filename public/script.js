const form = document.getElementById("form");
form.addEventListener("submit", submitForm);


function submitForm(e) {
    e.preventDefault();
    const music = document.getElementById("music");
    const formData = new FormData();
    formData.append("music", music.files[0], 'music.wav');
    fetch("/upload", {
        method: 'post',
        body: formData
    })
        .catch((err) => ("Error occured", err));
}