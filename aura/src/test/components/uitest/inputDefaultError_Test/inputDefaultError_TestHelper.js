({
	//Helper function that will go to the component, and either validate it or invalidate it
	addErrorsToCmp : function(invalidCmp){		    	
    	 var ariaDesc = document.getElementById(invalidCmp.get("v.ariaDescribedby"))
    	 var value = invalidCmp.getValue("v.value");
    	 
    	 if($A.util.isEmpty(ariaDesc)){
    		 value.setValid(false);
        	 value.addErrors({"message":"The wren"});
        	 value.addErrors({"message":"Earns his living"});
        	 value.addErrors({"message":"Noiselessly"});
    	 }
    	 else{
    		 value.setValid(true);
    	 }
	}
})