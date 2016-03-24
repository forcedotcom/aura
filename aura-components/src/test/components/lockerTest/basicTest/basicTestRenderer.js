({
    render : function(cmp, helper) {
        var ret = cmp.superRender();

        if (cmp.get("v.testRenderer") === true) {
            if (cmp.toString().indexOf("SecureComponent") !== 0) {
                throw new Error("Expected component in renderer to be SecureComponent");
            }
            if (document.toString().indexOf("SecureDocument") !== 0) {
                throw new Error("Expected document in renderer to be SecureDocument");
            }
            if (window.toString().indexOf("SecureWindow") !== 0) {
                throw new Error("Expected window in renderer to be SecureWindow");
            }
            if ($A.toString().indexOf("SecureAura") !== 0) {
                throw new Error("Expected $A in renderer to be SecureAura");
            }
        }

        return ret;
    }
})