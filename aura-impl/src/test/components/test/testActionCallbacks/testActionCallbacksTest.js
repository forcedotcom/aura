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
    checkResult: function(cmp) {
        $A.test.addWaitFor(true, function() { return cmp.get("v.cbComplete") !== "No"; }, function() {
            $A.test.assertEquals(cmp.get("v.cbExpected"), cmp.get("v.cbResult"));
        });
    },

    testAnySuccess: {
        attributes: { cbName:"ALL", cbExpected:"SUCCESS"},
        test:function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testAnyFailure: {
        attributes: { cbName:"ALL", cbExpected:"ERROR"},
        test:function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testSuccess: {
        attributes: { cbName:"SUCCESS", cbExpected:"SUCCESS"},
        test: function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testNoSuccess: {
        attributes: { cbName:"SUCCESS", cbExpected:"NONE"},
        test: function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testFailure: {
        attributes: { cbName:"ERROR", cbExpected:"ERROR"},
        test: function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testNoFailure: {
        attributes: { cbName:"ERROR", cbExpected:"NONE"},
        test: function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        }
    },
    
    /**
     * Use misc values for name argument specified in Action.setCallback
     * action.setCallback((scope, callback, ->name<- ) 
     */
    testSetCallbackWithInvalidName: {
	test: [
	       //1. Undefined should register the given callback for both success & error (and the other states) 
	       function(cmp){ //verify callback on Success
	    	   cmp.getValue("v.cbName").destroy();
	    	   $A.test.assertUndefinedOrNull(cmp.get("v.cbName"), "Test setup failure, cbName should be undefined");
		   cmp.find("pass").get("e.press").fire();
		   this.checkResult(cmp);
	       }, function(cmp){ //verify callback on Error
		   cmp.getValue("v.cbExpected").setValue("ERROR");
		   $A.test.assertUndefinedOrNull(cmp.get("v.cbName"), "Test setup failure, cbName should be undefined");
		   cmp.find("fail").get("e.press").fire();
	           this.checkResult(cmp);
	       },
	       //2. empty string should produce an error
	       function(cmp){
		   this.assertSetCallbackThrowsError(cmp, function(){}, "", 
			   "Illegal name", "setCallback() failed to error on empty name");
	       },
	       //3. Invalid name
	       function(cmp){
		   this.assertSetCallbackThrowsError(cmp, function(){}, "FooBared", 
			   "Illegal name FooBared","setCallback() failed to error on invalid name");
	       }
	]
    },
    assertSetCallbackThrowsError : function(cmp, callbackArg, name, errorMessage, failureMsg){
	var action = cmp.get("c.getString");
	try{
	    action.setCallback(cmp, callbackArg, name);
	    $A.test.fail(failureMsg);
	}catch(e){
	    $A.test.assertEquals(0, e.message.indexOf(errorMessage), failureMsg);
	}
    },
    
    /**
     * Boundary condition check for callback argument passed to Action.setCallback()
     * action.setCallback((scope, ->callback<- , name) 
     */
    testActionsBadCallbackFuntions: {
	test: [
	       function(cmp){
		   this.assertSetCallbackThrowsError(cmp, undefined, "SUCCESS", 
			   "Action callback should be a function","setCallback() failed to error on undefined callback");
	       },
	       function(cmp){
		   this.assertSetCallbackThrowsError(cmp, "FooBared", "SUCCESS", 
			   "Action callback should be a function","setCallback() failed to error on a string as callback");
	       },
	       function(cmp){
		   this.assertSetCallbackThrowsError(cmp, {"key": "value"}, "SUCCESS", 
			   "Action callback should be a function","setCallback() failed to error on a object as callback");
	       }
	]
    }
})
