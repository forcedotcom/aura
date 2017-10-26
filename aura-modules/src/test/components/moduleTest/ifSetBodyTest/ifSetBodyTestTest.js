({
    testSetInteropModuleAsBodyInIf: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){
                        return cmp.get('v.body').length;
                    },
                    "The body didn't get set.",
                    function() {
                        $A.test.assertEquals('MODULETEST-SIMPLE-CMP', cmp.get('v.body')[0].getElement().tagName);
                    });
            },
            function (cmp) {
                $A.test.clickOrTouch(cmp.find("set").getElement());
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){
                        return cmp.get('v.body').length;
                    },
                    "The body didn't get set with a different instance.",
                    function() {
                        $A.test.assertEquals('body2', cmp.get('v.body')[0].getElement().literal);
                    });
            },
            function (cmp) {
                $A.test.clickOrTouch(cmp.find("toggleBody").getElement());
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){
                        return cmp.get('v.body').length;
                    },
                    "The body didn't get set with a different instance.",
                    function() {
                        $A.test.assertEquals('body1', cmp.get('v.body')[0].getElement().literal);
                    });
            },
            function (cmp) {
                $A.test.clickOrTouch(cmp.find("toggleFlag").getElement());
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){
                        return cmp.get('v.body').length;
                    },
                    "The body didn't get set with a different instance.",
                    function() {
                        $A.test.assertEquals('body1', cmp.get('v.body')[0].getElement().literal);
                    });
            },
        ]
    }
})