({
    iterationComplete: function(cmp, event) {
        cmp.set("v.iterationCompleteFired", true);
        cmp.set("v.iterationCompleteOperation", event.getParam("operation"));
    }
})