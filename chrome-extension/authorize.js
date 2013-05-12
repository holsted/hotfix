(function(){
    // TODO: add a check for the state param from GitHub.
    
    // Get the authorization code from the url that was returned by GitHub

    var authCode = getAuthCode(window.location.href);   
    

    // Extract the auth code from the URL

    function getAuthCode(url){
        var error = url.match(/[&\?]error=([^&]+)/);
        if (error) {
            throw 'Error getting authorization code: ' + error[1];
        }
        return url.match(/[&\?]code=([\w\/\-]+)/)[1];
    }

      
    // Get the access token and username and pass them on to panel.js to be saved in localStorage.
    
    var accessToken = getAccessToken(authCode, function(response){
        var data = {};
        data.accessTokenDate = new Date().valueOf();
        data.accessToken = JSON.parse(response).token;
        
        var github = new Github({
            token: data.accessToken,
            auth: "oauth"
        });

        var user = github.getUser();

        // Get the details for the current user.

        var currentUser = user.currentUser(function(err, user){

            // Add the username to the data object.

            data.username = user.login;
            chrome.extension.sendMessage({greeting: "reload_background", data: data}, function(response){ 
                callback();
            });
            
        });     
    });

  
    // Get the access token from github and send it to panel.js to be saved in localStorage

    function getAccessToken(authorizationCode, callback){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://hotfix.nodejitsu.com/authenticate/'+ authorizationCode);
        xhr.send();
        xhr.onload = function() {
            callback(xhr.responseText);
        };
        xhr.onerror = function() {
            alert('Sorry, there was an error making the request.');
        }; 
    };


    // Once we get there the Oauth flow is complete and we can close the open window. Need to add error handling back in 
    
    function callback(error) {

        // Check if it's the users first time to authorize with GitHub. If so, show the welcome instructions
        // and save to localStorage.

        if(!localStorage.getItem('hotfix-welcome')){
            document.getElementById('welcome').style.display = 'block';
            localStorage.setItem('hotfix-welcome', 'true');
        }

        // If the user has authorized with GitHub before, just close the window.
        // The following works around bug: crbug.com/84201
        else{
            window.open('', '_self', '');
            window.close();
        }
    }  
})();  
      
