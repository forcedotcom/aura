({
	
	 	setup: function (cmp, event, helper) {
		 	
	    },  

	    run: function (cmp, event, helper) {

	    	 var NUM_TABS = 10;
	    	 
	    	 // test lazyRenderTabs functionality
	    	 if(cmp.get("v._lazyRenderTabs") === true){
		    	
		    	 for(var i = 0; i< NUM_TABS; i++){
		    		 var tabs = cmp.find("myTabset").get("e.activateTab").setParams({"index": i}).fire();
		    	 }
	    	 }
	    	 
	    	 else if(cmp.get("v.testDynamicTabLoading") === true){
	    	    	 
		    	 for(var i = 0; i< NUM_TABS; i++){
			    	 var e = cmp.find("myTabset").get("e.addTab");
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
	    	}
	    	 
	    	event.getParam('arguments').done.immediate();
	    },
	    
	    postProcessing: function (cmp, event, helper) {
	       
	    }
	    
})