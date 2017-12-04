({
    testModuleCssBaseSelectors: {
        test: [
            function(cmp) {
                // Test class selector
                var contentEl = document.querySelector('.content');
                $A.test.assertEquals('10px', window.getComputedStyle(contentEl).marginLeft);

                // Test attribute selector
                var legendEl = document.querySelector('[title="legend"]');
                $A.test.assertEquals('9px', window.getComputedStyle(legendEl).fontSize);

                // Test selector chain
                var liEl = document.querySelector('ul li');
                $A.test.assertEquals('block', window.getComputedStyle(liEl).display);

                // Test multiple selectors
                var fooEl = document.querySelector('.foo');
                $A.test.assertEquals('100px', window.getComputedStyle(fooEl).width);
                var barEl = document.querySelector('.bar');
                $A.test.assertEquals('100px', window.getComputedStyle(barEl).width);
            }
        ]
    },

    testModuleCssNewSelectors: {
        test: [
            function(cmp) {
                // Test ":host" selector
                var child = document.querySelector('moduletest-css-child');
                $A.test.assertEquals('rgb(0, 0, 255)', window.getComputedStyle(child).backgroundColor);

                // Test ":host" selector with "is" attribute
                var childIs = document.querySelector('[is="moduletest-css-child"]');
                $A.test.assertEquals('rgb(0, 0, 255)', window.getComputedStyle(childIs).backgroundColor);

                // Test ":host" functional form selector
                var childActive = document.querySelector('moduletest-css-child.active');
                $A.test.assertEquals('rgb(0, 128, 0)', window.getComputedStyle(childActive).backgroundColor);

                // Test ":host-context" selector
                var childDark = document.querySelector('.dark-theme > moduletest-css-child');
                $A.test.assertEquals('rgb(255, 255, 255)', window.getComputedStyle(childDark).color);
            }
        ]
    },

    testModuleCssScoping: {
        test: [
            function(cmp) {
                // Test "h1" selector scoped to the parent component
                var parentH1 = document.querySelector('moduletest-css-parent > h1');
                $A.test.assertEquals('rgb(255, 0, 0)', window.getComputedStyle(parentH1).color);
                // and should not be applied to the children
                var childrenH1 = document.querySelectorAll('moduletest-css-child > h1')
                for (var i = 0; i < childrenH1.length; i++) {
                    $A.test.assertNotEquals('rgb(255, 0, 0)', window.getComputedStyle(childrenH1[i]).color);
                }
            }
        ]
    }
})
