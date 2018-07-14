({
    testCSSVariableApplied: {
        test: [
            function(cmp) {
                var lwcChild = cmp.find('token').getElement();
                var style = window.getComputedStyle(lwcChild, null);
                var color = style.color;
                var isYellow = color === 'rgb(255, 255, 0)' || color === 'yellow';
                $A.test.assert(isYellow, 'CSS Variable was not correctly set');
            }
        ]
    }
})
