({
    afterRender: function(cmp){
        this.superAfterRender();
        // making it difficult for the server to consider this a direct dependency
        // thus it won't be included in app.js
        var ns = "uriAddressable", cmpName = "externallyCreated";
        setTimeout(
            $A.getCallback(function(){
                cmp.set("v.dynamic",
                    $A.createComponentFromConfig({
                        "descriptor": "markup://" + ns + ":" + cmpName
                    })
                );
            }), 100
        );
    }
})