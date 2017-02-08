({
    testDynamicTypeSizeDefault:{
        test:function(cmp){
            $A.test.assertEquals(""+$A.get("$Global.dynamicTypeSize"), $A.test.getTextByComponent(cmp.find("data")));
        }
    },

    _testDynamicTypeSizeChange:{
        test:[function(cmp) {
            $A.set("$Global.dynamicTypeSize", "small")
        }, function(cmp) {
            $A.test.assertEquals("small", $A.test.getTextByComponent(cmp.find("data")));
            $A.set("$Global.dynamicTypeSize", "medium")
        }, function(cmp) {
            $A.test.assertEquals("medium", $A.test.getTextByComponent(cmp.find("data")));
        }]
    },

    insertClientSide: function(cmp) {
        var finished = false;

        $A.createComponent("gvpTest:dynamicTypeTest", null, 
            function(newCmp) {
                cmp.find("insertion").set("v.body", [ newCmp ]);
                finished = true;
            }
        );
        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() { return finished});
    },

    insertServerSide: function(cmp) {
        var finished = false;
        var action = $A.get("c.aura://ComponentController.getComponent");

        action.setParams({
                "name" : "markup://gvpTest:dynamicTypeTest"
        });
        action.setCallback(this, function(a) {
            var newCmp = $A.createComponentFromConfig(a.getReturnValue());
            cmp.find("insertion").set("v.body", [ newCmp ])
            finished = true;
        }, "SUCCESS");
        $A.enqueueAction(action);
        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() { return finished});
    },

    testDynamicTypeSizeSmallOnCreate:{
        test:[function(cmp) {
            $A.set("$Global.dynamicTypeSize", "small");
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("small", $A.test.getTextByComponent(cmp.find("insertion")));
        }]
    },

    testDynamicTypeSizeMediumOnCreate:{
        test:[function(cmp) {
            $A.set("$Global.dynamicTypeSize", "medium");
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("medium", $A.test.getTextByComponent(cmp.find("insertion")));
        }]
    },

    testDynamicTypeSizeSmallOnServerCreate:{
        test:[function(cmp) {
            $A.set("$Global.dynamicTypeSize", "small");
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("small", $A.test.getTextByComponent(cmp.find("insertion")));
        }]
    },

    testDynamicTypeSizeMediumOnServerCreate:{
        test:[function(cmp) {
            $A.set("$Global.dynamicTypeSize", "medium");
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("medium", $A.test.getTextByComponent(cmp.find("insertion")));
        }]
    }
})
