({
    testParentSetsAttributeOnChild: {
        test: function(cmp) {
            var expected = "String Set From Parent";
            var child = cmp.find("childComponent");
            cmp.set("v.parentStringAttribute", expected);

            $A.test.addWaitFor(expected, function() {
                return child.find("childStringOutput").getElement().innerText;
            });
        }
    },

    testParentSetsAttributeWithPathOnChild: {
        test: function(cmp) {
            var expected = "Map Set From Parent";
            var child = cmp.find("childComponent");
            cmp.set("v.parentMapAttribute.Name", expected);

            $A.test.addWaitFor(expected, function() {
                return child.find("childMapOutput").getElement().innerText;
            });
        }
    },

    testChildSetsAttributeOnParent: {
        test: function(cmp) {
            var expected = "String Set From Child";
            var child = cmp.find("childComponent");
            child.set("v.childStringAttribute", expected);

            $A.test.addWaitFor(expected, function() {
                return cmp.find("parentStringOutput").getElement().innerText;
            });
        }
    },

    testChildSetsAttributeWithPathOnParent: {
        test: function(cmp) {
            var expected = "Map Set From Child";
            var child = cmp.find("childComponent");
            child.set("v.childMapAttribute.Name", expected);

            $A.test.addWaitFor(expected, function() {
                return cmp.find("parentMapOutput").getElement().innerText;
            });
        }
    },

    testHtmlAttributesPrv: {
        test: function(cmp) {
            var target = cmp.find("liWithPrv");
            var expected = "Changed from prv";
            target.set("v.HTMLAttributes.prv", expected);

            $A.test.addWaitFor(expected, function() {
                return target.getElement().innerText;
            });
        }
    }
})
