//This script is injected to hotfix.nodejitsu.com to grab the url paramters and 
//redirect back to the chrome extension so we can utilize them. 

// Get all the parameters from the URL.
    var url = window.location.href;
    var params = '?';
    var index = url.indexOf(params);
    if (index > -1) {
      params = url.substring(index);
    }

// Also append the current URL to the params
    params += '&from=' + encodeURIComponent(url);

// Redirect back to the extension itself so that we have priveledged
// access again
    var redirect = chrome.extension.getURL('authorize.html');
    window.location = redirect + params;
