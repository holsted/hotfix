//new hotfix
    var hotfix = new Hotfix();
    var local = hotfix.getLocal();
    var repoPaths = [];
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
    var panel = hotfix.getPanel();
//get the username from local storage
    var username = local.getData('username');

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
    var showUser = document.createTextNode('Username: ' + username);
    document.getElementById('username').appendChild(showUser);


	
	
	//updates the resource list of the files that have been edited    
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "show resources")
			document.getElementById('changed-files').innerHTML = '';
			
			resourceArray = request.showResource;
            var resourceList = document.createElement('div');
			for (i=0; i<resourceArray.length;i++){
                resourceArray[i].id = i;
				var resourceLink = document.createElement('a');
                resourceLink.href = resourceArray[i].url;
				resourceLink.target = '_blank';
                var resourcePath = resourceLink.pathname;
				var hostName = resourceLink.hostname;
                if (resourcePath.charAt(0) == "/") resourcePath = resourcePath.substr(1);
                resourceArray[i].path = resourcePath;
				
				var resourceDiv = document.createElement('div');
				resourceDiv.id = 'resource-' + i;
				var domain = document.createElement('div');
				var domainText = document.createTextNode(hostName);
				domain.appendChild(domainText);
				resourceDiv.appendChild(domain);
				var link = document.createElement('li');
				var linkText = document.createTextNode(resourcePath);
				resourceLink.appendChild(linkText);
				link.appendChild(resourceLink);
				var removeLink = document.createElement('span');
				removeLink.className = 'remove-link';
				link.appendChild(removeLink);
				resourceDiv.appendChild(link); 
				var commitBox = document.createElement('div');
				commitBox.className = 'commit-box';
				var commitInputLabel = document.createElement('label');
				var inputLabelText = document.createTextNode('Commit message:');
				commitInputLabel.appendChild(inputLabelText);
				commitBox.appendChild(commitInputLabel);
				
				var commitInput = document.createElement('input');
				commitInput.id = 'commit-message-' + i;
				var commitButton = document.createElement('button');
				commitButton.className = 'commit-button';
				var buttonText = document.createTextNode('Commit');
				commitButton.appendChild(buttonText);
				commitBox.appendChild(commitInput);
				commitBox.appendChild(commitButton);
				resourceDiv.appendChild(commitBox);
                resourceList.appendChild(resourceDiv);
				
				
            }
													
       
        document.getElementById('changed-files').appendChild(resourceList);
	  var elements = document.getElementsByClassName('commit-button');
	  var removeLinks = document.getElementsByClassName('remove-link');
	  console.log(resourceArray);
	  for (var i = 0; i < removeLinks.length; i++) {
			
			removeLinks[i].addEventListener('click', function(e) {
				var parentId = this.parentNode.parentNode.id;
				var id = parentId.replace('resource-','');
				for (var key in resourceArray) {
						if (resourceArray[key].hasOwnProperty('id') && resourceArray[key].id == id) {
							delete resourceArray[key]; 
							console.log(resourceArray);
							this.parentNode.parentNode.remove();
						}            
						
					}
			
			});
	  
	  
	  }
	for (var i = 0; i < elements.length; i++) {
		elements[i].addEventListener('click', function() {
		var parentId = this.parentNode.parentNode.id;
		var id = parentId.replace('resource-','');
		var commitMessageInput = 'commit-message-'+id;
        commitMessage = document.getElementById(commitMessageInput).value;
				var repoList = document.getElementById('repo-list');
				var branchList = document.getElementById('branch-list');
				var repoName = repoList.options[repoList.selectedIndex].text;
				var branch = branchList.options[branchList.selectedIndex].text;
				var repo = github.getRepo(username,repoName);
				var rLength = resourceArray.length;
			repo.write(branch,resourceArray[id].path, resourceArray[id].content,commitMessage,function(err){});
				
		});
}

   }); 

//get the repo details for the selected repo
  document.getElementById('repo-list').addEventListener('change',function(){
    var repoList = document.getElementById('repo-list');
    var repoName = repoList.options[repoList.selectedIndex].text;
	document.getElementById('branch-list').options.length = 0;

    if(repoName){
        var repo = github.getRepo(username, repoName);
		document.getElementById('branch-wrapper').style.display = 'block';
		repo.listBranches(function(err, branches){
			 
			 var select = document.getElementById('branch-list');
			for(var i=0; i < branches.length; i++){
				var branch = branches[i];
				select.options.add(new Option(branch))
			}
		})
		
        repo.getTree('master?recursive=true', function(err, tree) {
        console.log(tree);
        for (var obj in tree){
            var repoPath ={};
            repoPath.path = tree[obj].path;
            repoPath.sha = tree[obj].sha;
            repoPaths.push(repoPath);
        }
        var iLength = resourceArray.length;
        var jLength = repoPaths.length;
        for(i=0; i<iLength;i++){
            for(j=0; j<jLength;j++){
                if(resourceArray[i].path == repoPaths[j].path){
                    alert('I found a match!');
                }
                else console.log(resourceArray[i].path);
            }
        
        }
      });
        console.log(repoPaths);
    }
	else{
		document.getElementById('branch-wrapper').style.display = 'none';
	}
    
  });

  }


 
  
  
//receive message from eventPage.js to reload the panel after successful authentication
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting == "reload_panel")
         document.location.reload();
    }); 
  
//sends a message to eventPage.js to open a new window with the github authorization url
  document.getElementById("authorize-button").addEventListener("click", function() {
    chrome.extension.sendMessage({greeting: "authorize_me"}, function(response) {});
  });

    
// sends a message to eventPage.js to log out the current user from GitHub    
  document.getElementById("logout").addEventListener("click", function() {
    chrome.extension.sendMessage({greeting: "logout"}, function(response) {});
  });



    
    
    
