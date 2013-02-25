
	//This is fird whenever Chrome Developer Tools is opened. It's creates the hotfix panel
	chrome.devtools.panels.create("Hotfix", "/icon48.png", "/panel.html", function(extensionPanel) {
		   
	   //Declare an array to hold the resources that are edited. We have to do it 
	   //instead of panel.js because otherwise the user would have to first click on the hotfix panel in order
	   //for us to store the resources they edit. That's why we have to use two arrays and make sure they always in sync
		var resourceArray = [];
	   
	   
		//whenever a resource is added to the page, this checks to see if we have that
		//resource in our resourceArray. If we do, it removes it from the resourceArray and
		//sends a message to panel.js to do the same with the other array. This makes sure
		//we don't persist changes when a page is reloaded.
		chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(resource) {
			for (i=0; i<resourceArray.length;i++){
							if(resourceArray[i].url == resource.url){
								resourceArray.splice(i,1);
								chrome.extension.sendMessage({greeting: "update resources", data: resourceArray}, function(response) {});
							}
					} 
		});
		
		
		//When a resource is edited, this grabs the url and content of the resource and adds it to the resourceArray.
		//When the hotfix panel is shown, we send the full array there to be processed. 
		chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(resource, content) {
				   
			var replaceResource = false;
			
			//replaces the content if we already have the resource in our array.
			//This makes sure we only store the latest changes
			for (i=0; i<resourceArray.length;i++){
					if(resourceArray[i].url == resource.url){
						resourceArray[i].content = content;
						replaceResource = true;
					}
			}
			
			//Otherwise the resource is new and we need to add it to our array
			if (!replaceResource){
				var obj = {
					url: resource.url,
					content: content
				};
				resourceArray.push(obj);
			}
		});
		
		
		//Updates the resourceArray here after the resources have been processed on
		//panel.js. Making sure to keep everything in sync. 
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			if (request.greeting == "sync array"){
			resourceArray = request.data;
			}
		});
		
		//When a resouce is removed on panel.js, remove it from the resourceArray here.
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			if (request.greeting == "update array"){
			var id = request.data;
				for (var key in resourceArray) {
								if (resourceArray[key].hasOwnProperty('id') && resourceArray[key].id == id) {
									resourceArray.splice(key,1);
									console.log(resourceArray);
								}   
				
				}
			
			}
		});
		
		//Fired when the hotfix panel is clicked on. Sends the full resourceArray to panel.js
		//to generate a list of resources that have been edited. 
		extensionPanel.onShown.addListener(function(panelWindow) {
			chrome.extension.sendMessage({greeting: "update resources", data: resourceArray}, function(response) {});
		});
		
	});