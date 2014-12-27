({
    
    injectCmp : function(cmp){
	       //Function that will only inject if we are looking at the correct component
           if(cmp.get("v.caseToRender") === "imageTagTest"){
    	      var div = cmp.find("injectableDiv").getElement();
    	
    	      var img = document.createElement("img");
    	      img.alt = "Hell World!";
    	
    	      div.appendChild(img);
    	      img = document.createElement("img");
    	      div.appendChild(img);
	      }
    }
})