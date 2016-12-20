({
    loadFrame: function(cmp, event, helper) {
        var iframeSrc = cmp.get("v.url"); 
        helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "bootstrapWrapperController.loadFrame()");
    }
})