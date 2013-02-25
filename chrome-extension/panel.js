
//if there is no token in local storage, show the authorization page, else proceed
	if(!localStorage.getItem('hotfix')){
		document.getElementById('unauthorized').style.display = 'block';
		document.getElementById('authorized').style.display = 'none';   
    }
    else{
	
	
	var repoDiv = document.getElementById('repos');
	
	//uses spin.js to start a loading spinner on the repository div
	var smallSpinner = new Spinner({
			color: '#aaa',
			lines:11,
			length: 0,
			width: 3,
			radius: 6,
			trail: 46,
			top: '26px',
			speed: 1.5
	}).spin(repoDiv);
	
	var resourceArray = [];
	
	//get all of the items stored in local storage
	var hotfix = JSON.parse(localStorage['hotfix']);
	
	//get the access token that we have to submit to authenticate with github
	var token = hotfix.accessToken;
	
//initiate github.js instance
    var github = new Github({
        token: token,
        auth: "oauth"
    });
    
//set up a user
    var user = github.getUser();
	
//get the current user from local storage
    var username = hotfix.username;
	

//list the current users repo
    listRepos = user.userRepos(username, function(err, repos){

        var select = document.getElementById('repo-list');

		//stop the spinner that we started on page load
		smallSpinner.stop();
		
		//populates the select list with the users' repos
        for(var i=0; i < repos.length; i++){
            var repo = repos[i].name;
            select.options.add(new Option(repo))
        }
    });


	
	//insert the username with a link to their GitHub profile
    var showUser = document.createElement('li');
	var userName = document.createTextNode(username);
	var userLink = document.createElement('a');
	userLink.appendChild(userName);
	userLink.href = "https://www.github.com/"+username;
	userLink.target = '_blank';
	showUser.appendChild(userLink);
	document.getElementById('username').appendChild(showUser);

	//When the panel is shown, this generates the list of resources that has been edited
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "show resources") {
			
			//clear out any existing resources
			document.getElementById('edited-resources').innerHTML = '';
			
			//populate the resourceArray with the array that was sent in the request
			var resourceArray = request.showResource;
			
			//create container div for holding the resources and fill it
            var editedResources = document.getElementById('edited-resources');
			
			
			//This part gets a little messy. We have to dynamically create several divs and spans for 
			//resource that was edited. ToDo: See if there is a better way to do this. 
			
			
			for (i=0; i<resourceArray.length;i++){
               
				resourceArray[i].id = i;
				
				// create an achor element and set the href and target 
				var a = document.createElement('a');
				a.href = resourceArray[i].url;
				a.target = '_blank';
				
				
				//extract the path and hostname from the anchor element
				var resourcePath = a.pathname;
				var hostName = a.hostname;
				var host = hostName.replace(/^www\./,'');
				var fileName = resourcePath.substring(resourcePath.lastIndexOf('/')+1);
				
				//remove the leading / from the resourcePath and add it to the resourceArray
				if (resourcePath.charAt(0) == "/") {
				resourcePath = resourcePath.substr(1);
				}
				
                resourceArray[i].path = resourcePath;
				
				
				//create a div to hold all the data about this resource and give it an id
				var resourceDiv = document.createElement('div');
				resourceDiv.id = 'resource-' + i;
				resourceDiv.className = "resource";
				
				
				//create a span for the source(domain) that this resource came from 
				var source = document.createElement('div');
				source.className = 'source';
				var domainText = document.createTextNode(host);
				var fileText = document.createTextNode('Resource: ');
				var fileNameText = document.createTextNode(fileName);
				var file = document.createElement('li');
				
				var fileSpan = document.createElement('span');
				fileSpan.appendChild(fileNameText);
				fileSpan.className = ('file-name')
				
				file.appendChild(fileText);
				file.appendChild(fileSpan);
				file.className = 'file';
				source.appendChild(domainText);
				
				
				//add the source span to the container div
				resourceDiv.appendChild(source);
				resourceDiv.appendChild(file);
				
				//create an li element and add the full url to it
				var li = document.createElement('li');
				var linkText = document.createTextNode(resourcePath);
				var fileLabel = document.createTextNode('Full commit path: ');
				
				//append the anchor element to the li element we just created
				a.appendChild(linkText);
				li.appendChild(fileLabel);
				li.appendChild(a);
				
				
				//create a span to hold the remove icon and give it a class 
				var removeSpan = document.createElement('span');
				removeSpan.className = 'remove-resource';
				
				//append the span to the li element
				source.appendChild(removeSpan);
				
				//apend the entire li element to the container div
				resourceDiv.appendChild(li); 
				
				//create a div to hold the commit label, input(commit message), and commit button, and name it
				var commitWrapper = document.createElement('div');
				commitWrapper.className = 'commit-wrapper';
				
				//create a label for the commit message textarea, add text to it, and append it to the wrapper
				var commitInputLabel = document.createElement('label');
				var inputLabelText = document.createTextNode('Commit message: ');
				commitInputLabel.appendChild(inputLabelText);
				commitWrapper.appendChild(commitInputLabel);
				
				
				//create the actual commit message textarea and give it an id so we can access it later
				var commitInput = document.createElement('textarea');
				commitInput.id = 'commit-message-' + i;
				commitInput.className = 'commit-textarea';
				
				//create the commit button, give it some text, and a class
				var commitButton = document.createElement('button');
				var buttonText = document.createTextNode('Commit');
				commitButton.className = 'commit-button';
				commitButton.appendChild(buttonText);
				
				//append the commit textarea and button to the commit wrapper div
				commitWrapper.appendChild(commitInput);
				commitWrapper.appendChild(commitButton);
				
				//append the commit wraper div to the main container div
				resourceDiv.appendChild(commitWrapper);
				
				//finally append the resource container to the main div. 
                editedResources.appendChild(resourceDiv);
				
				
            }
													
	
	  var elements = document.getElementsByClassName('commit-button');
	  var removeResource = document.getElementsByClassName('remove-resource');
	  for (var i = 0; i < removeResource.length; i++) {
			
			removeResource[i].addEventListener('click', function() {
			
				var parentId = this.parentNode.parentNode.id;
			
				var id = parentId.replace('resource-','');
				for (var key in resourceArray) {
						if (resourceArray[key].hasOwnProperty('id') && resourceArray[key].id == id) {
							this.parentNode.parentNode.remove();
							
							chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
							
						}            
						
					}
			
			});
	  
	  
	  }
	for (var i = 0; i < elements.length; i++) {
		elements[i].addEventListener('click', function() {
		var repoList = document.getElementById('repo-list');
		var repoName = repoList.options[repoList.selectedIndex].text;
		if(!repoName){
			alert('Please select a respository on the left');
			return;
		}
		else{
		var parentId = this.parentNode.parentNode.id;
		var parentNode = this.parentNode.parentNode;
		
		var id = parentId.replace('resource-','');
		var commitMessageInput = 'commit-message-'+id;
        commitMessage = document.getElementById(commitMessageInput).value;
		if(!commitMessage){
			alert('Please enter a commit message.');
			return;
		}
		var allSpaces = commitMessage.trim();
		if(allSpaces.length == 0){
			alert('Please enter a valid commit message.');
			return;
		}
		
		var overlayDiv = document.createElement('div');
		overlayDiv.className='overlay';
		parentNode.appendChild(overlayDiv);
		var spinner = new Spinner({
				color:'#aaa', 
				lines: 14,
				length: 18,
				width: 3,
				radius: 18,
				corners: .8,
				rotate: 56,
				trail: 65,
				speed: .9
		}).spin(parentNode);
				var branchList = document.getElementById('branch-list');
				
				var branch = branchList.options[branchList.selectedIndex].text;
				var repo = github.getRepo(username,repoName);
				var rLength = resourceArray.length;
			repo.write(branch,resourceArray[id].path, resourceArray[id].content,commitMessage,function(err){
				if(err){
					console.log(err);
				}
			else{
				
				var successImage = document.createElement('div');
				successImage.id = 'success-image';
				parentNode.appendChild(successImage);
				var checkImg = document.getElementById('success-image');
				setTimeout(function () { 
					checkImg.style.opacity = 1; 
					spinner.stop();
					}, 5);
				chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
				setTimeout(function(){
					parentNode.remove();
					},1000);
			}
			
			});
		}		
		});
	}
}
   
   
   sendResponse({updatedArray : resourceArray });
   }); 

//get the repo details for the selected repo
  document.getElementById('repo-list').addEventListener('change',function(){
    var repoList = document.getElementById('repo-list');
    var repoName = repoList.options[repoList.selectedIndex].text;
	document.getElementById('branch-list').options.length = 0;

    if(repoName){
        var repo = github.getRepo(username, repoName);
		var branch = document.getElementById('branches');
		var smallSpinner = new Spinner({
			color: '#aaa',
			lines:11,
			length: 0,
			width: 3,
			radius: 6,
			trail: 46,
			top: '26px',
			speed: 1.5	
		}).spin(branch);
		branch.style.visibility = 'visible';
		repo.listBranches(function(err, branches){
				smallSpinner.stop();
			 var select = document.getElementById('branch-list');
			for(var i=0; i < branches.length; i++){
				var branch = branches[i];
				select.options.add(new Option(branch))
			}
		});
    }
	else{
		document.getElementById('branches').style.visibility = 'hidden';
	}
    
  });

  }


 
  
  
//receive message from eventPage.js to reload the panel after successful authentication
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting == "reload_panel"){
		document.location.reload();
		}
    }); 
  
//sends a message to eventPage.js to open a new window with the github authorization url
  document.getElementById("authorize-button").addEventListener("click", function() {
    chrome.extension.sendMessage({greeting: "authorize_me"}, function(response) {});
  });

    
// sends a message to eventPage.js to log out the current user from GitHub    
  document.getElementById("logout").addEventListener("click", function() {
    chrome.extension.sendMessage({greeting: "logout"}, function(response) {});
  });



    
    
    
