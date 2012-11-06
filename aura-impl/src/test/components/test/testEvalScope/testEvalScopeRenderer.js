({
    render: function(cmp) {
        var canSeeIt = typeof componentService !== "undefined";
        var node;
        if (canSeeIt) {
            // then we got the thing that shouldn't exist here...
            node = document.createTextNode("FAIL: saw componentService in renderer enclosed from framework");
        } else {
            node = document.createTextNode("PASS: unable to see componentService");
        }
        return node;
    }
})