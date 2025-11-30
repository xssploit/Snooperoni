const url = window.location.href;
const urlObj = new URL(url);
const params = new URLSearchParams(urlObj.search);
try{

//get js path from url (parameter js)
let jsFilePath;
try{jsFilePath = params.get('js')}catch(e){jsFilePath = null};

const script = document.createElement('script');
script.src = atob(jsFilePath);
script.onload = () => {
  console.log('Script loaded!');
};
document.head.appendChild(script);
}catch(e){} 
