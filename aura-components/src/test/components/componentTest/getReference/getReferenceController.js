({
    setTargetGetReference: function(cmp, event) {
        var key = event.getParam('arguments').key;
        var target = cmp.get("v.target");

        cmp._targetReference = target.getReference(key);
    }
})
