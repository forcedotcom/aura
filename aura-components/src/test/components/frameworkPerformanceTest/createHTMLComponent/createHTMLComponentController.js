({
    
    run: function (cmp, event) {
        // Create the attributes that cover most of the 
        var attrs = {
            tag            : 'span',
            HTMLAttributes : {
                className : 'foo',
                onclick   : '',
                href      : '/foo'
            }
        };

        $A.createComponent('aura:html', attrs, function (newCmp) {
            var done      = event.getParam('arguments').done;
            var container = cmp.find('container').getElement();

            $A.render(newCmp, container); // Render manually here since we get a better flow control
            done.immediate(); // We are done creating and rendering
        });
    },
    postProcessing: function (cmp, event) {
        var results = event.getParam('arguments').results;
        console.log(results);
    }
})