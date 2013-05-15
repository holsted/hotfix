(function(){
    
    // If there is no hotfix data in local storage then the user is not authenicated 
    // so we should show the authorization page, otherwise the user is authenticated 
    // and we can proceed.

    if(!localStorage.getItem('hotfix')){
        document.getElementById('unauthorized').style.display = 'block';   
    }
    else{
        document.getElementById('authorized').style.display = 'block';
        var repoDiv = document.getElementById('repos');
    

        //Uses spin.js to start a loading spinner in the repository div

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
    
    
        // Get all of the items stored in local storage and JSON.parse them.

        var hotfix = JSON.parse(localStorage['hotfix']);

        // Get the access token that we will use to authenticate with github.
        // Initiate github.js instance.

        var github = new Github({
            token: hotfix.accessToken,
            auth: "oauth"
        });

        // Initiate a user in github.js.
        var user = github.getUser();

         //Insert the username with a link to their GitHub profile.
        var currentUser = hotfix.username;
        var selectUser = document.getElementById('select-user');
        var userOption = document.createElement('option');
        userOption.text = currentUser;
        selectUser.options.add(userOption);
        var logout = document.createElement('span');
        logout.id = 'logout';
        var logoutText = document.createTextNode('logout');
        logout.appendChild(logoutText);
        document.getElementById('sidebar-title').appendChild(logout);
        
         //Send a message to eventPage.js to log out current user out of GitHub    

        document.getElementById("logout").addEventListener("click", function() {
            chrome.extension.sendMessage({greeting: "logout"}, function(response) { });
        });
        
         var userOrgs = user.orgs(function(err, orgs) {
            for(var i=0; i < orgs.length; i++){
                var org = orgs[i].login;
                selectUser.options.add(new Option(org))
            }
        });
        
        
        // List the authenticated users repositories.

        listRepos = user.userRepos(currentUser,function(err, repos){
            var select = document.getElementById('repo-list');

            // Stop the spinner that we started on page load.

        
            // Populate the select list with the users' repos.
            if(repos.length<1){
                select.options.add(new Option('No repositories found'))
            }
            else{
                for(var i=0; i < repos.length; i++){
                    var repo = repos[i].name;
                    select.options.add(new Option(repo))
                }
            }

            smallSpinner.stop();
        });

        

        // Generate a list of resources that has been edited.

        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.greeting == "show resources") {
                
                // Clear out any existing resources.

                document.getElementById('edited-resources').innerHTML = '';
                
                // Populate the panelResources.

                var panelResources = request.showResource;
                
                // Create a container div for holding the resources

                var editedResources = document.getElementById('edited-resources');
                
                
                // This part gets a little messy. We have to dynamically create numerous
                // divs and spans for every resource that was edited. 
                // ToDo: Refactor this. 
                
                for (i=0; i<panelResources.length;i++){

                    // Add an id to all of the objects in rour esourceArray.

                    panelResources[i].id = i;
                    
                    // Create an achor element and set the href and target.

                    var a = document.createElement('a');
                    a.href = panelResources[i].url;
                    a.target = '_blank';
                    
                    // Extract the path and hostname from the anchor element.

                    var resourcePath = a.pathname;
                    var hostName = a.hostname;
                    var host = hostName.replace(/^www\./,'');
                    
                    
                    // Remove the leading / and add it to the panelResources.

                    if (resourcePath.charAt(0) == "/") {
                        resourcePath = resourcePath.substr(1);
                    }

                    // If panelResources.path is already set then
                    // use it instead of generating a new path.
                    // This lets us persist the commit path when it has been edited by a user.

                    if(!panelResources[i].path){
                        panelResources[i].path = resourcePath;
                    }
                    // Create a div to hold the resource and give it an id.

                    var resourceDiv = document.createElement('div');
                    resourceDiv.id = 'resource-' + i;
                    resourceDiv.className = "resource";
                    
                    // Create a div for the domain that this resource came from.

                    var source = document.createElement('div');
                    source.className = 'source';
                    var domainText = document.createTextNode(host);
                    source.appendChild(domainText);
                    
                    
                    // Create a list element to hold the resource and path.

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
                    
                    // Create an li element and add the full path to it.

                    var li = document.createElement('li');
                    var resourceText = document.createTextNode(panelResources[i].path);
                    var resourceLabel = document.createTextNode('Full commit path: ');
                    resourceLabel.className = 'resource-label';
                    var resourceSpan = document.createElement('span');
                    resourceSpan.className = 'resource-path';
                    resourceSpan.appendChild(resourceText);
                    var editPath = document.createElement('span');
                    editPath.className = ('edit-path');
                    editPathText = document.createTextNode('Edit');
                    editPath.appendChild(editPathText); 
                    
                    
                    // Append the anchor element to the li element we just created.
                    
                    li.appendChild(resourceLabel);
                    li.appendChild(resourceSpan);
                    li.appendChild(editPath);
                    
                    // Create a span to hold the remove icon and give it a class. 

                    var removeSpan = document.createElement('span');
                    removeSpan.className = 'remove-resource';
                    
                    // Append the span to the li element.

                    source.appendChild(removeSpan);
                    
                    // Create a div to hold the commit label, textarea(commit message), 
                    // and commit button.

                    var commitWrapper = document.createElement('div');
                    commitWrapper.className = 'commit-wrapper';
                    
                    // Create a label for the commit message and append it to the wrapper.

                    var commitInputLabel = document.createElement('label');
                    var inputLabelText = document.createTextNode('Commit message: ');
                    commitInputLabel.appendChild(inputLabelText);
                    commitWrapper.appendChild(commitInputLabel);
                    
                    // Create the textarea and give it an id so we can access it later.

                    var commitInput = document.createElement('textarea');
                    commitInput.id = 'commit-message-' + i;
                    commitInput.className = 'commit-textarea';
                    
                    // Create the commit button, give it some text, and add a class.

                    var commitButton = document.createElement('button');
                    var buttonText = document.createTextNode('Commit');
                    commitButton.className = 'commit-button';
                    commitButton.appendChild(buttonText);
                    
                    // Append the textarea and button to the commit wrapper div

                    commitWrapper.appendChild(commitInput);
                    commitWrapper.appendChild(commitButton);
                    
                    // Append the source, resource, path, and commit info to the
                    // container div.

                    resourceDiv.appendChild(source);
                    resourceDiv.appendChild(file);
                    resourceDiv.appendChild(li); 
                    resourceDiv.appendChild(commitWrapper);
                    
                    // Finally append the resource container to the main div. 

                    editedResources.appendChild(resourceDiv);
                    
                }
            
                // Get all of the remove resource spans

                var removeResource = document.getElementsByClassName('remove-resource');
                
                // Add an event listener for each remove resource span

                for (var i = 0; i < removeResource.length; i++) {
                    removeResource[i].addEventListener('click', function() {

                        // Get the numeric id of the resource div which will correspond
                        // to the resources id in the panelResources.

                        var parentId = this.parentNode.parentNode.id;
                        var id = parentId.replace('resource-','');
                        for (var key in panelResources) {
                            if (panelResources[key].hasOwnProperty('id') && panelResources[key].id == id) {
                                
                                // Remove the div on the screen and send a message to 
                                // devtools.js via eventPage.js to remove it from the 
                                // DevArray

                                this.parentNode.parentNode.remove();
                                chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
                            }            
                        }
                    });
                }
                
                // Get all of the edit resource span

                var editPath = document.getElementsByClassName('edit-path');
                
                // Add an event listener for each edit resource span

                for (var i = 0; i < editPath.length; i++) {
                    editPath[i].addEventListener('click', function() {

                        // Get the numeric id of the resource div which will correspond
                        // to the resources id in the panelResources.
            
                        var parentId = this.parentNode.parentNode.id;
                        var id = parentId.replace('resource-','');
                     
                        for (var key in panelResources) {
                            if (panelResources[key].hasOwnProperty('id') && panelResources[key].id == id) {
                                
                                // Get the text of the current path link.
                                var editButton = this;
                                var path = this.previousSibling;


                                // Create a new contentEditable span with that text

                                path.contentEditable = true;


                                // Create save button.

                                var savePath = document.createElement('span');
                                var savePathText = document.createTextNode('Save');
                                savePath.appendChild(savePathText);
                                savePath.className = "save-path";

                                // Add event listener for new save button.

                                savePath.addEventListener('click', function() {
                                    
                                    path.contentEditable = false;
                                    panelResources[id].path = path.innerText;
                                    this.style.display = 'none';
                                    editButton.style.display = "inline-block";
                                    
                                // Send a message to Dev Tools.js via eventPage.js to make sure the arrays stay in sync.
                                    chrome.extension.sendMessage({greeting: "update devResource", data: panelResources}, function(response) {});

                                });

                                this.parentNode.insertBefore(savePath);

                                // Remove old path link and edit button.
                                this.style.display = 'none';
                            }            
                        }
                    });
                }
                // Get all of our commit buttons.

                var elements = document.getElementsByClassName('commit-button');
                
                // Add an event listener to each commit button.

                for (var i = 0; i < elements.length; i++) {
                    elements[i].addEventListener('click', function() {
                        var repoList = document.getElementById('repo-list');
                        var repoName = repoList.options[repoList.selectedIndex].text;
                    
                        // Check that a valid repository was selected. 

                        if(!repoName){
                            alert('Please select a respository on the left');
                            return;
                        }
                        else if(repoName == "No repositories found"){
                            alert("It appears you haven't created any GitHub repositories. You should create one on GitHub, then log out of hotfix and log back in.");
                            return;
                        }
                        else{
                    
                            // Get the id from the parent div that corresponds to the 
                            // resources id property in our panelResources array.

                            var parentId = this.parentNode.parentNode.id;
                            var parentNode = this.parentNode.parentNode;
                            var id = parentId.replace('resource-','');
                            
                            // Check that the user has saved the full commit path.
                            var checkPath = parentNode.getElementsByClassName('resource-path')[0];
                            if (checkPath.contentEditable == "true"){
                                
                                alert('The full commit path needs to be saved.');
                                return;
                            }

                            // Get commit message from the textarea.

                            var commitMessageTextArea = 'commit-message-'+id;
                            commitMessage = document.getElementById(commitMessageTextArea).value;

                            
                            // Check that the user has in fact entered a commit message.

                            if(!commitMessage){
                                alert('Please enter a commit message.');
                                return;
                            }
                            
                            // And that it's not just a bunch of spaces.

                            var allSpaces = commitMessage.trim();
                            if(allSpaces.length == 0){
                                alert('Please enter a valid commit message.');
                                return;
                            }
                            
                            // Create an overlay div and a loading spinner while we send the 
                            // commit to GitHub.

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
                                
                                
                            // Get the variables we need to send with our request to GitHub.

                            var branchList = document.getElementById('branch-list');
                            var branch = branchList.options[branchList.selectedIndex].text;
                            var repo = github.getRepo(currentUser,repoName);
                            repo.write(branch,panelResources[id].path, panelResources[id].content,commitMessage,function(err){
                                if(err){
                                    alert('Sorry. There was a problem pushing your commit to GitHub. Please try again.');
                                    spinner.stop();
                                    parentNode.remove();
                                }
                                else{

                                    // Create a div to show the success image.
                                    var successImage = document.createElement('div');
                                    successImage.id = 'success-image';
                                    parentNode.appendChild(successImage);
                                    var checkImg = document.getElementById('success-image');
                                    setTimeout(function () { 
                                        checkImg.style.opacity = 1; 
                                        spinner.stop();
                                    }, 5);
                                        
                                    // Send a message to devtools.js via eventPage.js to remove  
                                    // the resource we just committed from the devResources array.
                                    chrome.extension.sendMessage({greeting: "remove resource", data: id}, function(response) {});
                                    
                                    // And remove it from view.
                                    setTimeout(function(){
                                        parentNode.remove();
                                    },1000);
                                }
                            });
                        }       
                    });
                }
            }
   
           // Send a response to devtools.js via eventPage.js to make sure devResources
           // and panelResources are in sync (ids, paths, etc...)

           sendResponse({updatedArray : panelResources });
        }); 

        document.getElementById('select-user').addEventListener('change',function(){
            var selectList = document.getElementById('select-user');
            currentUser = selectList.options[selectList.selectedIndex].text;
            var repoList = document.getElementById('repo-list');
            repoList.options.length = 1;
            var repoDiv = document.getElementById('repos');
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
            
            document.getElementById('branches').style.visibility='hidden';

            if(hotfix.username !== currentUser){
               listRepos = user.orgRepos(currentUser, function(err, repos){
            
                // Populate the select list with the users' repos.
                if(repos.length<1){
                    repoList.options.add(new Option('No repositories found'))
                }
                else{
                    for(var i=0; i < repos.length; i++){
                        var repo = repos[i].name;
                        repoList.options.add(new Option(repo))
                    }
                }
                smallSpinner.stop();
            }); 

            }

            else{

                listRepos = user.repos(function(err, repos){
            
                // Populate the select list with the users' repos.
                if(repos.length<1){
                    repoList.options.add(new Option('No repositories found'))
                }
                else{
                    for(var i=0; i < repos.length; i++){
                        var repo = repos[i].name;
                        repoList.options.add(new Option(repo))
                    }
                }
                smallSpinner.stop();
            });

            }
            
           

                

        });


        // Add listener for a change on the repo-list select element.

        document.getElementById('repo-list').addEventListener('change',function(){
            var repoList = document.getElementById('repo-list');
            var repoName = repoList.options[repoList.selectedIndex].text;
            document.getElementById('branch-list').options.length = 0;
            if(repoName && repoName !== 'No repositories found'){
    
                // Get the selected repository details. 

                var repo = github.getRepo(currentUser, repoName);
                var branch = document.getElementById('branches');
                
                // Show a spinner while the branches load.

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
        
                // List all branches of the selected repository.

                repo.listBranches(function(err, branches){
                
                    var select = document.getElementById('branch-list');
                    for(var i=0; i < branches.length; i++){
                        var branch = branches[i];
                        select.options.add(new Option(branch))
                    }
                
                    //Stop the spinner.

                    smallSpinner.stop();
                });
            }
            else{

                //Hide the branches if user unselects the repository.

                document.getElementById('branches').style.visibility = 'hidden';
            }
        });
    }
    
    //Listen for a message from eventPage.js to reload the panel after successful authentication.

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "reload_panel"){
            localStorage['hotfix'] = JSON.stringify(request.data);
            document.location.reload();
        }
    }); 
    
    //Listen for a message from eventPage.js to reload the panel after successful authentication.

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.greeting == "unload_panel"){
            localStorage.removeItem('hotfix');
            localStorage.removeItem('hotfix-welcome');
            document.location.reload();
        }
    }); 
  
    // Send a message to eventPage.js to open a new window with the github authorization url.

    document.getElementById("authorize-button").addEventListener("click", function() {
        chrome.extension.sendMessage({greeting: "authorize_me"}, function(response) {});
    });
})();

    
    
    
