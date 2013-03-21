hotfix
=========

hotfix is a chrome extension that lets you push changes from 
Chrome Developer Tools directly to GitHub. 

It utilizes several open source libraries and images which are listed below to give credit where it's due.

Github.js - https://github.com/michael/github

Gatekeeper.js - https://github.com/prose/gatekeeper

Spinner.js - https://github.com/fgnass/spin.js

hotfix icon - http://www.iconblock.com/

![Alt text](/chrome-extension/img/screenshot1.png "hotfix screenshot")


Usage
=========
If you are wanting to use the extension, as is, please download it from the Chrome Web Store. If you want 
to fork the project and set up your own implementation, you can follow the steps below. 

hotfix is comprised of two parts (each with their own respective directory).

1. The actual chrome extension (chrome-extension).

2. A tiny node.js server (server).

First, you will need to setup a Node.js server and push the contents of the /server directory to your new server. You'll probably want to update the package.json file or even fork the project directly from gatekeeper.js. Hotfix is currently hosted at hotfix.nodejitsu.com, but any server with Node.js installed will do. 

Next, register a new application on GitHub. Look under Account Settings -> Applications -> Register new application. You'll need to enter a name for your application, and use your new node.js server URL for the Main URL and Callback URL. (For example: hotfix.nodejitsu.com)

Now, you should add your GitHub client_secret and client_id as environment variables on your server.  

Then, update /chrome-extension/manifest.json. 

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


And update /chrome-extension/authorize.js by replacing hotfix.nodejitsu.com/... with your server address. Leave the /authenticate/+authorizationCode part. 

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


Finally, visit chrome://extensions in your broswer and click on load unpacked extension. Locate the chrome-extension folder on your computer and upload it. 

You're done. 