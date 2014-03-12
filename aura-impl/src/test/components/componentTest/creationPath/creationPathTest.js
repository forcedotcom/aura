/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	failOnWarning : false, // Setting this to true will enable test failure on warnings so we can see any stack issues

	waitForLayoutChange : function(cmp) {
		var target = cmp;
        $A.test.addWaitForWithFailureMessage(
        		true,
        		function(){return target._layoutChanged || false},
        		"waiting for layout change",
        		function(){target._layoutChanged = false});
	},

	assertCreationPath : function(cmp, path, msg) {
		var cp = cmp.creationPath;
		$A.test.assertEquals(path, cp.substring(cp.indexOf("/")), msg); 
	},
	
	addComponent : function(root, cmp, descriptor, value) {
		var count = cmp.getAttributes().get("output").length;
    	root.getAttributes().getValue("descriptor").setValue(descriptor);
    	root.getAttributes().getValue("value").setValue(value);
    	cmp.find("trigger").get("e.press").fire();
    	$A.test.addWaitForWithFailureMessage(
    			count + 1,
    			function(){return cmp.getAttributes().get("output").length},
    			"waiting for output length to increment after adding component");
	},
	
    setUp: function(cmp) {
    	this.waitForLayoutChange(cmp);
    },
    
	testRoot : {
		test : function(cmp) {
			this.assertCreationPath(cmp, "/*[0]", "root is only body");
		}
	},
	
	testBody : {
		test : function(cmp) {
			this.assertCreationPath(cmp.find("topbody"), "/*[0]/$/*[0]", "body belongs to super's (first)");
			this.assertCreationPath(cmp.find("topmodel"), "/*[0]/$/*[1]", "body belongs to super's (second)");
		}
	},
	
	testNested : {
		test : function(cmp) {
			this.assertCreationPath(cmp.find("nestingmodel"), "/*[0]/$/*[1]/*[1]");
			this.assertCreationPath(cmp.find("nestedmodel"), "/*[0]/$/*[1]/*[1]/*[1]");
			this.assertCreationPath(cmp.find("nestedbody"), "/*[0]/$/*[1]/*[1]/*[2]");
			this.assertCreationPath(cmp.find("nestestbody"), "/*[0]/$/*[1]/*[1]/*[1]/*[1]");
			this.assertCreationPath(cmp.find("nestestmodel"), "/*[0]/$/*[1]/*[1]/*[1]/*[2]");
		}
	},
	
	testFacet : {
		test : function(cmp) {
			this.assertCreationPath(cmp.find("headerbody"), "/*[0]/$/*[1]/headerComponents[0]");
			this.assertCreationPath(cmp.find("headermodel"), "/*[0]/$/*[1]/headerComponents[1]");
			this.assertCreationPath(cmp.find("innermodel"), "/*[0]/$/*[1]/innerComponents[0]");
			this.assertCreationPath(cmp.find("innermodel2"), "/*[0]/$/*[1]/innerComponents[1]");
		}
	},
	
	testDefaultLayoutItem : {
		test : function(cmp) {
			$A.test.assertEquals("fromDefaultLayout", $A.test.getText(cmp.find("layoutTarget").getElement()));
			this.assertCreationPath(cmp.find("layoutTarget").getAttributes().get("body")[0], "/*[0]");
		}
	},
	
	testActionLayoutItem : {
		attributes : { __layout : "#action" },
		test : function(cmp) {
			$A.test.assertEquals("action:java:0", $A.test.getText(cmp.find("layoutTarget").getElement()));
			this.assertCreationPath(cmp.find("layoutTarget").getAttributes().get("body")[0], "/*[0]");
		}
	},
	
	testChangeLayoutItem : {
		attributes : { __layout : "#action" },
		test : [ function(cmp) {
			$A.test.assertEquals("action:java:0", $A.test.getText(cmp.find("layoutTarget").getElement()));
			$A.layoutService.layout("default");
			this.waitForLayoutChange(cmp);
		}, function(cmp){
			$A.test.assertEquals("fromDefaultLayout", $A.test.getText(cmp.find("layoutTarget").getElement()));
			this.assertCreationPath(cmp.find("layoutTarget").getAttributes().get("body")[0], "/*[0]");
		}]
	},
	
	testIfTrue : {
		attributes : { iftrue : true },
		test : function(cmp) {
			this.assertCreationPath(cmp.find("truebody"), "/*[0]/$/*[2]/+[0]");
			$A.test.assertUndefined(cmp.find("falsebody"));
		}
	},

	testIfFalse : {
		attributes : { iftrue : false },
		test : function(cmp) {
			$A.test.assertUndefined(cmp.find("trueebody"));
			this.assertCreationPath(cmp.find("falsebody"), "/*[0]/$/*[2]/+[0]");
		}
	},

	testIfChangedToTrue : {
		attributes : { iftrue : false },
		test : [ function(cmp) {
			$A.run(function(){cmp.getAttributes().getValue("iftrue").setValue(true)});
			$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.isUndefined(cmp.find("truebody"))}, "'true' components not instantiated");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("truebody"), "/*[0]/+[0]");
			this.assertCreationPath(cmp.find("falsebody"), "/*[0]/$/*[2]/+[0]");
		}]
	},

	testIfChangedToFalse : {
		attributes : { iftrue : true },
		test : [ function(cmp) {
			$A.run(function(){cmp.getAttributes().getValue("iftrue").setValue(false)});
			$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.isUndefined(cmp.find("falsebody"))}, "'false' components not instantiated");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("truebody"), "/*[0]/$/*[2]/+[0]");
			this.assertCreationPath(cmp.find("falsebody"), "/*[0]/+[0]");
		}]
	},

	testSingleIteration : {
		attributes : { list : "x" },
		test : function(cmp) {
			this.assertCreationPath(cmp.find("iterinst"), "/*[0]/$/*[3]/+[0]/*[0]");
			this.assertCreationPath(cmp.find("iterinst").find("output"), "/*[0]/$/*[3]/+[0]/*[0]/$/*[0]");
		}
	},
	
	testMultipleIteration : {
		attributes : { list : "x,x,x" },
		test : function(cmp) {
			this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/+[0]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/+[0]/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/+[1]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[3]/+[1]/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[2], "/*[0]/$/*[3]/+[2]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[2].find("output"), "/*[0]/$/*[3]/+[2]/*[0]/$/*[0]");
		}
	},
	
	/* W-2036263
	Warning: Improper index increment aura_autodebug.js:10765
    Improper index increment aura_autodebug.js:10769
    stack aura_autodebug.js:10772
	    at $A.$ns$.$Aura$.$warning$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10676:42) aura_autodebug.js:10774
	    at Action.$setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5758:10) aura_autodebug.js:10774
	    at $setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10529:9) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createComponentsForIndex (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4297:13) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createRealBody (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4448:31) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.rerenderEverything (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4487:14) aura_autodebug.js:10774
	    at Action.$A.clientService.initDefs.componentDefs.value.controllerDef.value.actionDefs.value.code [as $meth$] (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4658:20) aura_autodebug.js:10774
	    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5864:36) aura_autodebug.js:10774
	    at http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:2494:20 
	 */
	testChangeIterationSize : {
		attributes : { list : "x,x,x" },
		test : [ function(cmp) {
			$A.run(function(){cmp.find("iteration").getAttributes().getValue("start").setValue(1)});
			$A.test.addWaitForWithFailureMessage(2, function(){return cmp.find("iterinst").length}, "number of iterations not reduced");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[0]");
		}]
	},
	
	/* W-2036263
	Warning: Improper index increment aura_autodebug.js:10765
    Improper index increment aura_autodebug.js:10769
    stack aura_autodebug.js:10772
	    at $A.$ns$.$Aura$.$warning$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10676:42) aura_autodebug.js:10774
	    at Action.$setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5758:10) aura_autodebug.js:10774
	    at $setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10529:9) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createComponentsForIndex (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4297:13) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createRealBody (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4448:31) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.rerenderEverything (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4487:14) aura_autodebug.js:10774
	    at Action.$A.clientService.initDefs.componentDefs.value.controllerDef.value.actionDefs.value.code [as $meth$] (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4658:20) aura_autodebug.js:10774
	    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5864:36) aura_autodebug.js:10774
	    at http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:2494:20 
	 */
	testAddInitialIteration : {
		attributes : { list : "" },
		test : [function(cmp) {
			$A.test.assertUndefined(cmp.find("iterinst"));
			$A.run(function(){cmp.getAttributes().getValue("list").push("x")});
			$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.isUndefined(cmp.find("iterinst"))}, "iteration is still empty");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("iterinst"), "/*[0]");
			this.assertCreationPath(cmp.find("iterinst").find("output"), "/*[0]/$/*[0]");
		}]
	},
	
	/* W-2036263
	Warning: Improper index increment aura_autodebug.js:10765
    Improper index increment aura_autodebug.js:10769
    stack aura_autodebug.js:10772
	    at $A.$ns$.$Aura$.$warning$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10676:42) aura_autodebug.js:10774
	    at Action.$setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5758:10) aura_autodebug.js:10774
	    at $setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10529:9) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createComponentsForIndex (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4297:13) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createRealBody (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4448:31) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.rerenderEverything (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4487:14) aura_autodebug.js:10774
	    at Action.$A.clientService.initDefs.componentDefs.value.controllerDef.value.actionDefs.value.code [as $meth$] (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4658:20) aura_autodebug.js:10774
	    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5864:36) aura_autodebug.js:10774
	    at http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:2494:20 
	 */
	testAddAdditionalIteration : {
		attributes : { list : "x" },
		test : [function(cmp) {
			this.assertCreationPath(cmp.find("iterinst"), "/*[0]/$/*[3]/+[0]/*[0]");
			$A.run(function(){cmp.getAttributes().getValue("list").push("x")});
			$A.test.addWaitForWithFailureMessage(2, function(){return cmp.find("iterinst").length}, "number of iterations didn't increment");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/+[0]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/+[0]/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[0]");
		}]
	},
	
	/* W-2036263
	Warning: Improper index increment aura_autodebug.js:10765
    Improper index increment aura_autodebug.js:10769
    stack aura_autodebug.js:10772
	    at $A.$ns$.$Aura$.$warning$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10676:42) aura_autodebug.js:10774
	    at Action.$setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5758:10) aura_autodebug.js:10774
	    at $setCreationPathIndex$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:10529:9) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createComponentsForIndex (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4297:13) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.createRealBody (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4448:31) aura_autodebug.js:10774
	    at Object.$A.clientService.initDefs.componentDefs.value.helperDef.value.functions.rerenderEverything (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4487:14) aura_autodebug.js:10774
	    at Action.$A.clientService.initDefs.componentDefs.value.controllerDef.value.actionDefs.value.code [as $meth$] (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…erations%22%2C%22fwuid%22%3A%22-yq3oCwGlxsZ49YUZMpO_g%22%7D/app.js:4658:20) aura_autodebug.js:10774
	    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:5864:36) aura_autodebug.js:10774
	    at http://localhost:9090/auraFW/javascript/-yq3oCwGlxsZ49YUZMpO_g/aura_autodebug.js:2494:20 
	 */
	testAddMultipleIterations : {
		attributes : { list : "x,x" },
		test : [function(cmp) {
			this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/+[0]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/+[1]/*[0]");
			$A.run(function(){var list = cmp.getAttributes().getValue("list"); list.push("x"); list.push("x");});
			$A.test.addWaitForWithFailureMessage(4, function(){return cmp.find("iterinst").length}, "number of iterations didn't increment");
		}, function(cmp) {
			this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/+[0]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/+[0]/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/+[1]/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[3]/+[1]/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[2], "/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[2].find("output"), "/*[0]/$/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[3], "/*[0]");
			this.assertCreationPath(cmp.find("iterinst")[3].find("output"), "/*[0]/$/*[0]");
		}]
	},
	
	testAddClientCmp : {
        test : [function(cmp) {
        	this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "hi");
        }, function(cmp) {
        	$A.test.assertEquals("0 - hi", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[0], "/*[0]");
        }]
	},

	/* W-2036260
	Warning: Not ready to create. path: 1.0/*[0] aura_autodebug.js:10765
	Not ready to create. path: 1.0/*[0] aura_autodebug.js:10769
	stack aura_autodebug.js:10772
	    at $A.$ns$.$Aura$.$warning$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:10676:42) aura_autodebug.js:10774
	    at Action.$getCurrentPath$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:5768:8) aura_autodebug.js:10774
	    at new ComponentPriv (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:3847:37) aura_autodebug.js:10774
	    at new Component (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:4480:17) aura_autodebug.js:10774
	    at $A.$ns$.$ComponentCreationContext$.$buildComponent$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:7829:10) aura_autodebug.js:10774
	    at $A.$ns$.$ComponentCreationContext$.$loadComponent$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:7758:24) aura_autodebug.js:10774
	    at new $A.$ns$.$ComponentCreationContext$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:7727:10) aura_autodebug.js:10774
	    at $A.$ns$.$AuraComponentService$.$newComponentAsync$ (http://localhost:9090/auraFW/javascript/ZlJXJMg4gWLUgcIfiU5dsg/aura_autodebug.js:7935:13) aura_autodebug.js:10774
	    at Action.$A.clientService.initDefs.componentDefs.value.controllerDef.value.actionDefs.value.code [as $meth$] (http://localhost:9090/l/%7B%22mode%22%3A%22AUTOJSTESTDEBUG%22%2C%22app%22%3…lientCmp%22%2C%22fwuid%22%3A%22ZlJXJMg4gWLUgcIfiU5dsg%22%7D/app.js:6933:29) 
	  */  
	testAddMultipleClientCmp : {
        test : [function(cmp) {
        	this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "a");
        }, function(cmp) {
        	$A.test.assertEquals("0 - a", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[0], "/*[0]");
			
        	this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "bb");
        }, function(cmp) {
        	$A.test.assertEquals("0 - abb", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[1], "/*[0]");
        }]
	},

	testAddServerCmp : {
        test : [function(cmp) {
        	this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "bye");
        }, function(cmp) {
        	$A.test.assertEquals("0 - bye footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[0], "/*[0]");
        }]
	},

	testAddMultipleServerCmp : {
        test : [function(cmp) {
        	this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "x");
        }, function(cmp) {
        	$A.test.assertEquals("0 - x footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[0], "/*[0]");
			
        	this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "yy");
        }, function(cmp) {
        	$A.test.assertEquals("0 - x footerdefault yy footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
			this.assertCreationPath(cmp.find("iterinst").getAttributes().get("output")[1], "/*[0]");
        }]
	}
})
