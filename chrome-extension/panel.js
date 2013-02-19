//new hotfix
    var hotfix = new Hotfix();
    var local = hotfix.getLocal();
    var resourcePaths = [];
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
        document.getElementById('changed-files').innerHTML = '';
        var showResource = request.showResource;
		console.log(showResource);
        if (request.greeting == "show resources")
            var resourceList = document.createElement('ul');
            resourcePaths = [];
			for (i=0; i<showResource.length;i++){
                var link = document.createElement('li');
                link.innerHTML = ('File URL:' + showResource[i].key);
                resourceList.appendChild(link);    
                
				var a = document.createElement('a');
                a.href = showResource[i].key;
                var resourcePath = a.pathname;
                if (resourcePath.charAt(0) == "/") resourcePath = resourcePath.substr(1);
				var addResource = {};
                addResource.path = resourcePath;
                addResource.content = showResource[i].content;
                resourcePaths.push(addResource);
            }
        console.log(resourcePaths);
        document.getElementById('changed-files').appendChild(resourceList);
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
        var iLength = resourcePaths.length;
        var jLength = repoPaths.length;
        for(i=0; i<iLength;i++){
            for(j=0; j<jLength;j++){
                if(resourcePaths[i].path == repoPaths[j].path){
                    alert('I found a match!');
                }
                else console.log(resourcePaths[i].path);
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

  
    document.getElementById('push').addEventListener('click',function(){
        commitMessage = document.getElementById('commit-message').value;
				console.log(resourcePaths);
				var repoList = document.getElementById('repo-list');
				var branchList = document.getElementById('branch-list');
				var repoName = repoList.options[repoList.selectedIndex].text;
				var branch = branchList.options[branchList.selectedIndex].text;
				var repo = github.getRepo(username,repoName);
				var rLength = resourcePaths.length;
				for(i=0; i<rLength;i++){
					repo.write(branch,resourcePaths[i].path, resourcePaths[i].content,commitMessage,function(err){
					});
				}
	});
  
  
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



    
    
    
