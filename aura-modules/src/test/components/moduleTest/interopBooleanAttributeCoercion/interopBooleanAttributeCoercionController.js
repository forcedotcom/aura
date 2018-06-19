({
    handleInit: function(cmp) {
        // This attribute set() exists to reproduce the issue described in
        // W-5096195. If this ever causes an error to be thrown, we probably
        // have a regression.
        cmp.find('no-component-attributes-specified').set('v.booleanAttribute', true);
    }
})