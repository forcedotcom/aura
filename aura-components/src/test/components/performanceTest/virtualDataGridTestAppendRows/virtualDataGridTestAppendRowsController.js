({  
		
    setup: function (cmp, event, helper) {
    	helper.mData = cmp.get('m.data');
    	helper.datagrid = cmp.find("myGrid"); 
    },  

    run: function (cmp, event, helper) {    	
    	
    	for(var i = 0; i < helper.mData.length; i++){
    		helper.datagrid.appendItems([helper.mData[i]]);
    	}
    	
    	event.getParam('arguments').done.immediate();
    },
    
    postProcessing: function (cmp, event, helper) {
    	
    }
})