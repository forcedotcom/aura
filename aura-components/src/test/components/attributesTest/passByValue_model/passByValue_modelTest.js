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
	 * This test cover pass by value on model values. #m.someValue
	 * Type covered: String, Boolean, Number, Function Call, List, Map 
	 * and these types pass as value to another component (passByValueInner.cmp)
	 */
	testStringValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("PV_stringContainer").getElement());
	               $A.test.assertEquals("Model", actual, "String value did not match.");
	               //change the model
	               component.set("m.string","CHANGED string value");
		       }, function (component) {
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("PV_stringContainer").getElement());
	               $A.test.assertEquals("Model", actual, "String value did not match.");
		       }
		]
	},
	
	testBooleanValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("false", actual,"Boolean value did not match.");
	               //change attribute
	               component.set("m.booleanFalse",true);
		       }, function(component) {
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("false", actual,"Boolean value should stays the same");
		       }
		]
	},
	
	testNumberValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_numberContainer").getElement());
	               $A.test.assertEquals("4.1", actual, "Number value did not match.");
	               //change attribute
	               component.set("m.double",5.5);
		       }, 
		       function(component) {
		    	   $A.test.assertEquals(5.5, component.get("m.double"), "v.numerValue wasn't updated");
	                var actual = $A.test.getText(component.find("PV_numberContainer").getElement());
	                $A.test.assertEquals("4.1", actual, "Number value should stays the same");
		       }
		]
	},
	
	testFunctionCallValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("Model FCV CONCAT", actual,"FunctionCallValue did not match.");
	               //change the model
	               component.set("m.string","CHANGED string value");
		       }, 
		       function(component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("m.string"), "m.string didn't change");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("Model FCV CONCAT", actual,"FunctionCallValue did not match .");
		       }
		]
	},
	
	testListValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:one1:two2:three", actual.replace(/(\r\n|\n|\r)/gm,""),"markup did not match .");
	               //change the model
	               var lst = component.get("m.stringList");
	               lst[0]="four";
	               component.set("m.stringList",lst);
		       }, 
		       function(component) {
		    	   $A.test.assertEquals(["four", "two", "three"].toString(), component.get("m.stringList").toString(), 
		    			   "m.stringList didn't get updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:one1:two2:three", actual.replace(/(\r\n|\n|\r)/gm,""), "markup did not match.");
		       }
		]
	},
	
	testMapValue: {
		test: [
		       function(component) {
	               var actual = $A.test.getText(component.find("PV_mapContainer").getElement());
	               $A.test.assertEquals("apple", actual.replace(/(\r\n|\n|\r)/gm,""),"markup did not match .");
	               //change the model
	               var m = component.get("m.map");
	               m.fruit="orange";
	               component.set("m.map",m);
		       }, 
		       function(component) {
		    	   $A.test.assertEquals("orange", component.get("m.map.fruit"), "m.map didn't get updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("PV_mapContainer").getElement());
	               $A.test.assertEquals("apple", actual.replace(/(\r\n|\n|\r)/gm,""), "markup did not match.");
		       }
		]
	},
	
	//tests in the inner component begins
	testInnerCmpStringValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_stringContainer").getElement());
	               $A.test.assertEquals("Model", actual, "String value did not match.");
	               //change the model
	               component.set("m.string","CHANGED string value");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("m.string"), "m.string was not updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_stringContainer").getElement());
	               $A.test.assertEquals("Model", actual, "StringValue in inner cmp shouldn't change.");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.stringValue","CHANGED string value INNER");
		       }, function (component) {
		    	   //Notice that the markup in innerCmp will get updated (as it's !v.stringValue), 
		    	   //but m.string in passByValue.cmp won't
		    	   $A.test.assertEquals("CHANGED string value INNER", component.find("innerCmp").get("v.stringValue"),
		    			   "v.stringValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals("CHANGED string value", component.get("m.string"), 
		    			   "m.string in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpFunctionValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("Model FCV CONCAT", actual,"String value did not match attribute.");
	               //change the model
	               component.set("m.string","CHANGED string value");
		       }, function (component) {
		    	   $A.test.assertEquals("CHANGED string value", component.get("m.string"), "m.string was not updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_fcvContainer").getElement());
	               $A.test.assertEquals("Model FCV CONCAT", actual,"StringValue in inner cmp shouldn't change.");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.stringValue","CHANGED string value INNER");
		       }, function (component) {
		    	  //Notice that the markup in innerCmp will get updated (as it's !v.stringValue), 
		    	   //but m.string in passByValue.cmp won't
		    	   $A.test.assertEquals("CHANGED string value INNER", component.find("innerCmp").get("v.stringValue"),
		    			   "v.stringValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals("CHANGED string value", component.get("m.string"), 
		    			   "m.string in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpBooleanValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("false", actual,"booleanValue did not match.");
	               //change the model
	               component.set("m.booleanFalse", true);
		       }, function (component) {
		    	   $A.test.assertEquals(true, component.get("m.booleanFalse"), 
		    			   "m.booleanFalse was not updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_booleanContainer").getElement());
	               $A.test.assertEquals("false", actual, "booleanValue in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               component.find("innerCmp").set("v.booleanValue", false);
		       }, function (component) {
		    	   $A.test.assertEquals(false, component.find("innerCmp").get("v.booleanValue"),
    			   "booleanValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals(true, component.get("m.booleanFalse"), 
		    			   "booleanValue in outer cmp shouldn't get changed");
		       }
		]
	},
	
	testInnerCmpNumberValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_numberContainer").getElement());
	               $A.test.assertEquals("4.1", actual,"numberValue did not match.");
	               //change the model
	               component.set("m.double", 2015);
		       }, function (component) {
		    	   $A.test.assertEquals(2015, component.get("m.double"), 
		    			   "m.double was not updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_numberContainer").getElement());
	               $A.test.assertEquals("4.1", actual, "nummberValue in inner cmp shouldn't get changed");
	             //change attribute from inner cmp
	               component.find("innerCmp").set("v.numberValue", 5555);
		       }, function (component) {
		    	   $A.test.assertEquals(5555, component.find("innerCmp").get("v.numberValue"),
		    			   "NumberValue in inner cmp wasn't updated");
		    	   $A.test.assertEquals(2015, component.get("m.double"), 
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
	               $A.test.assertEquals("0:one1:two2:three", actual.replace(/(\r\n|\n|\r)/gm,""),"markup did not match.");
	               //change the model
	               var lst = component.get("m.stringList");
	               lst[0] = "four";
	               component.set("m.stringList", lst);
		       }, function (component) {
		    	   $A.test.assertEquals(["four", "two", "three"].toString(), component.get("m.stringList").toString(), 
    			   "m.stringList didn't get updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_listContainer").getElement());
	               $A.test.assertEquals("0:one1:two2:three", actual.replace(/(\r\n|\n|\r)/gm,""), "markup in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               var lst_inner = component.find("innerCmp").get("v.listValue");
	               lst_inner[1]="black";
	               component.find("innerCmp").set("v.listValue", lst_inner);
		       }, function (component) {
		    	   var lst_inner = component.find("innerCmp").get("v.listValue");
		    	   $A.test.assertEquals(["four", "black", "three"].toString(), 
		    			   component.find("innerCmp").get("v.listValue").toString(),
		    			   "listValue in inner cmp wasn't updated properly");
		    	   $A.test.assertEquals(["four", "black", "three"].toString(), component.get("m.stringList").toString(), 
		    			   "listValue in outer cmp should get changed");
		       }
		]
	},
	
	testInnerCmpMapValue: {
		test: [
		       function (component) {
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_mapContainer").getElement());
	               $A.test.assertEquals("apple", actual.replace(/(\r\n|\n|\r)/gm,""), "markup did not match.");
	               //change the model
	               var m = component.get("m.map");
	               m.fruit = "orange";
	               component.set("m.map", m);
		       }, function (component) {
		    	   $A.test.assertEquals("orange", component.get("m.map.fruit"), "m.map didn't get updated");
		    	   //markup remains unchanged.
	               var actual = $A.test.getText(component.find("innerCmp").find("PV_mapContainer").getElement());
	               $A.test.assertEquals("apple", actual.replace(/(\r\n|\n|\r)/gm,""), "markup in inner cmp shouldn't get changed");
	               //change attribute from inner cmp
	               var m_inner = component.find("innerCmp").get("v.mapValue");
	               m_inner.fruit="banana";
	               component.find("innerCmp").set("v.mapValue", m_inner);
		       }, function (component) {
		    	   $A.test.assertEquals("banana", component.find("innerCmp").get("v.mapValue.fruit"),
		    			   "v.mapValue in inner cmp wasn't updated properly");
		    	   $A.test.assertEquals("banana", component.get("m.map.fruit"), "v.map in outer cmp should get changed");
		       }
		]
	},
	
	//tests in the inner component ends

})
