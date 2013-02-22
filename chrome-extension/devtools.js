chrome.devtools.panels.create("Hotfix", "/icon48.png", "/panel.html", function(extensionPanel) {
   
   var resourceArray = [];
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(resource) {
        for (i=0; i<resourceArray.length;i++){
                        if(resourceArray[i].url == resource.url){
                            resourceArray.splice(i,1);
                            chrome.extension.sendMessage({greeting: "update resources", data: resourceArray}, function(response) {});
                        }
                } 
    });
    
    chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(resource, content) {
               
                var replaceResource = false;
                for (i=0; i<resourceArray.length;i++){
                        if(resourceArray[i].url == resource.url){
                            resourceArray[i].content = content;
                            replaceResource = true;
                        }
                }
                if (!replaceResource){
                var obj = {
                    url: resource.url,
                    content: content
                };
                
                resourceArray.push(obj);
                }
    });
    
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "sync array"){
		resourceArray = request.data;
		}
	});
	
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "update array"){
		var id = request.data;
		console.log(id);
		for (var key in resourceArray) {
						if (resourceArray[key].hasOwnProperty('id') && resourceArray[key].id == id) {
							resourceArray.splice(key,1);
							console.log(resourceArray);
						}   
		
		}
		
	}
	});
    
    extensionPanel.onShown.addListener(function(panelWindow) {
     chrome.extension.sendMessage({greeting: "update resources", data: resourceArray}, function(response) {});
    });
    
});