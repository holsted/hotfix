

(function() {
  
  var Hotfix;
  
  Hotfix = window.Hotfix = function(){
   
    Hotfix.Local = function(){

      // Get data from local storage
      this.getData = function(name) {
        var src = this.getSource();
        var obj = src ? JSON.parse(src) : {};
        return name ? obj[name] : obj;
      };

      // Save the data to local storage
      this.setData = function (name,value){
        var obj = this.getData();
        obj[name] = value;
        this.setSource(obj);
      };

      // Set the JSON string for the object stored in local storage
      this.setSource = function(source) {
        if (!source) {
            return;
        }
        if (typeof source !== 'string') {
            source = JSON.stringify(source);
        }
        localStorage['hotfix'] = source;
      };

      // Get the name of the object stored in local storage
      this.getSource = function() {
        return localStorage['hotfix'];
      };
    };
    
    Hotfix.Panel = function(){
      
      //try to match the edited resource to the file in github
      this.matchPaths = function(repoPath, resourcePaths, cb){
            console.log('matching');
            return('matching');
      };
    
	};

    
    //top level API
    
    this.getLocal = function(){
      return new Hotfix.Local();
    }
    
    this.getPanel = function(){
      return new Hotfix.Panel();
    }
  
  };
}).call(this);



