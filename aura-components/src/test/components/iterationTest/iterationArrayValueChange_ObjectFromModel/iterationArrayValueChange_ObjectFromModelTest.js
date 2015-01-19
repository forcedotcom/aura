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
	testChangeStartAndEnd: {
		attributes: {start:0, end:26},
		test: [function(cmp) {
			cmp.set("v.start", 1);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
			var expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
			$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( (i+1)+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
		}, function(cmp) {
			cmp.set("v.end", 5);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
			var expected = [1, 2, 3, 4];
			$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( (i+1)+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
		}
		]
	},
	
    testSetItemsInIteration:{
        attributes:{ indexToChange:1 , newValueToChange:999 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
        	var iter = cmp.find("iterationOnMapModel");
            var data = iter.get("v.items");
            data[index].label = newValue; 
            
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = [0, "999", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    		
    		var m_mapdata_items = cmp.get("m.mapdata").items;
    		for(var i = 0; i < m_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].toString(), m_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testSetItemsInModel: {
    	attributes:{ indexToChange:1 , newValueToChange:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
            var data = cmp.get("m.mapdata");
            (data.items)[index] =  {"label": newValue}; 
            cmp.set("m.mapdata", data);
    	}, function(cmp) {
    		var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
    		var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = [0, "999", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    	}]
    },
    
    testInsertItemsInIteration:{
        attributes:{ indexToInsert:0 , newValueToInsert:999 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
        	var iter = cmp.find("iterationOnMapModel");
            var data = iter.get("v.items");
            data.splice( index, 0, {"label" : newValue}); 
            
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = ["999", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    		
    		var m_mapdata_items = cmp.get("m.mapdata").items;
    		for(var i = 0; i < m_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].toString(), m_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testInsertItemsInModel: {
    	attributes:{ indexToInsert:0 , newValueToInsert:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
            var data = cmp.get("m.mapdata");
            (data.items).splice(index, 0, {"label": newValue}); 
            cmp.set("m.mapdata", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = ["999", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    	}]
    },
    
    testDeleteItemsInIteration:{
        attributes:{ indexToDelete:0 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
        	var iter = cmp.find("iterationOnMapModel");
            var data = iter.get("v.items");
            data.splice( index, 1); 
            
            iter.set("v.items", data);
        }, function(cmp) {
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
        	var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    		
    		var m_mapdata_items = cmp.get("m.mapdata").items;
    		for(var i = 0; i < m_mapdata_items.length; i++) {
    			$A.test.assertEquals( expected[i].toString(), m_mapdata_items[i].label.toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testDeleteItemsInModel: {
    	attributes:{ indexToDelete:0 , newValueToInsert:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
            var data = cmp.get("m.mapdata");
            (data.items).splice(index, 1); 
            cmp.set("m.mapdata", data);
    	}, function(cmp) {
    		var index = parseInt(cmp.get("v.indexToDelete"), 10);
    		var iterCmpEle = cmp.find("iterationOnMapModel").getElements();
         	var expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected." );
    		for(var i = 0; i< expected.length; i++) {
    			$A.test.assertEquals( i+":"+expected[i], $A.test.getText(iterCmpEle[i]), "unexpected iteration element at index#"+i );
    		}
    	}]
    },
    
	
})