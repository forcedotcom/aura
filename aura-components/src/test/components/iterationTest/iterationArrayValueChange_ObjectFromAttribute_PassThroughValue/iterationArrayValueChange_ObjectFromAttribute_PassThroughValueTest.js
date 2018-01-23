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
	testClearAndReplaceWholeArrayInAttribute: {
		browsers: ["-IE8"], //skip IE8 because W-2516537
		test: [function(cmp) {
			cmp.set("v.mapdata",{"items":[]});
		}, function(cmp) {
			var expected = [];
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected after clear v.mapdata." );
    		
         	var new_mapdata = {
        			items: [
        				{ "label": "4"},
        				{ "label": "5"},
        				{ "label": "6"},
        				{ "label": "7"}
        			]
        		};
         	cmp.set("v.mapdata",new_mapdata);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
			var expected = [
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "4"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "5"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "6"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "7"}];
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}
		]
	},
	
	testClearAndReplaceWholeArrayInIteration: {
		test: [function(cmp) {
			var iter = cmp.find("iterationOnMapAttributePassthrough");
			iter.set("v.items",[]);
		}, function(cmp) {
			var expected = [];
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected after clear v.items in iteration." );
    		
         	var iter = cmp.find("iterationOnMapAttributePassthrough");
         	iter.set("v.items", [ {"label":4}, {"label":5}, {"label":6}, {"label":7} ]);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
			var expected = [
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "4"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "5"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "6"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "7"}];
	        this.assertIterationCmpElements(expected, iterCmpEle);
	        
	        var iter = cmp.find("iterationOnMapAttributePassthrough");
         	iter.set("v.items", [ {"label":6}, {"label":7}, {"label":8}, {"label":9} ]);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
			var expected = [
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "6"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "7"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "8"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "9"}];
	        this.assertIterationCmpElements(expected, iterCmpEle);
		}]
	},
	
	//notice that changing start and end doesn't trigger rerender.
	testChangeStartAndEnd: {
		attributes: {start:0, end:5},
		test: [function(cmp) {
			cmp.set("v.start", 1);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
			var expected = [
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "1"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "2"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "3"},
				         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "4"}];
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}, function(cmp) {
			cmp.set("v.end", 4);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = [
         		         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "1"},
         		         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "2"},
         		         	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "3"}];
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}
		]
	},
	
	//check elements in iteration component 
	//notice that edit in iteration and in attribute give us different reRender count
	assertIterationCmpElements: function(expected, cmpElements) {
		$A.test.assertEquals( expected.length, cmpElements.length, "number of element in iteration component is not expected." );
		for(var i = 0; i< expected.length; i++) {
			var eleText = $A.test.getText(cmpElements[i]);
			var exp = expected[i];
			$A.test.assertTrue(eleText.indexOf("Passthrough Object's Label: "+exp.passthrough_string) > -1, "unexpected Passthrough String");
			$A.test.assertTrue(eleText.indexOf("render count: "+exp.render_count) > -1, "unexpected render count");
			$A.test.assertTrue(eleText.indexOf("rerender count: "+exp.rerender_count) > -1, "unexpected rerender count");
			$A.test.assertTrue(eleText.indexOf("unrender count: "+exp.unrender_count) > -1, "unexpected unrerender count");
		}
	},
	
    testSetItemsInIteration:{
        attributes:{ indexToChange:1 , newValueToChange:999 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
        	var iter = cmp.find("iterationOnMapAttributePassthrough");
            var data = iter.get("v.items");
            data[index] = {"label": newValue}; 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = 
         	[{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "0"},
          	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"},
          	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
          	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
          	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var v_mapdata_items = cmp.get("v.mapdata").items;
    		for(var i = 0; i < v_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, v_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testSetItemsInAttribute: {
    	attributes:{ indexToChange:1 , newValueToChange:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
            var data = cmp.get("v.mapdata");
            (data.items)[index] =  {"label": newValue}; 
            cmp.set("v.mapdata", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = 
             	[{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "0"},
              	{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];

         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    },
    
    testInsertItemsInIteration:{
        attributes:{ indexToInsert:0 , newValueToInsert:999 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
        	var iter = cmp.find("iterationOnMapAttributePassthrough");
            var data = iter.get("v.items");
            data.splice( index, 0, {"label": newValue}); 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = 
             	[{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"},
             	 {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "0"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "1"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var v_mapdata_items = cmp.get("v.mapdata").items;
    		for(var i = 0; i < v_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, v_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testInsertItemsInAttribute: {
    	attributes:{ indexToInsert:0 , newValueToInsert:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
            var data = cmp.get("v.mapdata");
            (data.items).splice( index, 0, {"label": newValue}); 
            cmp.set("v.mapdata", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = 
             	[{render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"},
             	 {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "0"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "1"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];
         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    },
    
    testDeleteItemsInIteration:{
        attributes:{ indexToDelete:0 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
        	var iter = cmp.find("iterationOnMapAttributePassthrough");
            var data = iter.get("v.items");
            data.splice( index, 1); 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
         	var expected = 
             	[{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "1"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var v_mapdata_items = cmp.get("v.mapdata").items;
    		for(var i = 0; i < v_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, v_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testDeleteItemsInAttribute: {
    	attributes:{ indexToDelete:0  },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
            var data = cmp.get("v.mapdata");
            (data.items).splice( index, 1); 
            cmp.set("v.mapdata", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnMapAttributePassthrough").getElements();
    		var expected = 
             	[{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "1"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "2"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "3"},
              	{render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: "4"}];

         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    }
    
	
})
