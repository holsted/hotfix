hotfix
=========

Hotfix is a chrome extension that lets you push changes from 
Chrome Developer Tools directly to GitHub. 

It utilizes several open source libraries and images which are listed below to give credit where it's due.

Github.js - https://github.com/michael/github

Gatekeeper.js - https://github.com/prose/gatekeeper

Spinner.js - https://github.com/fgnass/spin.js

hotfix icon - http://www.iconblock.com/


Usage
=========

Hotfix is broken down into two parts (each with their respective directory).

1. The actual chrome extension (chrome-extension).

2. A tiny node.js server (server).

First, you should setup a Node.js server and push the contents of the /server directory to your new server. If you have never used Node.js before, don't worry, it's a simple one page script. Hotfix currently resides at hotfix.nodejitsu.com, but any server with Node.js installed will do. 

Next, register a new application on GitHub. Look under Account Settings -> Applications -> Register new application. You'll need to enter a name for your application, and use your new server URL for the Main URL and Callback URL. (For example: hotfix.nodejitsu.com)

After you register your application you'll need to head back to your server and define a couple of environment variables. They are your GitHub client_secret and client_id. For more details refer to Gatekeeper.js. 

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


Lastly, visit chrome://extensions in your broswer and click on load unpacked extension. Locate the chrome-extension folder on your computer and upload it. 

You're done. 