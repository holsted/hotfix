//new hotfix
    var hotfix = new Hotfix();
    var local = hotfix.getLocal();
    var repoPaths = [];
	var resourceArray = [];
//get accessToken from local storage
    var token = local.getData('accessToken');
    var repo;
//if there is no token in local storage, show the authorization page, else proceed
    if(!token){
        document.getElementById('authorized').style.display = 'none';
        document.getElementById('unauthorized').style.display = 'block';
    }
    else{

//initiate github.js
    var github = new Github({
        token: token,
        auth: "oauth"
    });
    
//set up a user
    var user = github.getUser();
//get the username from local storage
    var username = local.getData('username');
	var avatar = local.getData('avatar');

//list the current users repo
    listRepos = user.userRepos(username, function(err, repos){
//populates the select list with the users repos
        var select = document.getElementById('repo-list');
        for(var i=0; i < repos.length; i++){
            var repo = repos[i].name;
            select.options.add(new Option(repo))
        }
    });


	
	//insert text node that displays the current username
    var showUser = document.createElement('li');
	var userName = document.createTextNode(username);
	var userLink = document.createElement('a');
	var avatarImg = document.createElement('img');
	avatarImg.src = avatar;
	showUser.appendChild(avatarImg);
	showUser.appendChild(userLink);
	userLink.appendChild(userName);
	userLink.href = "https://www.github.com/"+username;
	userLink.target = '_blank';
    
	
	
	document.getElementById('username').appendChild(showUser);


	
	
	//updates the resource list of the files that have been edited    
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "show resources") {
			document.getElementById('edited-resources').innerHTML = '';
			var resourceArray = request.showResource;
			console.log(resourceArray);
			//create container div for holding the resources
            var editedResources = document.getElementById('edited-resources');
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
				
				
				
				
				
				//create a span to hold the source(domain) this resource came from and add the domain text to it
				var source = document.createElement('div');
				source.className = 'source';
				var domainText = document.createTextNode(host);
				var fileText = document.createTextNode('File: ' + fileName);
				var file = document.createElement('li');
				file.appendChild(fileText);
				file.className = 'file';
				source.appendChild(domainText);
				
				
				
				
				//add the source div to the container div
				resourceDiv.appendChild(source);
				resourceDiv.appendChild(file);
				//create an li element and add the full url to it
				var li = document.createElement('li');
				var linkText = document.createTextNode(resourcePath);
				var fileLabel = document.createTextNode('Full path: ');
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
				
				//create a label for the input element, add text to it, and append it to the wrapper
				var commitInputLabel = document.createElement('label');
				var inputLabelText = document.createTextNode('Commit message: ');
				commitInputLabel.appendChild(inputLabelText);
				commitWrapper.appendChild(commitInputLabel);
				
				
				
				
				//create the actual input element and give it an id so we can access it later
				var commitInput = document.createElement('input');
				commitInput.id = 'commit-message-' + i;
				commitInput.className = 'commit-input';
				
				//create the commit button, give it some text, and a class
				var commitButton = document.createElement('button');
				var buttonText = document.createTextNode('Commit');
				commitButton.className = 'commit-button';
				commitButton.appendChild(buttonText);
				
				//append the commit input and button to the commit wrapper div
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
		var parentId = this.parentNode.parentNode.id;
		var parentNode = this.parentNode.parentNode;
		var id = parentId.replace('resource-','');
		var commitMessageInput = 'commit-message-'+id;
        commitMessage = document.getElementById(commitMessageInput).value;
				var repoList = document.getElementById('repo-list');
				var branchList = document.getElementById('branch-list');
				var repoName = repoList.options[repoList.selectedIndex].text;
				var branch = branchList.options[branchList.selectedIndex].text;
				var repo = github.getRepo(username,repoName);
				var rLength = resourceArray.length;
			repo.write(branch,resourceArray[id].path, resourceArray[id].content,commitMessage,function(err){
			if(err){
			console.log(err);
			}
			else{
			parentNode.remove();
			chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
			}
			
			});
				
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
		document.getElementById('branches').style.display = 'block';
		repo.listBranches(function(err, branches){
			 var select = document.getElementById('branch-list');
			for(var i=0; i < branches.length; i++){
				var branch = branches[i];
				select.options.add(new Option(branch))
			}
		});
    }
	else{
		document.getElementById('branches').style.display = 'none';
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



    
    
    
