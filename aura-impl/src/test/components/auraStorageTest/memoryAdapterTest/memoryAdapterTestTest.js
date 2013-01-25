/*
 * Copyright (C) 2012 salesforce.com, inc.
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
	testSizeInitial:{
		test:function(cmp) {
			$A.test.assertEquals(0, $A.storageService.getStorage().getSize());
		}
	},

	testSizeNumber:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("number", 100 );
			// size = (6*2) + 8 = 20 
			$A.test.assertEquals(20 / 1024.0, storage.getSize());
		}
	},
	
	testSizeString:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("string", "hundred" );
			// size = (6*2) + (7*2) = 24  
			$A.test.assertEquals(26 / 1024.0, storage.getSize());
		}
	},
	
	testSizeBoolean:{
		test:function(cmp) {
			//$A.test.fail("Not Yet Implemented");
			var storage = $A.storageService.getStorage();
			storage.put("boolean", false );
			// size = (7*2) + 4 = 18  
			$A.test.assertEquals(18 / 1024.0, storage.getSize());
		}
	},

	testSizeArray:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("array", ["Brian", "Kevin", "Matthew", "Dave0"] );
			// the key and object have 27 characters + 5 object entries
			// the expected number of bytes is: (27 * 2) + (5 * 8) = 94
			$A.test.assertEquals(94 / 1024.0, storage.getSize());
		}
	},

	testSizeNull:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			var team = null;			
			storage.put("key1", team );
			// size = 4*2 + ? 
			$A.test.assertEquals(8 / 1024.0, storage.getSize());
		}
	},
	
	testSizeUndefined:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			var team;			
			storage.put("key1", team );
			// size = 4*2 + ? 
			$A.test.assertEquals(8 / 1024.0, storage.getSize());
		}
	},
	
	testSizeObject:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			var team = new Object();
			team.size=8;
			team.locations = ["SFO", "YVR", "NYC"];
			team.devs = {"Dev1": "Brian", "Dev2": "Kevin", "Dev3": "DaveO"};
			
			storage.put("key1", team );
			//seven nested keys + (eight "objects")*8 + (no of string chars)*2 + number
			// size = 7*(4*2) + (8*8) + 36*2 + 8
			$A.test.assertEquals(200 / 1024.0, storage.getSize());
		}
	},
	
	testSizeOneObject:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("key1", {"who":"Brian", "what":"Developer"});
			// the key and object have 25 characters + 2 associative array entries
			// the expected number of bytes is: (25 * 2) + (2 * 8) = 66
			$A.test.assertEquals(66 / 1024.0, storage.getSize());
		}
	},

	testSizeSameKeySameObject:{
		test:function(cmp) {		
			var storage = $A.storageService.getStorage();
			storage.put("key1", {"who":"Brian", "what":"Developer"});
			var originalSize = storage.getSize();
			
			// set the key with an equal (===) object.
			storage.put("key1", {"who":"Brian", "what":"Developer"});
			// the size should not have changed
			$A.test.assertEquals(originalSize, storage.getSize());
		}
	},

	testSizeSameKeyDifferentObject:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("key1", {"who":"Brian", "what":"Developer1"});
			var originalSize = storage.getSize();
			
			// set the key with an equal (===) object.
			storage.put("key1", {"who":"Helen", "what":"Patisserie"});
			// the size should not have changed
			$A.test.assertEquals(originalSize, storage.getSize());
		}
	},

	testSizeMultipleObjects:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			storage.put("key1", {"who":"Brian", "what":"Developer1"});
			storage.put("key2", {"who":"Kevin", "what":"Developer2"});
			storage.put("key3", {"who":"Matth", "what":"Developer3"});
			storage.put("key4", {"who":"DaveO", "what":"Developer4"});
			
			// the key and object have 26 characters + 2 associative array entries, x4 entries 
			// the expected number of bytes is: ((26 * 2) + (2 * 8))*4 = 
			$A.test.assertEquals(272 / 1024.0, storage.getSize());
		}
	},
	
	testSizeAfterRemoveKey:{
		test:function(cmp) {
			var storage = $A.storageService.getStorage();
			// the bytes for each line is: (25 chars * 2) + (2 * 8) = 66
			storage.put("key1", {"who":"Brian", "what":"Developer"});
			storage.put("key2", {"who":"Kevin", "what":"Developer"});
			var originalSize = storage.getSize();
			
			storage.remove("key1", false);
			//removing the key, removes it from storage
			$A.test.assertTrue(originalSize > storage.getSize());
			
			//adding a new key, new size of object
			storage.put("key1", {"who":"Brian2", "what":"Developer3"});
			// the additional bytes is: (27 chars * 2) + (2 * 8) = 70
			$A.test.assertEquals(136/1024.0, storage.getSize());
		}
	}
	
})