
	//if there is no data in local storage then the user is not authenicated so
	//we should show the authorization page, otherwise the user is authenticated 
	//and we can proceed. 
	
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
	
		//get the access token that we use to authenticate with github
		var token = hotfix.accessToken;
	
		//initiate github.js instance
		var github = new Github({
			token: token,
			auth: "oauth"
		});
    
		//initiate a user in github.js
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

		//Generate a list of resources that has been edited
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			if (request.greeting == "show resources") {
				
				//clear out any existing resources
				document.getElementById('edited-resources').innerHTML = '';
				
				//populate the resourceArray 
				var resourceArray = request.showResource;
				
				//create container div for holding the resources and fill it
				var editedResources = document.getElementById('edited-resources');
				
				
				//This part gets a little messy. We have to dynamically create several 
				//divs and spans for every resource that was edited. 
				//ToDo: See if there is a better way to do this. 
				
				for (i=0; i<resourceArray.length;i++){
					//add an id to all of the objects in resourceArray
					resourceArray[i].id = i;
					
					// create an achor element and set the href and target 
					var a = document.createElement('a');
					a.href = resourceArray[i].url;
					a.target = '_blank';
					
					//extract the path and hostname from the anchor element
					var resourcePath = a.pathname;
					var hostName = a.hostname;
					var host = hostName.replace(/^www\./,'');
					
					
					//remove the leading / and add it to the resourceArray
					if (resourcePath.charAt(0) == "/") {
						resourcePath = resourcePath.substr(1);
					}
					resourceArray[i].path = resourcePath;
					
					//create a div to hold the resource and give it an id
					var resourceDiv = document.createElement('div');
					resourceDiv.id = 'resource-' + i;
					resourceDiv.className = "resource";
					
					//create a div for the domain that this resource came from 
					var source = document.createElement('div');
					source.className = 'source';
					var domainText = document.createTextNode(host);
					source.appendChild(domainText);
					
					
					//create a list element to hold the resource and path
					var file = document.createElement('li');
					var fileText = document.createTextNode('Resource: ');
					var fileName = resourcePath.substring(resourcePath.lastIndexOf('/')+1);
					var fileNameText = document.createTextNode(fileName);
					var fileSpan = document.createElement('span');
					fileSpan.appendChild(fileNameText);
					fileSpan.className = ('file-name')
					file.appendChild(fileText);
					file.appendChild(fileSpan);
					file.className = 'file';
					
					//create an li element and add the full path to it
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
					
					//create a div to hold the commit label, textarea(commit message), 
					//and commit button
					var commitWrapper = document.createElement('div');
					commitWrapper.className = 'commit-wrapper';
					
					//create a label for the commit message and append it to the wrapper
					var commitInputLabel = document.createElement('label');
					var inputLabelText = document.createTextNode('Commit message: ');
					commitInputLabel.appendChild(inputLabelText);
					commitWrapper.appendChild(commitInputLabel);
					
					//create the textarea and give it an id so we can access it later
					var commitInput = document.createElement('textarea');
					commitInput.id = 'commit-message-' + i;
					commitInput.className = 'commit-textarea';
					
					//create the commit button, give it some text, and add a class
					var commitButton = document.createElement('button');
					var buttonText = document.createTextNode('Commit');
					commitButton.className = 'commit-button';
					commitButton.appendChild(buttonText);
					
					//append the textarea and button to the commit wrapper div
					commitWrapper.appendChild(commitInput);
					commitWrapper.appendChild(commitButton);
					
					//append the source, resource, path, and commit info to the
					//container div
					resourceDiv.appendChild(source);
					resourceDiv.appendChild(file);
					resourceDiv.appendChild(li); 
					resourceDiv.appendChild(commitWrapper);
					
					//finally append the resource container to the main div. 
					editedResources.appendChild(resourceDiv);
					
				}
														
				var removeResource = document.getElementsByClassName('remove-resource');
				
				//adds an event listener for all of the newly added resource divs
				for (var i = 0; i < removeResource.length; i++) {
					removeResource[i].addEventListener('click', function() {

						//get the numeric id of the resource div which corresponds
						//to the resources id in the resourceArray
						var parentId = this.parentNode.parentNode.id;
						var id = parentId.replace('resource-','');
						for (var key in resourceArray) {
							if (resourceArray[key].hasOwnProperty('id') && resourceArray[key].id == id) {
								
								//remove the div on the screen and send a message to 
								//devtools.js via eventPage.js to remove it from the 
								//resourceArray
								this.parentNode.parentNode.remove();
								chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
							}            
						}
					});
				}
		
				var elements = document.getElementsByClassName('commit-button');
				
				//adds an event listener to all of the commit buttons
				for (var i = 0; i < elements.length; i++) {
					elements[i].addEventListener('click', function() {
						var repoList = document.getElementById('repo-list');
						var repoName = repoList.options[repoList.selectedIndex].text;
					
						//check that a repository was selected 
						if(!repoName){
							alert('Please select a respository on the left');
							return;
						}
					
						//if so, proceed
						else{
					
							//get the id from the parent div that will correspond with the 
							//resources' id in the resourceArray
							var parentId = this.parentNode.parentNode.id;
							var parentNode = this.parentNode.parentNode;
							var id = parentId.replace('resource-','');
							
							//read the commit message
							var commitMessageTextArea = 'commit-message-'+id;
							commitMessage = document.getElementById(commitMessageTextArea).value;
							
							//check that the user has in fact entered a commit message
							if(!commitMessage){
								alert('Please enter a commit message.');
								return;
							}
							
							//and that it wasn't just a bunch of spaces
							var allSpaces = commitMessage.trim();
							if(allSpaces.length == 0){
								alert('Please enter a valid commit message.');
								return;
							}
							
							//create an overlay div and a loading spinner while we send the 
							//commit to GitHub
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
							repo.write(branch,resourceArray[id].path, resourceArray[id].content,commitMessage,function(err){
								if(err){
									alert('Sorry. There was a problem pushing your commit to GitHub. Please try again.');
								}
								else{

									//create a div to show the success image
									var successImage = document.createElement('div');
									successImage.id = 'success-image';
									parentNode.appendChild(successImage);
									var checkImg = document.getElementById('success-image');
									setTimeout(function () { 
										checkImg.style.opacity = 1; 
										spinner.stop();
									}, 5);
										
									//send a message to devtools.js via eventPage.js to remove  
									//the resource we just committed from the resourceArray
									chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
									
									//and remove it from view
									setTimeout(function(){
										parentNode.remove();
									},1000);
								}
							});
						}		
					});
				}
			}
   
		   //sends a response to devtools.js via eventPage.js to make sure the 
		   //arrays are in sync with the same ids etc. 
		   sendResponse({updatedArray : resourceArray });
		}); 

		//get the branches for the selected repo
		document.getElementById('repo-list').addEventListener('change',function(){
			var repoList = document.getElementById('repo-list');
			var repoName = repoList.options[repoList.selectedIndex].text;
			document.getElementById('branch-list').options.length = 0;
			if(repoName){
	
				//gets the repo details using github.js
				var repo = github.getRepo(username, repoName);
				var branch = document.getElementById('branches');
				//show a spinner while the branches load
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
		
				//list the branches of the repository
				repo.listBranches(function(err, branches){
				
					var select = document.getElementById('branch-list');
					for(var i=0; i < branches.length; i++){
						var branch = branches[i];
						select.options.add(new Option(branch))
					}
				
					//stop the spinner
					smallSpinner.stop();
				});
			}
			else{
				//hide the branches if user unselects the repository
				document.getElementById('branches').style.visibility = 'hidden';
			}
    
		});

	}
	
	//receive message from eventPage.js to reload the panel after successful authentication
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
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



    
    
    
