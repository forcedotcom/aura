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
	testClearAndReplaceWholeArrayInModel: {
		test: [function(cmp) {
			cmp.set("m.dataIntList",[]);
		}, function(cmp) {
			var expected = [];
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected after clear m.dataIntList." );
    		
         	cmp.set("m.dataIntList",[0,1,2]);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=0; i<3; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: ""+i});
         	}
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}
		]
	},
	
	testClearAndReplaceWholeArrayInIteration: {
		test: [function(cmp) {
			var iter = cmp.find("iterationOnArrayModelPassthrough");
			iter.set("v.items", []);
		}, function(cmp) {
			var expected = [];
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	$A.test.assertEquals( expected.length, iterCmpEle.length, "number of element in iteration component is not expected after clear v.items in iteration." );
    		
         	var iter = cmp.find("iterationOnArrayModelPassthrough");
         	iter.set("v.items", [0,1,2]);
		 }, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
			var expected = [];
         	for( var i=0; i<3; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: ""+i});
         	}
         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var iter = cmp.find("iterationOnArrayModelPassthrough");
         	iter.set("v.items", [2,3,4]);
		},
        function(cmp) {
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
			var expected = [];
         	for( var i=0; i<3; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: ""+(i+2)});
         	}
            // Re-used value "2" gets a rerender
            expected[0].rerender_count=1;
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}
		]
	},
	
	testChangeStartAndEnd: {
		attributes: {start:0, end:26},
		test: [function(cmp) {
			cmp.set("v.start", 1);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
			var expected = [];
         	for( var i=1; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: ""+i});
         	}
         	this.assertIterationCmpElements(expected, iterCmpEle);
		}, function(cmp) {
			cmp.set("v.end", 5);
		}, function(cmp) {
			var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=1; i<5; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: ""+i});
         	}
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
			$A.test.assertTrue(eleText.indexOf("Passthrough String: "+exp.passthrough_string) > -1, "unexpected Passthrough String");
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
        	var iter = cmp.find("iterationOnArrayModelPassthrough");
            var data = iter.get("v.items");
            data[index] = newValue; 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=0; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}
            var index = parseInt(cmp.get("v.indexToChange"), 10);
         	expected[index].rerender_count=0;
            expected[index].passthrough_string = "999";

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var m_dataIntList = cmp.get("m.dataIntList");
    		for(var i = 0; i < m_dataIntList.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, m_dataIntList[i].toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testSetItemsInAttribute: {
    	attributes:{ indexToChange:1 , newValueToChange:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToChange"), 10);
        	var newValue = cmp.get("v.newValueToChange");
            var data = cmp.get("m.dataIntList");
            data[index] =  newValue; 
            cmp.set("m.dataIntList", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=0; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}
         	expected[1].passthrough_string = "999"; expected[1].rerender_count = 0;


         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    },
    
    testInsertItemsInIteration:{
        attributes:{ indexToInsert:0 , newValueToInsert:999 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
        	var iter = cmp.find("iterationOnArrayModelPassthrough");
            var data = iter.get("v.items");
            data.splice( index, 0, newValue); 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	expected.push({render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"});
         	for( var i=0; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var m_dataIntList = cmp.get("m.dataIntList");
    		for(var i = 0; i < m_dataIntList.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, m_dataIntList[i].toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testInsertItemsInAttribute: {
    	attributes:{ indexToInsert:0 , newValueToInsert:999 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToInsert"), 10);
        	var newValue = cmp.get("v.newValueToInsert");
            var data = cmp.get("m.dataIntList");
            data.splice( index, 0, newValue); 
            cmp.set("m.dataIntList", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	expected.push({render_count: 1, rerender_count: 0, unrender_count:0, passthrough_string: "999"});
         	for( var i=0; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}

         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    },
    
    testDeleteItemsInIteration:{
        attributes:{ indexToDelete:0 },
        test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
        	var iter = cmp.find("iterationOnArrayModelPassthrough");
            var data = iter.get("v.items");
            data.splice( index, 1); 
            iter.set("v.items", data);
        }, function(cmp) {
        	var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=1; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}

         	this.assertIterationCmpElements(expected, iterCmpEle);
         	
         	var m_dataIntList = cmp.get("m.dataIntList");
    		for(var i = 0; i < m_dataIntList.length; i++) {
    			$A.test.assertEquals( expected[i].passthrough_string, m_dataIntList[i].toString(), "unexpected map data at index#"+i );
    		}
        }]
    },
    
    testDeleteItemsInAttribute: {
    	attributes:{ indexToDelete:0 },
    	test: [function(cmp){
        	var index = parseInt(cmp.get("v.indexToDelete"), 10);
            var data = cmp.get("m.dataIntList");
            data.splice( index, 1); 
            cmp.set("m.dataIntList", data);
    	}, function(cmp) {
    		var iterCmpEle = cmp.find("iterationOnArrayModelPassthrough").getElements();
         	var expected = [];
         	for( var i=1; i<26; i++ ) {
         		expected.push( {render_count: 1, rerender_count: 1, unrender_count:0, passthrough_string: ""+i});
         	}

         	this.assertIterationCmpElements(expected, iterCmpEle);
    	}]
    }
    
})