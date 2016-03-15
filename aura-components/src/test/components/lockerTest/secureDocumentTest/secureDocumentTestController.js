({
    getDocument: function(cmp) {
        cmp.set("v.log", document);
    },

    getDocumentFragment: function(cmp) {
        cmp.set("v.log", document.createDocumentFragment());
    },

    getScriptElement: function(cmp) {
        cmp.set("v.log", document.createElement("script"));
    },

    getIframeElement: function(cmp) {
        cmp.set("v.log", document.createElement("iframe"));
    },

    getTextNode: function(cmp) {
        cmp.set("v.log", document.createTextNode());
    },

    createElementsPushToMarkup: function(cmp) {
        var docFragment = document.createDocumentFragment();
        var span = document.createElement("span");
        span.setAttribute("lockerAttr", "hello from the locker");
        docFragment.appendChild(span);
        var content = cmp.find("content").getElement();
        content.appendChild(docFragment);
    },

    getElementById: function(cmp) {
        cmp.set("v.log", document.getElementById("title"));
    },

    /**
     * Create our own div before finding it to guarantee we have access
     */
    getQuerySelector: function(cmp) {
        var newDiv = document.createElement("div");
        newDiv.id = "foo";
        var markupDiv = cmp.find("content").getElement();
        markupDiv.appendChild(newDiv);
        cmp.set("v.log", document.querySelector("#foo"));
    },

    getCookie: function(cmp) {
        cmp.set("v.log", document.cookie);
    },

    setTitle: function(cmp) {
        document.title = "secureDocumentTest";
    }
})
