({
    /**
     * Capture the state of things here in the controller and pass back to the test to verify
     */
    getWrappersFromController: function(cmp, event, helper) {
        var log = {
                'cmp': cmp,
                'event': event,
                'helper': helper,
                'document': document,
                'window': window,
                '$A': $A
        };
        cmp.set("v.log", log);
    },

    getSecureElementFromMarkup: function(cmp) {
        var div = cmp.find("content").getElement();
        cmp.set("v.log", div);
    },
    
    appendDiv: function(cmp) {
        var div = document.createElement("div");
        div.id = "myId";
        div.className = "fancypants";
        var content = cmp.find("content");
        var contentEl = content.getElement();
        contentEl.appendChild(div);
    },

    testSymbol : function(cmp, event) {
        var symbol = event.getParam('arguments').symbol;
        var result = eval(symbol);
        cmp.set("v.log", "Global window via " + symbol + ": " + result);
    },
})