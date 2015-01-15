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
	/**
	 * This test cover pass by value on attribute value. #v.someValue
	 * Type covered: String, Number, Boolean, Function Call, Custom Type, List, 
	 * and all these type pass as value to another component
	 * 
	 */
	_testInitStringValue: {
		//this is not the way {#v.something} suppose to work. setting value in init() of controller is too late for it
		test: [function(component) {
			var actual= $A.test.getText(component.find("PV_initContainer").getElement());
            $A.test.assertEquals("value from init method", actual, "String value did not match attribute.");
		}]
	},
	
	testStringValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("PV_stringContainer").getElement());
	               $A.test.assertEquals("default string value",actual,"String value did not match attribute.");
	               //change the attribute
	               component.set("v.stringValue","CHANGED string value");
		       }, function (component) {
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("PV_stringContainer").getElement());
	               $A.test.assertEquals("default string value",actual,"String value did not match attribute.");
		       }
		]
	},
	
	testBooleanValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("true",actual,"Boolean value did not match attribute.");
	               //change attribute
	               component.set("v.booleanValue",false);
		       }, function(component) {
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("true",actual,"Boolean value should stays the same");
		       }
		]
	},
	
	testNumberValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_numberContainer").getElement());
	               $A.test.assertEquals("7357", actual, "Number value did not match attribute.");
	               //change attribute
	               component.set("v.numberValue",2015);
		       }, 
		       function(component) {
		    	   $A.test.assertEquals(2015, component.get("v.numberValue"), "v.numerValue wasn't updated");
	                var actual = $A.test.getText(component.find("PV_numberContainer").getElement());
	                $A.test.assertEquals("7357", actual, "Number value should stays the same");
		       }
		]
	},
	
	testFunctionCallValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("default string value FCV CONCAT",actual,"FunctionCallValue did not match attribute.");
	               //change the attribute
	               component.set("v.stringValue","CHANGED string value");
		       }, 
		       function(component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("v.stringValue"), "v.stringValue didn't change");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("default string value FCV CONCAT",actual,"FunctionCallValue did not match attribute.");
		       }
		]
	},
	
	testListValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:purple1:blue2:green", actual.replace(/(\r\n|\n|\r)/gm,""),"listValue did not match attribute.");
	               //change the attribute
	               var lst = component.get("v.listValue");
	               lst[0]="red";
	               component.set("v.listValue",lst);
		       }, 
		       function(component) {
		    	   $A.test.assertEquals(["red", "blue", "green"].toString(), component.get("v.listValue").toString(), 
		    			   "v.listValue didn't get updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:purple1:blue2:green", actual.replace(/(\r\n|\n|\r)/gm,""), "listValue did not match attribute.");
		       }
		]
	},
	
	testCustomAttribute: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_customAttributeContainer").getElement());
	               $A.test.assertEquals("HouseNo:300",actual,"customAttribute did not match attribute.");
	               //change the attribute
	               component.set("v.pairAttr",{"strMember": "NewHouse", "intMember": 900});
		       }, 
		       function(component) {
		    	   $A.test.assertEquals("NewHouse",component.get("v.pairAttr.strMember"), "v.pairAttr didn't get updated")
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("PV_customAttributeContainer").getElement());
	               $A.test.assertEquals("HouseNo:300", actual, "customAttribute did not match attribute.");
	               
		       }
		]
	},
	
	//tests in the inner component begins
	testInnerCmpStringValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_stringContainer").getElement());
	               $A.test.assertEquals("default string value",actual,"String value did not match attribute.");
	               //change the attribute
	               component.set("v.stringValue","CHANGED string value");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("v.stringValue"), "v.stringValue was not updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_stringContainer").getElement());
	               $A.test.assertEquals("default string value",actual,"StringValue in inner cmp shouldn't change.");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.stringValue","CHANGED string value INNER");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value INNER", component.find("innerCmp").get("v.stringValue"),
		    			   "stringValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals("CHANGED string value", component.get("v.stringValue"), 
		    			   "stringValue in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpFunctionValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("default string value FCV CONCAT",actual,"String value did not match attribute.");
	               //change the attribute
	               component.set("v.stringValue","CHANGED string value");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("v.stringValue"), "v.stringValue was not updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("default string value FCV CONCAT",actual,"StringValue in inner cmp shouldn't change.");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.stringValue","CHANGED string value INNER");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value INNER", component.find("innerCmp").get("v.stringValue"),
		    			   "stringValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals("CHANGED string value", component.get("v.stringValue"), 
		    			   "stringValue in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpBooleanValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("true", actual,"booleanValue did not match attribute.");
	               //change the attribute
	               component.set("v.booleanValue", false);
		       }, function (component) {
		    	   $A.test.assertEquals(false, component.get("v.booleanValue"), 
		    			   "v.booleanValue was not updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("true", actual, "booleanValue in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.booleanValue", true);
		       }, function (component) {
		    	   $A.test.assertEquals(true, component.find("innerCmp").get("v.booleanValue"),
		    			   "booleanValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals(false, component.get("v.booleanValue"), 
		    			   "booleanValue in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpNumberValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_numberContainer").getElement());
	               $A.test.assertEquals("7357", actual,"numberValue did not match attribute.");
	               //change the attribute
	               component.set("v.numberValue", 2015);
		       }, function (component) {
		    	   $A.test.assertEquals(2015, component.get("v.numberValue"), 
		    			   "v.numberValue was not updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_numberContainer").getElement());
	               $A.test.assertEquals("7357", actual, "nummberValue in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.numberValue", 5555);
		       }, function (component) {
		    	   $A.test.assertEquals(5555, component.find("innerCmp").get("v.numberValue"),
		    			   "NumberValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals(2015, component.get("v.numberValue"), 
		    			   "NumberValue in outer cmp shouldn't get changed");
		       }
		]
	},
	
	//When passing List(or object) into inner component as value, it's being pass as a javascript object reference, 
	//which is what javascript would do. This will give us the same javascript object for both outer cmp and inner component.
	testInnerCmpListValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:purple1:blue2:green", actual.replace(/(\r\n|\n|\r)/gm,""),"listValue did not match attribute.");
	               //change the attribute
	               var lst = component.get("v.listValue");
	               lst[0] = "red";
	               component.set("v.listValue", lst);
		       }, function (component) {
		    	   $A.test.assertEquals(["red", "blue", "green"].toString(), component.get("v.listValue").toString(), 
    			   "v.listValue didn't get updated");
		    	   //value remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:purple1:blue2:green", actual.replace(/(\r\n|\n|\r)/gm,""), "listValue in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               var lst_inner = component.find("innerCmp").get("v.listValue");
	               lst_inner[1]="black";
	               component.find("innerCmp").set("v.listValue", lst_inner);
		       }, function (component) {
		    	   var lst_inner = component.find("innerCmp").get("v.listValue");
		    	   $A.test.assertEquals(["red", "black", "green"].toString(), 
		    			   component.find("innerCmp").get("v.listValue").toString(),
		    			   "listValue in inner cmp wasn't updated properly");
		    	   $A.test.assertEquals(["red", "black", "green"].toString(), component.get("v.listValue").toString(), 
		    			   "listValue in outer cmp should get changed");
		       }
		]
	},
	
	testInnerCmpCustomAttributeValue: {
		test: [
		       function (component) {
	               var actual= $A.test.getText(component.find("innerCmp").find("PV_customAttributeContainer").getElement());
	               $A.test.assertEquals("HouseNo:300", actual,"customAttribute did not match attribute.");
	               //change the attribute
	               component.set("v.pairAttr", {"strMember": "Condo", "intMember": 100});
		       }, function (component) {
		    	   $A.test.assertEquals("Condo", component.get("v.pairAttr.strMember"), 
		    			   "v.pairAttr was not updated");
		    	   //value remains unchanged.
	               var actual= $A.test.getText(component.find("innerCmp").find("PV_customAttributeContainer").getElement());
	               $A.test.assertEquals("HouseNo:300", actual, "customAttribute in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.pairAttr", {"strMember": "Apartment", "intMember": 200});
		       }, function (component) {
		    	   $A.test.assertEquals("Apartment", component.find("innerCmp").get("v.pairAttr.strMember"),
		    			   "customAttribute in inner cmp wasn't updated");
		    	   $A.test.assertEquals("Condo", component.get("v.pairAttr.strMember"), 
		    			   "customAttribute in outer cmp shouldn't get changed");
		       }
		]
	},
	
	
	//tests in the inner component ends

})
