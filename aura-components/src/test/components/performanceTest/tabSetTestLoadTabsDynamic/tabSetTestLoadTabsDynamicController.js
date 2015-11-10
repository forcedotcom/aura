({
	
	
	 	setup: function (cmp, event, helper) {
		 	
	    },  

	    run: function (cmp, event, helper) { 
	    	 var NUM_TABS = 10;
	    	 
	    	 for(var i = 0; i< NUM_TABS; i++){
		    	 var e = cmp.find("myTabSet").get("e.addTab");
		    	 e.setParams({tab: {
		    	                    "title": "Tab " + i,
		    	                    "name": "Name",
		    	                    "body": [{
		    	                               "componentDef": { descriptor:"markup://aura:text" },
		    	                                 "attributes": {
		    	                                     "values": { "value": "Content" }
		    	                                 }
		    	                              }]
		    	                    }, index: 0
		    	             });
		    		e.fire();
	    	 }
	    	 event.getParam('arguments').done.immediate();
	    },
	    
	    postProcessing: function (cmp, event, helper) {
	       
	    }
	    
	    
        
})