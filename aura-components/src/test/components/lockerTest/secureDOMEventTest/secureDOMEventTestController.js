({
    getClickDOMEvent: function(cmp) {
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(event) {
            cmp.set("v.log", event);
        });
        element.click(); 
    }
})