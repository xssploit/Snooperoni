const agree1CheckBox = document.getElementById("agree1CheckBox");
const agree2CheckBox = document.getElementById("agree2CheckBox");
const getStartedButton = document.getElementById("getStartedButton");
const hiddenButton = document.getElementById("hiddenButton");


//check agree terms and condition check boxes are checked and redirect to control panel
getStartedButton.addEventListener('click',()=>{
    if(agree1CheckBox.checked === true && agree2CheckBox.checked === true){
        window.location.href = `./control.html`;
    }else{
        hiddenButton.click();
    }
});