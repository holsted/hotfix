(function(){
    // TODO: add a check for the state param from GitHub.
    
    // Get the authorization code from the url that was returned by GitHub

    var authCode = getAuthCode(window.location.href, function(code){
          // Get the access token and username and pass them on to panel.js to be saved in localStorage.

          
        var accessToken = getAccessToken(code, function(response){
            
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
            
                chrome.runtime.sendMessage({greeting: "reload_background", data: data}, function(response){      
                    if(!localStorage.getItem('hotfix-welcome')){
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('welcome').style.display = 'block';
                    localStorage.setItem('hotfix-welcome', 'true');
                }

                // If the user has authorized with GitHub before, just close the window.
                // The following works around bug: crbug.com/84201
                else{
                    window.open('', '_self', '');
                    window.close();
                }
            });
            
        });     
    });

});   


    // Extract the auth code from the URL

    function getAuthCode(url, callback){
        var error = url.match(/[&\?]error=([^&]+)/);
        if (error) {
            throw 'Error getting authorization code: ' + error[1];
        }
        var code = url.match(/[&\?]code=([\w\/\-]+)/)[1];
        callback(code);
    }


  
    


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

})();  

