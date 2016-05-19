({
    render : function(cmp, helper) {
        var ret = cmp.superRender();

        var testInRenderer = cmp.get("v.testInRenderer");

        if (testInRenderer === "testCallAppendChildWithOpaqueReference") {
            // SecureObject is marked as opaque
            var opaqueRef = helper.findSecureObject(ret);
            if(!opaqueRef) {
                throw new Error("Expecting a SecureObject for test setup.");
            }

            var element = document.createElement("div");
            try {
                element.appendChild(opaqueRef);
                throw new Error("Expecting an access denied error.");
            } catch(e) {
                cmp.set("v.text", e.toString());
            }
        }

        else if(testInRenderer === "testCallRemoveChildWithOpaqueReference") {
            // SecureObject is marked as opaque
            var opaqueRef = helper.findSecureObject(ret);
            if(!opaqueRef) {
                throw new Error("Expecting a SecureObject for test setup.");
            }

            var element = document.createElement("div");
            try {
                element.removeChild(opaqueRef);
                throw new Error("Expecting an access denied error.");
            } catch(e) {
                cmp.set("v.text", e.toString());
            }
        }

        return ret;
    }
})
