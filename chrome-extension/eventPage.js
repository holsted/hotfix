var panelId;

//Listens for a message from devtools.js. Once received opens a new window to authorize the user with GitHub.

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "authorize_me")
        chrome.windows.create({'url' : 'https://github.com/login/oauth/authorize?client_id=4e246d0bfea1c15993a2&scope=user,public_repo', 'type':'popup'});
      sendResponse({farewell: "authorization_sent"});
  });

  chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "reload_background")
            chrome.tabs.sendMessage(panelId, {greeting: "reload_panel"}, function(response) {});

  });

  chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
   panelId = sender.tab.id;
   if (request.greeting == "update resources")
            chrome.tabs.sendMessage(sender.tab.id, {greeting: "show resources", showResource: request.data}, function(response) {});

  });



  chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "logout")
        chrome.windows.create({'url':'https://github.com/logout'}, closeWindow);
        chrome.tabs.executeScript(null,
                        {code:"document.getElementsByTagName('form')[1].style.display='none';document.getElementsByTagName('form')[1].submit();",
                         runAt: "document_end"});

  });


  function closeWindow(closeWindow){
        setTimeout(function(){
        chrome.windows.remove(closeWindow.id);
        },2500);
        localStorage.clear();
        chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(panelId, {greeting: "reload_panel"}, function(response) {});
        }
    });

  };





