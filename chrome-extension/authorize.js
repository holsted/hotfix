(function(){

	//need to add a check for the state
	
	// Get the authorization code from the url that was returned by GitHub
	var authCode = getAuthCode(window.location.href);	
	
	// Extract the auth code from the original URL
	function getAuthCode(url){
		var error = url.match(/[&\?]error=([^&]+)/);
		if (error) {
			throw 'Error getting authorization code: ' + error[1];
		}
		return url.match(/[&\?]code=([\w\/\-]+)/)[1];
	}
	  
	// Get the access token and pass it on to panel.js to be saved in sessionStorage.
	var accessToken = getAccessToken(authCode, function(response){
		var data = {};
		data.accessTokenDate = new Date().valueOf();
		data.accessToken = JSON.parse(response).token;
		chrome.extension.sendMessage({greeting: "reload_background", data: data}, function(response){});
		callback();
	});
  
	// Get the access token from github and send it to panel.js to be saved in sessionStorage
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

	// Da callback. Once we get there the Oauth flow is complete and we can close the open window. Need to add error handling back in 
	function callback(error) {
		// The following works around bug: crbug.com/84201
		window.open('', '_self', '');
		window.close();
	}  
})();  
	  
	  