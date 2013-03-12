//This page is mainly used to pass messages between devtools.js
//and panel.js. The two pages cannot directly communicate with each other so we
//have to use this background script to as a middle man. 

//Declared a global here because it's the only way I could figure out 
//how to send a message from authcomplete.js to panel.js. I'm sure there are 
//better ways. 
var panelId;

//Listens for a message from devtools.js. Once received opens a new window to 
//authorize the user with GitHub.
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "authorize_me"){
        panelId = sender.tab.id;
        chrome.windows.create({'url' : 'https://github.com/login/oauth/authorize?client_id=4e246d0bfea1c15993a2&scope=repo', 'width':1100, 'height':650});
        sendResponse({farewell: "authorization_sent"});
    }
});

//Listens for a message form devtools.js to reload panel.html on succesful auth
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "reload_background"){
        chrome.tabs.sendMessage(panelId, {greeting: "reload_panel", data: request.data}, function(response) {});
        sendResponse({greeting:"reloaded"});    
    }
});

//Passes a message from devtools.js to panel.js to update the resources
//panel.js sends a response containing the resourceArray that is created in panel.js
//This is done to ensure that both arrays are in sync
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "update resources"){
        if(sender.tab.id == -1){
            alert("Unfortunately, Hotfix doesn't work properly when Chrome Developer Tools is docked to the main window. Please undock Dev Tools by clicking on the button in the bottom left corner. Then close and reopen Dev Tools.");
        }
        chrome.tabs.sendMessage(sender.tab.id, {greeting: "show resources", showResource: request.data}, function(response) {
            chrome.tabs.sendMessage(sender.tab.id, {greeting: "sync array", data: response.updatedArray}, function(response) {});
        });
    }
});


//When a resource is removed in panel.js this makes passes a message to
//devtools.js to make sure it gets removed in the other array
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "remove resource") {
        chrome.tabs.sendMessage(sender.tab.id, {greeting: "update array", data: request.data}, function(response) {});
    }
});


//receives a message from panel.js when the logout link is clicked. 
//logs the user out of GitHub, clears local storage, and refreshes panel.html
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "logout") {
        chrome.windows.create({'url':'https://github.com/logout'}, function(window){
            setTimeout(function(){
                chrome.windows.remove(window.id);
            },2000);
            
            chrome.tabs.sendMessage(sender.tab.id, {greeting: "unload_panel"}, function(response) {});
        });
        chrome.tabs.executeScript(null,{
            code:"document.getElementsByTagName('form')[1].style.display='none';document.getElementsByTagName('form')[1].submit();",
            runAt: "document_end"
        });
    }
});







