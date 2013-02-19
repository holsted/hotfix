var hotfix = new Hotfix();
var local = hotfix.getLocal();

// Get the authorization code from the url that was returned by github
var authCode = getAuthCode(window.location.href);
        
// Extract the auth code from the original URL
function getAuthCode(url){
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
      throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  }
  
// Save the access token and other pertitent details to local storage
var accessToken = getAccessToken(authCode, function(response){
    var data = local.getData();
    data.accessTokenDate = new Date().valueOf();
    for (var name in response) {
      if (response.hasOwnProperty(name) && response[name]) {
        data[name] = response[name];
      }
    }
    local.setSource(data);
    
// Call the authorize function to authorize the current user and complete the oauth flow
    authorize();
});


// Authorize the current user
function authorize(){
    var xhr = new XMLHttpRequest();
    var accessToken = local.getData('accessToken');
    xhr.open('GET', 'https://api.github.com/user?access_token='+ accessToken);
    xhr.send();
    xhr.onload = function() {
        
// Save the username to local storage
        var parseAuthorization = JSON.parse(xhr.responseText);
        var authId = parseAuthorization.id;
        var user = parseAuthorization.login;
        local.setData('username', user);
// Send a message to eventPage.js, which sends a message to panel.js, to reload the page
        chrome.extension.sendMessage({greeting: "reload_background"}, function(response){});
        callback();
    };
    xhr.onerror = function() {
        alert('Sorry, there was an error making the request.');
        callback();
    };
};
      



// Get the access token from github and save it to local storage
function getAccessToken(authorizationCode, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://hotfix.nodejitsu.com/authenticate/'+ authorizationCode);
    xhr.send();
    xhr.onload = function() {
        callback(parseAccessToken(xhr.responseText));
    };

    xhr.onerror = function() {
        alert('Sorry, there was an error making the request.');
    }; 
};

// Parses the XMLHttpRequest response. Could probably use JSON.parse in the getAccessToken function instead?
function parseAccessToken(response) {
    var obj = JSON.parse(response);
    return {
      accessToken: obj.token,
      expiresIn: Number.MAX_VALUE
    };
}


// Da callback. Once we get there the Oauth flow is complete and we can close the open window. Need to add error handling back in 
function callback(error) {
   
    // The following works around bug: crbug.com/84201
    window.open('', '_self', '');
    window.close();
}
  
  
  
  