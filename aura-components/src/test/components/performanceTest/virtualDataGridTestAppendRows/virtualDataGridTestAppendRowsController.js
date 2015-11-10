({  
	
	
    setup: function (cmp, event, helper) {
  		 	
    },  

    run: function (cmp, event, helper) {    	
    	var mData = cmp.get('m.data');
    	var datagrid = cmp.find("myGrid"); 
    	
    	for(var i = 0; i < mData.length;i++){
    		datagrid.appendItems([mData[i]]);
    	}
    	
    	event.getParam('arguments').done.immediate();
    },
    
    postProcessing: function (cmp, event, helper) {
    	
    }
})