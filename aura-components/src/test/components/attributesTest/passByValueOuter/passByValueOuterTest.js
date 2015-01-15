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
	 * Note that we don't really have a way to put default value for objects (map included), 
	 * init them in controller's init() does not work for #v.someObject.
	 * 
	 * passByValueOuter has passByValue in its markup. it pass m.data[0] as v.mapValue to passByValue.
	 * passByValue has passByValueInner in its markup. it pass the v.mapValue to passByValueInner as value(#v.XXX).
	 * m.data[0], v.mapValue in passByValue , v.mapValue in passByValueInner is the same javascript object
	 */
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
			var m = component.get("m.map");
			m.fruit = "orange";
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
            //but change event didn't get triggered
            $A.test.assertEquals(false, component.find("passByValueCmp").get("v.changeEventTriggered"), 
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
            var m1 = component.find("passByValueCmp").get("v.mapValue");
            m1.fruit = "orange";
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
            //but change event didn't get triggered
            $A.test.assertEquals(false, component.find("passByValueCmp").get("v.changeEventTriggered"), 
            		"shouldn't trigger change handler when updating model");
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
            var m2 = component.find("passByValueCmp").find("innerCmp").get("v.mapValue");
            m2.fruit = "orange";
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
            		"shouldn't trigger change handler when updating model");
            //so the rerender count remains 0
            $A.test.assertEquals(0, component.find("passByValueCmp").find("innerCmp").get("v.rerenderCount"),
            		"shouldn't trigger rerender of inner cmp");
		}
	]}
})