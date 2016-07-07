({
    testIsVoiceOverDefault : {
        test : function(cmp) {
            $A.test.assertEquals("" + $A.get("$Global.isVoiceOver"), $A.test.getTextByComponent(cmp.find("data")));
        }
    },

    _testIsVoiceOverChange : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true)
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("data")));
            $A.set("$Global.isVoiceOver", false)
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("data")));
            $A.set("$Global.isVoiceOver", true)
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("data")));
        } ]
    },

    insertClientSide : function(cmp) {
        var finished = false;

        $A.componentService.newComponentAsync(this, function(newCmp) {
                cmp.find("insertion").set("v.body", [ newCmp ]);
                finished = true;
            },
            {
                "componentDef": "gvpTest:voiceOverTest"
            });
        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() {
            return finished
        });
    },

    insertServerSide : function(cmp) {
        var finished = false;
        $A.createComponent("gvpTest:voiceOverTest", {}, function(newCmp,
                status, errorMsg) {
            if (status == "SUCCESS") {
                cmp.find("insertion").set("v.body", [ newCmp ])
                finished = true;
            }
        });

        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() {
            return finished
        });
    },

    testIsVoiceOverTrueOnCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true);
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverFalseOnCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", false);
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverTrueOnServerCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true);
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverFalseOnServerCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", false);
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    }
})
