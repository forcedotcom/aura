({
    render: function(cmp, helper) {
        var ret = cmp.superRender();

        var opaqueRef = helper.findSecureObject(ret);
        if (opaqueRef) {
            throw new Error("SecureObject leaked from superRender().");
        }
                
        // Add in a div
        var secondSentinel = document.createElement("div");
        secondSentinel.id = "secondSentinel";
        secondSentinel.style.color = "blue";
        secondSentinel.innerHTML = "Second Sentinel";
        
        ret.push(secondSentinel);

        return ret;
    },
    
    rerender: function(cmp, helper) {
    	var ret = cmp.superRerender();

        var opaqueRef = helper.findSecureObject(ret);
        if (opaqueRef) {
            throw new Error("SecureObject leaked from superRerender().");
        }

        return ret;
    }
})
