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
	 * These tests are for passing attribute object as value between components.
	 * Note this is like a work-around given that we don't really have a way to put default value for objects (map included), 
	 * init them in controller's init() does not work for #v.someObject.
	 * 
	 * passByValueOurter pass its m.map to passByValue as its v.mapValue in its markup
	 * passByValue pass its v.mapValue "As Value" to passByValueInner
	 * 
	 * three tests here are
	 * #1. change m.map in outer cmp
	 * #2. change m.mapValue in middle cmp
	 * #3. change m.mapValue in inner cmp
	 **/
	testMapValueChangeModel: {
		test: [function(component) {
			//check passByValue
			var actual=component.find("passByValueCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in passByValueCmp");
            //check passByValueInner
            var actual=component.find("passByValueCmp").find("innerCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in innerCmp");
		}, function(component) {
			//change model
			component.set("m.map.fruit","orange");
		}, function(component) {
			//markup doesn't change
			var actual=component.find("passByValueCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "mark up shouldn't change after updating model");
            //v.mapValue in passByValueCmp get updated
            $A.test.assertEquals("orange", component.find("passByValueCmp").get("v.mapValue.fruit"), 
            		"v.mapValue in passByValueCmp should get updated after we change m.data");
            //so is v.mapValue in innerCmp
            $A.test.assertEquals("orange", component.find("passByValueCmp").find("innerCmp").get("v.mapValue.fruit"),
            		"v.mapValue in innerCmp after should get updated after we update v.mapValue in passByValueCmp");
            //change event in middle cmp get triggered as we pass the m.map as reference to it
            $A.test.assertEquals(true, component.find("passByValueCmp").get("v.changeEventTriggered"), 
            		"shouldn't trigger change handler when updating model");
            //so the rerender count remains 0
            $A.test.assertEquals(0, component.find("passByValueCmp").find("innerCmp").get("v.rerenderCount"),
            		"shouldn't trigger rerender of inner cmp");
		}]
	},
	
	testMapValueChangeAttribute: {
		test: [function(component) {
			//check passByValue
			var actual=component.find("passByValueCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in passByValueCmp");
            //check passByValueInner
            var actual=component.find("passByValueCmp").find("innerCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in innerCmp");
		}, function(component) {
			//change v.mapValue in passByValueCmp
			component.find("passByValueCmp").set("v.mapValue.fruit","orange");
			//NOTE: If we change the mapValue like below, change event won't get fired
            //var m1 = component.find("passByValueCmp").get("v.mapValue");
            //m1.fruit = "orange";
		}, function(component) {
			//markup doesn't change
			var actual=component.find("passByValueCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "mark up shouldn't change after updating v.mapValue");
            //m.data should get updated
            $A.test.assertEquals("orange", component.get("m.map.fruit"), 
            		"m.data should get updated after we update v.mapValue in passByValueCmp");
            //so is v.mapValue in innerCmp
            $A.test.assertEquals("orange", component.find("passByValueCmp").find("innerCmp").get("v.mapValue.fruit"),
            		"v.mapValue in innerCmp after we update v.mapValue in passByValueCmp");
            //change event in passByValue get fired, but in innerCmp the change event didn't get triggered
            $A.test.assertEquals(true, component.find("passByValueCmp").get("v.changeEventTriggered"), 
				"should trigger change handler in innerCmp when updating map value");
            $A.test.assertEquals(false, component.find("passByValueCmp").find("innerCmp").get("v.changeEventTriggered"), 
				"shouldn't trigger change handler in innerCmp when updating map value in passByValueCmp");
            //so the rerender count remains 0
            $A.test.assertEquals(0, component.find("passByValueCmp").find("innerCmp").get("v.rerenderCount"),
            		"shouldn't trigger rerender of inner cmp");
		}]
	},
	
	testMapValueChangeAttributeInner: {
		test: [function(component) {
			//check passByValue
			var actual=component.find("passByValueCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in passByValueCmp");
            //check passByValueInner
            var actual=component.find("passByValueCmp").find("innerCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, "markup is not right in innerCmp");
		}, function(component) {
            //change v.mapValue in innerCmp
			component.find("passByValueCmp").find("innerCmp").set("v.mapValue.fruit", "orange");
            //var m2 = component.find("passByValueCmp").find("innerCmp").get("v.mapValue");
            //m2.fruit = "orange";
		}, function(component) {
			//markup in innerCmp won't change as it's #v.mapValue
            var actual=component.find("passByValueCmp").find("innerCmp").find("PV_mapContainer").getElement().textContent;
            $A.test.assertEquals("apple", actual, 
            		"markup is not right in innerCmp after changing attribute in innerCmp");
            //m.data should get updated
            $A.test.assertEquals("orange", component.get("m.map.fruit"), 
            		"m.data should get updated after chaging v.mapValue in innerCmp");
            //so is v.mapValue in passByValueCmp get updated
            $A.test.assertEquals("orange", component.find("passByValueCmp").get("v.mapValue.fruit"), 
            		"m.map in passByValueCmp should get updated after we change attribute in inner cmp");
            //but change event didn't get triggered
            $A.test.assertEquals(false, component.find("passByValueCmp").get("v.changeEventTriggered"), 
            		"shouldn't trigger change handler when updating map value in innerCmp");
            $A.test.assertEquals(true, component.find("passByValueCmp").find("innerCmp").get("v.changeEventTriggered"), 
			"should't trigger change handler in innerCmp when updating map value");
            //so the rerender happens once
            $A.test.assertEquals(1, component.find("passByValueCmp").find("innerCmp").get("v.rerenderCount"),
            		"shouldn't trigger rerender of inner cmp");
		}
	]}
})