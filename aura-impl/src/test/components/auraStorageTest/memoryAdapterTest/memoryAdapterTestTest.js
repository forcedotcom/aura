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
	setUp:function(cmp){
		this.adapter = new $A.storageService.createAdapter("memory");
	},
	
	testSizeInitial:{
		test:function(cmp) {
			$A.test.assertEquals(0, this.adapter.getSize());
		}
	},
	
	testSizeOneObject:{
		test:function(cmp) {
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			// the key and object have 25 characters + 2 associative array entries
			// the expected number of bytes is: (25 * 2) + (2 * 8) = 66
			$A.test.assertEquals(66, this.adapter.getSize());
		}
	},

	testSizeSameKeySameObject:{
		test:function(cmp) {
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			var originalSize = this.adapter.getSize();
			
			// do nothing and the size should not have changed
			$A.test.assertEquals(originalSize, this.adapter.getSize());
			
			// add another object to trigger a recalculation of size
			this.adapter.setItem("key2", {});
			// size should be the original + the 8 for the new key
			$A.test.assertEquals(originalSize + (8), this.adapter.getSize());
		}
	},
	
	testSizeSameKeyEqualObject:{
		test:function(cmp) {		
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			var originalSize = this.adapter.getSize();
			
			// set the key with an equal (===) object.
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			// the size should not have changed
			$A.test.assertEquals(originalSize, this.adapter.getSize());
		}
	},

	testSizeSameKeyDifferentObject:{
		test:function(cmp) {
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			// the key and object have 25 characters + 2 associative array entries
			// the expected number of bytes is: (25 * 2) + (2 * 8) = 66
			$A.test.assertEquals(66, this.adapter.getSize());
			
			this.adapter.setItem("key1", {"value": {"who":"Matthew", "what":"Developer", "now": true}});
			// new object has one boolean + 30 characters + 3 associative array entries
			// the expected number of bytes is: 4 + (30 * 2) + (3 * 8) = 88 
			$A.test.assertEquals(88, this.adapter.getSize());
		}
	},

	testSizeMultipleObjects:{
		test:function(cmp) {
			// 68 bytes
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer1"}});
			// 68 bytes
			this.adapter.setItem("key2", {"value": {"who":"Kevin", "what":"Developer2"}});
			// 72 bytes
			this.adapter.setItem("key3", {"value": {"who":"Matthew", "what":"Developer3"}});
			// 66 bytes
			this.adapter.setItem("key4", {"value": {"who":"Dave", "what":"Developer4"}});
			
			$A.test.assertEquals(274, this.adapter.getSize());
		}
	},
	
	testSizeAfterRemoveKey:{
		test:function(cmp) {
			// the bytes for each line is: (25 chars * 2) + (2 * 8) = 66
			this.adapter.setItem("key1", {"value": {"who":"Brian", "what":"Developer"}});
			this.adapter.setItem("key2", {"value": {"who":"Kevin", "what":"Developer"}});
			$A.test.assertEquals(132, this.adapter.getSize());
			
			this.adapter.removeItem("key1");
			//removing the key, removes it from this.storage
			$A.test.assertEquals(66, this.adapter.getSize());
			
			// adding a new key, new size of object.  70 bytes
			this.adapter.setItem("key1", {"value": {"who":"Brian2", "what":"Developer3"}});
			$A.test.assertEquals(136, this.adapter.getSize());
		}
	}
	
})