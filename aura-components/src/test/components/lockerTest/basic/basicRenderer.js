({
    render: function(component, helper) {
        var ret = component.superRender();
        
        var div = document.createElement("div");
        div.id = "DutchDidIt";
        div.className = "smoothAsButter";
        
        function testSymbol(symbol) {
            // Test out self and Function tricks
            var source = 
                "var global = " + symbol + ";" + 
                "helper.log(component, \"Global window via " + symbol.replace(/"/g, "\\\"") + ": \" + global);";
            
            try {
                eval(source);
            } catch (x) {
                var error = x.toString();
                if (error.indexOf("TypeError") < 0 && error.indexOf("ReferenceError") < 0 && error.indexOf("Security violation: use of __pro" + "to__ is not permitted!") < 0) {
                    throw Error("Unexpected exception: " + x.toString());
                }
        
                helper.log(component, "Blocked: " + symbol);
            }
        }
        
        helper.log(component, "Cloister controller scope: { document: " + document + ", window: " + window + ", $A: " + $A + " }");
        
        ["self", "top", "parent", "(function () { return this }())", "Function('return this')()", "toString.constructor.prototype", "constructor.constructor('alert(this)')()",
         "''.substring.call.call(({})[\"constructor\"].getOwnPropertyDescriptor(''.substring.__pro" + "to__, \"constructor\").value, null, \"return this;\")()"].forEach(testSymbol);
        
        try {
            // Should not be allowed because SecureElement is Object.freeze()'ed - we can support this if we want to though using Object.defineProperty
            div.onclick = function(event) {  
            };
        } catch (x) {
            if (x.toString().indexOf("TypeError") < 0) {
                throw Error("Unexpected exception: " + x.toString());
            }
        }
        
        var clickTestDiv = component.find("clickTest").getElement();
        clickTestDiv.addEventListener("click", function(e) {
            alert("{ component: " + component + ", this: " + this + ", document: " + document + ", window: " + window + " }");
        });
                
        var content = component.find("content");
        var contentEl = content.getElement();
        contentEl.appendChild(div);
        
        var scripts = [];
        ["scriptA.js", "scriptB.js", "scriptC.js"].forEach(function(s) {
            var script = document.createElement("script");
            script.src = s;
            
            scripts.push(script);
        });
        
        scripts.forEach(function(script) {
            contentEl.appendChild(script);
        });
        
        return ret;
    },
    
    afterRender: function(component, helper) {
        component.superAfterRender();
        
        function testNoAccess(scenario, successMessage) {
            try {
                scenario();
                throw Error("Senario should not have successed: " + successMessage);
            } catch (x) {
                if (x.toString().indexOf("Access denied") < 0) {
                    throw x;
                }
                
                helper.log(component, successMessage);
            }
        }

        testNoAccess(function() {
            var content = component.find("content");
            var div = content.getElement();
            var parentNode = div.parentNode;
        }, "Blocked access to div.parentNode in afterRender()");
        
        // DCHASMAN TODO Add hasAccess check in Component.getElement()
        /*testNoAccess(function() {
        	var button = component.find("button");
            var element = button.getElement();
        }, "Blocked access to button.getElement() in afterRender()");*/
    }
})