({
    
    handleEventinPrivilegedNamespaceWithGlobalAccess : function(cmp, event) {
        cmp.set("v.message1",event.getParam("message"));  
    },
    handleEventinInternalNamespaceWithGlobalAccess : function(cmp, event) { 
        cmp.set("v.message2",event.getParam("message"));  
    },
    handleEventinCustomNamespaceWithGlobalAccess : function(cmp, event) { 
        cmp.set("v.message3",event.getParam("message"));  
    },
    handleEventinPrivilegedNamespaceWithPublicAccess : function(cmp, event) { 
        cmp.set("v.message4",event.getParam("message"));  
    }

})