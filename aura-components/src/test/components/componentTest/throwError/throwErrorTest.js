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
	setUp: function() {
        this._expectErrorReRender = 
        	"rerender threw an error in 'markup://componentTest:throwError'";
        this._expectErrorUnRender =
        	"Unrender threw an error in markup://componentTest:throwError";
        this._expectErrorReRenderInner =
        	"rerender threw an error in 'markup://componentTest:throwErrorInner'";
        this._expectErrorUnRenderInner =
        	"Unrender threw an error in markup://componentTest:throwErrorInner";
    },
    
	//This test check the case when we throw error from this cmp's JS re-render
    _testReRenderThrowError: {
    	attributes: {"throwErrorFromReRender": true},
        test: [
            function(cmp){
            	$A.test.expectAuraError(this._expectErrorReRender);
            	cmp.set("v.outputValue", "newValue");
            }, function(cmp) {
            	//we need to unset this, or extra error will be thrown because we re-render the cmp again when test finish
            	cmp.set("v.throwErrorFromReRender", false);
            }
        ]
    },
    
    //This test cannot be here,because the test app won't load properly when the action(getComponent) return with error, move it to java side
    _testRenderThrowError: {
    	attributes: {"throwErrorFromRender": true},
    	auraErrorsExpectedDuringInit : ["error from render"],
        test: [
            function(cmp){
            	cmp.set("v.throwErrorFromRender", false);
            }
        ]
    },
    
    //This test check the case when we throw error from this cmp's JS un-render
    testUnRenderThrowError: {
    	attributes: {"throwErrorFromUnRender": true},
        test: [
            function(cmp){
                try {
                    $A.unrender(cmp);
                } catch (e) {
                    $A.test.assertEquals(this._expectErrorUnRender, e.message);
                }
            }, function(cmp) {
            	cmp.set("v.throwErrorFromUnRender", false);
            }
        ]
    },
    
    //This test check the case where inner cmp throws error from its JS re-render
    _testReRenderInnerThrowError: {
    	attributes: {"throwErrorInnerFromReRender": true},
        test: [
            function(cmp){
            	$A.test.expectAuraError(this._expectErrorReRenderInner);
            	cmp.find("innerCmp").set("v.outputValue", "newValue");
            }, function(cmp) {
            	//we need to unset this, or extra error will be thrown because we re-render the cmp again when test finish
            	cmp.set("v.throwErrorInnerFromReRender", false);
            }
        ]
    },
    
    //This test check the case when we throw error from innerCmp's JS un-render
    testUnRenderInnerThrowError: {
    	attributes: {"throwErrorInnerFromUnRender": true},
        test: [
            function(cmp){
                try {
                    $A.unrender(cmp.find("innerCmp"));
                } catch (e) {
                    $A.test.assertEquals(this._expectErrorUnRenderInner, e.message);
                }
            }, function(cmp) {
            	cmp.set("v.throwErrorInnerFromUnRender", false);
            }
        ]
    },
    
    //This test check when both this cmp and the inner one throw error from JS re-render
    //notice that we throw from the innerCmp first, unlike testInnerCmpCreatedAsyncReRenderBothThrowError
    _testReRenderBothThrowError: {
    	attributes: {"throwErrorInnerFromReRender": true, "throwErrorFromReRender": true},
        test: [
            function(cmp){
            	$A.test.expectAuraError(this._expectErrorReRenderInner);
            	$A.test.expectAuraError(this._expectErrorReRender);
            	//now force both cmp to get re-rendered
            	cmp.find("innerCmp").set("v.outputValue", "newValue");
            	cmp.set("v.outputValue", "newValue");
            }, function(cmp) {
            	//we need to unset throwErrorFromReRender, or the cmp will get re-rendered again when this test finish
            	cmp.set("v.throwErrorFromReRender", false);
            }
        ]
    },
    
    //This test check when both this cmp and the inner one throw error from JS re-render
    //notice that we don't call un-render innerCmp in this case
    testUnRenderBothThrowError: {
    	attributes: {"throwErrorInnerFromUnRender": true, "throwErrorFromUnRender": true},
        test: [
            function(cmp){
            	//now unrender this cmp
            	//we can choose to unrender innerCmp here, if we do that, the innerCmp's un-render will get hit, but the outer one won't
                try {
                    $A.unrender(cmp);
                } catch (e) {
                    $A.test.assertEquals(this._expectErrorUnRender, e.message);
                }
            }, function(cmp) {
            	//we need to unset throwErrorFromReRender, or the cmp will get re-rendered again when this test finish
            	cmp.set("v.throwErrorFromReRender", false);
            }
        ]
    },
    
    //This test create a cmp (Async) then insert it into throwError.cmp, change the newCmp's attribute, trigger the re-render
    //then verify the error is thrown from newCmp
    _testInnerCmpCreatedAsyncReRenderThrowError : {
    	test: [
    	       function(cmp) {
    	    	   $A.componentService.newComponentAsync(this, function(newCmp){
                       cmp.set("v.newCmp", newCmp);
                       $A.rerender(cmp);
                   }, {
                       componentDef: "markup://componentTest:throwErrorInner",
                       localId : "innerCmpAsync",
                       attributes: {
                    	   values: {
                    		   "throwErrorFromReRender": true
                    	   }
                       }
                   });
    	       }, function(cmp) {
    	    	   $A.test.expectAuraError(this._expectErrorReRenderInner);
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.outputValue", "new value from test[inner]");
    	       },  function(cmp) {
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.throwErrorFromReRender", false);
    	       }
    	]
    },
    
    //This test create a cmp (Async) then insert it into throwError.cmp, un-render the newCmp
    //then verify the error is thrown from newCmp
    testInnerCmpCreatedAsyncUnRenderThrowError : {
    	test: [
    	       function(cmp) {
    	    	   $A.componentService.newComponentAsync(this, function(newCmp){
                       cmp.set("v.newCmp", newCmp);
                       $A.rerender(cmp);
                   }, {
                       componentDef: "markup://componentTest:throwErrorInner",
                       localId : "innerCmpAsync",
                       attributes: {
                    	   values: {
                    		   "throwErrorFromUnRender": true
                    	   }
                       }
                   });
    	       }, function(cmp) {
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
                   try {
                        $A.unrender(newCmp);
                   } catch (e) {
                        $A.test.assertEquals(this._expectErrorUnRenderInner, e.message);
                   }
    	       },  function(cmp) {
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.throwErrorFromUnRender", false);
    	       }
    	]
    },
    
    //This test create a newCmp (Async), insert it into throwError.cmp. then change attribute in throwError.cmp and newCmp.
    //Notice#1: the inserting itself will trigger re-render of throwError cmp, which will throw the error
    //Notice#2: the throwError re-render is hit before the newCmp one, unlike testReRenderBothThrowError
    _testInnerCmpCreatedAsyncReRenderBothThrowError : {
    	attributes: {"throwErrorFromReRender": true},
    	test: [
    	       function(cmp) {
    	    	   //first re-render (therefore the error throw) happen during newComponentAsync
    	    	   $A.test.expectAuraError("error from re-render");
    	    	   $A.componentService.newComponentAsync(this, function(newCmp){
                       cmp.set("v.newCmp", newCmp);
                       $A.rerender(cmp);
                   }, {
                       componentDef: "markup://componentTest:throwErrorInner",
                       localId : "innerCmpAsync",
                       attributes: {
                    	   values: {
                    		   "throwErrorFromReRender": true
                    	   }
                       }
                   });
    	    	   //reset it back to false, as re-render will happen again right at the end of this test stage
    	    	   //we don't want it to throw error again
    	    	   cmp.set("v.throwErrorFromReRender", false);
    	       }, function(cmp) {
    	    	   //ask the outer cmp to throw error during re-render
    	    	   cmp.set("v.throwErrorFromReRender", true);
    	    	   //we will expect two errors, one from outer, one from newCmp. we reach outer one first
    	    	   $A.test.expectAuraError(this._expectErrorReRender);
    	    	   $A.test.expectAuraError(this._expectErrorReRenderInner);
    	    	   //change outer's attribute
    	    	   cmp.set("v.outputValue", "new value from test");
    	    	   //change newCmp's attribute
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.outputValue", "new value from test[inner]");
    	       },  function(cmp) {
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.throwErrorFromReRender", false);
    	           
    	       }
    	]
    },
    
    //This test create a newCmp (Async), insert it into throwError.cmp. then un-render throwError.cmp .
    //Notice: the un-render of newCmp is not hit
    testInnerCmpCreatedAsyncUnRenderBothThrowError : {
    	attributes: {"throwErrorFromUnRender": true},
    	test: [
    	       function(cmp) {
    	    	   $A.componentService.newComponentAsync(this, function(newCmp){
                       cmp.set("v.newCmp", newCmp);
                       $A.rerender(cmp);
                   }, {
                       componentDef: "markup://componentTest:throwErrorInner",
                       localId : "innerCmpAsync",
                       attributes: {
                    	   values: {
                    		   "throwErrorFromUnRender": true
                    	   }
                       }
                   });
    	       }, function(cmp) {
                   try {
                        $A.unrender(cmp);
                   } catch (e) {
                        $A.test.assertEquals(this._expectErrorUnRender, e.message);
                   }
    	       },  function(cmp) {
    	    	   cmp.set("v.throwErrorFromUnRender", false);
    	    	   var newCmpLst = cmp.get('v.newCmp');
    	           $A.test.assertEquals(1,newCmpLst.length);
    	           var newCmp = newCmpLst[0];
    	           newCmp.set("v.throwErrorFromUnRender", false);
    	       }
    	]
    }

})