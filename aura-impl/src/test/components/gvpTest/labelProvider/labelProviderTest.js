({
    testAsyncLabelProvider: {
        test: function(cmp) {

            $A.test.addWaitFor(
                true,
                $A.test.allActionsComplete,
                function(){
                    $A.test.assertEquals("Today", cmp.get("v.simplevalue1.value"), "Failed to get Label");
                }
            );
        }
    },

    testNonExistingSection: {
        test: function(cmp) {
            $A.test.addWaitFor(
                true,
                $A.test.allActionsComplete,
                function(){

                    var sv2 = cmp.get("v.simplevalue2.value");

                    $A.test.assertTrue(
                        sv2 === "FIXME - LocalizationAdapter.getLabel() needs implemenation!" ||
                        sv2 === "[DOESNT.EXIST]",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testNonExistingLabel: {
        test: function(cmp) {
            $A.test.addWaitFor(
                true,
                $A.test.allActionsComplete,
                function(){

                    var sv3 = cmp.get("v.simplevalue3.value");

                    $A.test.assertTrue(
                        sv3 === "FIXME - LocalizationAdapter.getLabel() needs implemenation!" ||
                        sv3 === "__MISSING LABEL__ PropertyFile - val DOESNTEXIST not found in section Related_Lists",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testGVPCallback: {
        test: [
            function(cmp) {

                $A.getGlobalValueProviders().get("$Label.Related_Lists.task_mode_today", cmp, function(res) {
                   $A.test.assertEquals("Today", res, "Failed: Wrong label value in callback");
                });
            },

            function(cmp) {

                var tmt = $A.getGlobalValueProviders().getValue("$Label.Related_Lists.task_mode_today", cmp, function(res) {

                    $A.test.assertEquals("Today", res.getValue(), "Failed: Wrong label value in callback");
                    $A.test.assertEquals("SimpleValue", res.toString(), "Failed: Return value not a SimpleValue");
                });

                $A.test.addWaitFor(
                        true,
                        $A.test.allActionsComplete,
                        function(){
                            $A.test.assertEquals("Today", tmt.getValue(), "Label should already be context so it should be the return value");
                        }
                    );
            }
        ]
    },

    testInvalidGVPExpressions: {
        test: function(cmp) {
            var result = $A.getGlobalValueProviders().get("v.simplevalue3.value");
            $A.test.assertEquals(undefined, result, "Invalid GVP expression should return undefined");
        }
    },
    
    testPartialLabelExpressions: {
	test:[
	     //Wait for all labels to be fetched and GVP to be ready
	     function(cmp){
                $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete
                );
	     },
	     //Section and name missing from label expression
	     function(cmp){
		  $A.test.setTestTimeout(15000);
        	  var gvp = $A.getGlobalValueProviders();
        	  var labels = gvp.getValue("$Label");
        	  $A.test.assertDefined(labels);
        	  $A.test.assertEquals("MapValue", labels.toString());
        	  $A.test.assertEquals("Today", labels.get("Related_Lists")["task_mode_today"], "Failed to get Label");
    	     }, 
    	     //Expression without Name missing but valid section
    	     function(cmp){
    		 var gvp = $A.getGlobalValueProviders();
    		 var section = gvp.getValue("$Label.Related_Lists");
    		 $A.test.assertDefined(section);
    		 $A.test.assertEquals("MapValue", section.toString());
    		 $A.test.assertEquals("Today", section.get("task_mode_today"), "Failed to get Label");
    	     }, 
    	     //Expression without an invalid section only
    	     function(cmp){
    		$A.test.addWaitFor(
    	                true,
    	                $A.test.allActionsComplete,
    	                function(){
    	                    var sv4 = cmp.get("v.simplevalue4.value");
    	                    $A.test.assertTrue(
    	                        sv4 === "FIXME - LocalizationAdapter.getLabel() needs implemenation!",
    	                        "Failed to get expected error message");
    	                }
    	         );
    	     }, 
    	     //Requesting invalid section the second time, should not cause a server round trip
    	     function(cmp){
    		var gvp = $A.getGlobalValueProviders();
    		var section = gvp.getValue("$Label.DOESNTEXIST");
    		$A.test.assertFalse($A.test.isActionPending(), 
   			"Subsequent requests for invalid label section should not cause server roundtrip");
//TODO - W-1648796 - Creating label called null in invalid section
//    		var nullLabel = section.get("null");
//   		$A.test.assertUndefinedOrNull(nullLabel, "Created a label called null in invalid section");
   		
   		//Request for a label from an invalid section, framework should be intelligent to see that no such section exists and not cause a server round trip
//TODO - W-1648798 - Once a section is known to be missing, why try to fetch labels from server?    		
//   		var labelFromInvalidSection = gvp.getValue("$Label.DOESNTEXIST.label");
//   		$A.test.assertFalse($A.test.isActionPending(), 
//			"Subsequent requests for labels in invalid section should not cause server roundtrip");
    	     }, 
    	     //Requesting invalid section using client API
    	     function(cmp){
    		var gvp = $A.getGlobalValueProviders();
    		gvp.getValue("$Label.FooBared");
    		$A.test.assertTrue($A.test.isActionPending(), 
			"Fetching new section should have caused a label fetch from server");
    		$A.test.addWaitFor(
    	                true,
    	                $A.test.allActionsComplete,
    	                function(){
    	                    var section = gvp.getValue("$Label.FooBared");
    	                    $A.test.assertFalse($A.test.isActionPending(), 
    	                    	"Subsequent requests for invalid label section should not cause server roundtrip");
    	                }
    	         );
    	     }
	]
    },
    
    /**
     * General tests for Global Value Providers 
     */
    
    testNonGVP: {
	test:function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    $A.test.assertUndefinedOrNull(gvp.getValue("undefined"));
	    //TODO:W-1648936 $A.test.assertUndefinedOrNull(gvp.getValue(undefined));
	    $A.test.assertUndefinedOrNull(gvp.getValue(""));
	    //W-1648936 $A.test.assertUndefinedOrNull(gvp.getValue(null));
	    $A.test.assertUndefinedOrNull(gvp.getValue("$Foo.bar"));
	}
    },
    testGetWithCallback:{
	test:[
	  //Fetch a new label from server    
	  function(cmp){
	    var gvp = $A.getGlobalValueProviders();
	    gvp.get("$Label.Related_Lists.FooBar", undefined, 
		    function(label){
			cmp._callBack = true; cmp._label=label;
		    });
	    $A.test.addWaitForWithFailureMessage(
		    true,
		    function(){return cmp._callBack},
		    "Failed to run call back after fetching label from server",
		    function(){
			$A.test.assertEquals("FIXME - LocalizationAdapter.getLabel() needs implemenation!", cmp._label);
		    })
	  },
	  //Fetch existing GVPs at client
	  function(cmp){
	      cmp._callBack = false;
	      var gvp = $A.getGlobalValueProviders();
	      gvp.get("$Label.Related_Lists.FooBar", undefined, 
		    function(label){
			cmp._callBack = true; cmp._label=label;
		    });
	      //No need to wait for unlike previous case, call backs are immediate as value is available at client
	      $A.test.assertTrue(cmp._callBack);
	      $A.test.assertEquals("FIXME - LocalizationAdapter.getLabel() needs implemenation!", cmp._label); 
	  },
	  //Non function callback
	  function(cmp){
	      var fixMeLabel = "FIXME - LocalizationAdapter.getLabel() needs implemenation!";
	      var gvp = $A.getGlobalValueProviders();
	      var label = gvp.get("$Label.Related_Lists.FooBar", undefined, "Mary Poppins");
	      $A.test.assertEquals(fixMeLabel, label);
	      $A.test.assertEquals(fixMeLabel,
		      gvp.get("$Label.Related_Lists.FooBar", undefined, undefined));
	      
	  }
	  ]
    }


})
