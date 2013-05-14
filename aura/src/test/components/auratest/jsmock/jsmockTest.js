({
	testModelDefault : {
		test : function(cmp) {
			$A.test.assertEquals("password", $A.test.getText(cmp.find("output").getElement()));
		}
	},

	testModelProperties : {
		mocks : [{
    		type : "MODEL",
			stubs : [{
				answers : [{
					value : {
						secret : { value : "<not available>" } ,
						integer : { value : 1 },
						integerString : { value : "3" },
						stringList : { value : [ "early", "on", "time", "late"] }
					}
				}]
			}]                   
		}],
		test : function(cmp) {
			$A.test.assertEquals("<not available>ontime", $A.test.getText(cmp.find("output").getElement()));
		}
	},
	
	_testModelThrowsOnInstantiation : {
		mocks : [{
    		type : "MODEL",
			stubs : [{
				answers : [{
					error : "org.auraframework.throwable.AuraRuntimeException"
				}]
			}]                   
		}],
		test : function(cmp) {
			$A.test.assertEquals("<not available>", $A.test.getText(cmp.find("output").getElement()));
		}
	},
	
	_testModelThrowsOnGet : {
		mocks : [{
    		type : "MODEL",
			stubs : [{
				answers : [{
					value : { secret : { error : "org.auraframework.throwable.AuraRuntimeException" } }
				}]
			}]                   
		}],
		test : function(cmp) {
			$A.test.assertEquals("<not available>", $A.test.getText(cmp.find("output").getElement()));
		}
	},
	
	testProviderAttributes : {
		mocks : [{
    		type : "PROVIDER",
			stubs : [{
				answers : [{
					value : { attributes : { providedAttribute : "fresh"} }
				}]
			}]                   
		}],
		test : function(cmp) {
			$A.test.assertEquals("freshpassword", $A.test.getText(cmp.find("output").getElement()));
		}
	},
	
	testProviderDescriptorAndAttributes : {
		mocks : [{
    		type : "PROVIDER",
			stubs : [{
				answers : [{
					value : { 
						descriptor : "aura:text",
						attributes : { value : "fresh"}
					}
				}]
			}]                   
		}],
		test : function(cmp) {
			$A.test.assertEquals("markup://aura:text", cmp.getDef().getDescriptor().getQualifiedName());
			$A.test.assertEquals("fresh", $A.test.getText(cmp.getElement()));
		}
	},
	
	testProviderConfigProvider: {
	    	attributes : { providedAttribute : "Hello, I am the Mock Java Provider!"},
	    	mocks : [{
	    	    	type : "PROVIDER",
	    	    	//Descriptor not required in this case, but specifying it anyway
	    	    	descriptor : "java://org.auraframework.impl.java.provider.EmptyConfigProvider",
	    		stubs : [{
	    		    answers : [{
	    			value: {
	    			    //Specify the mock java provider the test should use, class should be accessible 
	    			    configProvider : "java://org.auraframework.impl.java.provider.MockConfigProvider"
	    			}
	    		    }]
	    		}]
	    	}],
	    	test : function(cmp){
        	    	$A.test.assertEquals("markup://ui:outputText", cmp.getDef().getDescriptor().getQualifiedName());
        		$A.test.assertEquals("Hello, I am the Mock Java Provider!", $A.test.getText(cmp.getElement()));
	    	}
	    
	},
	
	testActionDefault : {
		test : [function(cmp) {
			this.saveDate = Date.parse(new Date());
			cmp.find("trigger").get("e.press").fire();
			$A.test.addWaitFor(true, function(){return "password" != $A.test.getText(cmp.find("output").getElement())});
		}, function(cmp) {
			var newDate = Date.parse($A.test.getText(cmp.find("output").getElement()));
			$A.test.assertTrue(newDate >= this.saveDate);
		}]
	},
		
	testActionString : {
		mocks : [{
		    type : "ACTION",
			stubs : [{
				method : { name : "getString" },
				answers : [{
					value : "what I expected"
				}]
			}]
		}],
		test : [function(cmp) {
			cmp.find("trigger").get("e.press").fire();
			$A.test.addWaitFor(true, function(){return "password" != $A.test.getText(cmp.find("output").getElement())});
		}, function(cmp) {
			$A.test.assertEquals("what I expected", $A.test.getText(cmp.find("output").getElement()));
		}]
	},
	
	_testActionThrows : {
		mocks : [{
		    type : "ACTION",
			stubs : [{
				method : { name : "getString" },
				answers : [{
					error : "java.lang.IllegalStateException"
				}]
			}]
		}],
		test : [function(cmp) {
			cmp.find("trigger").get("e.press").fire();
			$A.test.addWaitFor(true, function(){return "password" != $A.test.getText(cmp.find("output").getElement())});
		}, function(cmp) {
			$A.test.assertEquals("what I expected", $A.test.getText(cmp.find("output").getElement()));
		}]
	}
})