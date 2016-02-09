({
    getWrappersFromHelper: function() {
        var log = {
                'document': document,
                'window': window,
                '$A': $A
        };
        return log;
    },

    accessDocumentBody: function(cmp){
        var body = document.body;
        cmp.set("v.log", body);
    },

    testFunction: function() {
        var f = new Function("x", "y", "return x + y");
        if (f(1, 2) !== 3) {
            throw new Error("Unable to use new Function()");
        }
    },
    
    getSecureElementDynamically: function(cmp) {
        var div = document.createElement("div");
        cmp.set("v.log", div);
    },
    
    getSecureElementFromMarkup: function(cmp) {
        var div = cmp.find("content").getElement();
        cmp.set("v.log", div);
    }
})