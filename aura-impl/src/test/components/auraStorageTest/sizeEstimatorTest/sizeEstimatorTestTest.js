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
	setUp:function(){
		// TODO: I would really like to know a better way of doing this.
		this.sizeEstimator = new $A.storageService.createAdapter("memory", "test", 4096).getSizeEstimator();
	},
	
	testSizeNumber:{
		test:function(cmp) {
			$A.test.assertEquals(8, this.estimateSize(100));
		}
	},
	
	testSizeString:{
		test:function(cmp) {
			$A.test.assertEquals(14, this.estimateSize("hundred"));
		}
	},
	
	testSizeBoolean:{
		test:function(cmp) {
			$A.test.assertEquals(4, this.estimateSize(false));
			$A.test.assertEquals(4, this.estimateSize(true));
		}
	},

	testSizeArray:{
		test:function(cmp) {
			// there are 4 array elements with a total of 22 characters
			// 4*(8+2) + 22*2
			$A.test.assertEquals(84, this.estimateSize(["Brian", "Kevin", "Matthew", "Dave0"]));
		}
	},

	testSizeNull:{
		test:function(cmp) {
			$A.test.assertEquals(0, this.estimateSize(null));
		}
	},
	
	testSizeUndefined:{
		test:function(cmp) {
			var team;			
			$A.test.assertEquals(0, this.estimateSize(team));
		}
	},
	
	testSizeObject:{
		test:function(cmp) {
			var team = new Object();
			team.size=8;
			team.locations = ["SFO", "YVR", "NYC"];
			team.devs = {"Dev1": "Brian", "Dev2": "Kevin", "Dev3": "DaveO"};
			
			// 6 nested keys + 3 nested array elements + 1 number + 53 explicit string characters 
			// 6*8 + 3*(8+2) + 1*8 + 2*53 
			$A.test.assertEquals(192, this.estimateSize(team));
		}
	},
	
	estimateSize:function(value){
		return this.sizeEstimator.estimateSize(value);
	}
})