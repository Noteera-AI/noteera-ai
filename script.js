const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const buttons = document.getElementById("buttons");

if(imageInput){

imageInput.addEventListener("change",function(){

const file=this.files[0];

if(file){

preview.src=URL.createObjectURL(file);

preview.style.display="block";

buttons.style.display="block";

}

});

}