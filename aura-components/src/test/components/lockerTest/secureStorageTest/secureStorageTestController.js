({  
    testSecureLocalStorage: function(cmp, event, helper) {
        helper.verifyStorage(cmp, window.localStorage, "LOCAL");
    },
    
    testSecureSessionStorage: function(cmp, event, helper) {
        helper.verifyStorage(cmp, window.sessionStorage, "SESSION");
    }
})
