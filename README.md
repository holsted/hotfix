hotfix
=========

hotfix is a chrome extension that lets you push changes from 
Chrome Developer Tools directly to GitHub. 

It utilizes several open source libraries and images which are listed below to give credit where it's due.

Github.js - https://github.com/michael/github
Gatekeeper.js - https://github.com/prose/gatekeeper
Spinner.js - https://github.com/fgnass/spin.js
hotfix icon - http://www.iconblock.com/


Usage
=========

There are two main parts to this project and they are listed in their respective folders. 

1. The actual chrome extension (chrome-extension)

2. A tiny node.js server (server)

First, setup a node.js server and upload the contents of the server directory to your new server. Hotfix currently resides at hotfix.nodejitsu.com but any server will do. 

Next, register a new application on GitHub. It will be under Account Settings -> Applications -> Register new application. 

Enter a name for your application and use your new server URL for the Main URL and Callback URL. (Ex. hotfix.nodejitsu.com)

After you register your application you'll need to head back to your server and specify a couple environment variables; your GitHub client_secret and client_id. For more details refer to Gatekeeper.js. 

Next, update /chrome-extension/manifest.json 

    "permissions": [
        .
        .
        .
        "https://hotfix.nodejitsu.com/",  //replace with your server address here
        .
  	],
	
	"content_scripts": [
  	  {
    	"matches": ["https://hotfix.nodejitsu.com/*"],   //and here
    	.
    	.
  	  }
	],


Then update /chrome-extension/authorize.js and replace hotfix.nodejitsu.com/... with your server address. Leave the /authenticate/+authorizationCode part. 

	function getAccessToken(authorizationCode, callback){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://hotfix.nodejitsu.com/authenticate/'+ authorizationCode); // <-- here
		xhr.send();
		xhr.onload = function() {
			callback(xhr.responseText);
		};
		xhr.onerror = function() {
			alert('Sorry, there was an error making the request.');
		}; 
	};


Last, visit chrome://extensions in your broswer and click on load unpacked extension. Locate the chrome-extension folder on your computer and upload it. 

You're done. 