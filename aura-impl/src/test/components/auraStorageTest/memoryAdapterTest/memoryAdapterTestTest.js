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
			$A.test.fail("Not Yet Implemented");
		}
	},

	testSizeMultipleObjects:{
		test:function(cmp) {
			$A.test.fail("Not Yet Implemented");
		}
	}
	
	// BDTODO: Note the following cases to test: boolean, string, number, array, object, undefined, null, other.
	// BDTODO: Size after clear.
})