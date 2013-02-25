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
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            // the key and object have 23 characters + 2 associative array entries
            // the expected number of bytes is: (23 * 2) + (2 * 8) = 62
            $A.test.assertEquals(62, this.adapter.getSize());
        }
    },

    testSizeSameKeySameObject:{
        test:function(cmp) {
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
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
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            var originalSize = this.adapter.getSize();

            // set the key with an equal (===) object.
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            // the size should not have changed
            $A.test.assertEquals(originalSize, this.adapter.getSize());
        }
    },

    testSizeSameKeyDifferentObject:{
        test:function(cmp) {
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            // the key and object have 23 characters + 2 associative array entries
            // the expected number of bytes is: (23 * 2) + (2 * 8) = 62
            $A.test.assertEquals(62, this.adapter.getSize());

            this.adapter.setItem("key1", {"value": {"alpha":"epsilon", "gamma":"zeta", "now": true}});
            // new object has one boolean + 28 characters + 3 associative array entries
            // the expected number of bytes is: 4 + (28 * 2) + (3 * 8) = 84
            $A.test.assertEquals(84, this.adapter.getSize());
        }
    },

    testSizeMultipleObjects:{
        test:function(cmp) {
            // 62 bytes
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            // 66 bytes
            this.adapter.setItem("key2", {"value": {"alpha":"epsilon", "gamma":"zeta"}});
            // 60 bytes
            this.adapter.setItem("key3", {"value": {"alpha":"eta", "gamma":"theta"}});
            // 62 bytes
            this.adapter.setItem("key4", {"value": {"alpha":"iota", "gamma":"kappa"}});

            $A.test.assertEquals(250, this.adapter.getSize());
        }
    },

    testSizeAfterRemoveKey:{
        test:function(cmp) {
            // the bytes for each line is: (23 chars * 2) + (2 * 8) = 62
            this.adapter.setItem("key1", {"value": {"alpha":"beta", "gamma":"delta"}});
            this.adapter.setItem("key2", {"value": {"alpha":"iota", "gamma":"kappa"}});
            $A.test.assertEquals(124, this.adapter.getSize());

            this.adapter.removeItem("key1");
            //removing the key, removes it from this.storage
            $A.test.assertEquals(62, this.adapter.getSize());

            // adding a new key, new size of object.  64 bytes
            this.adapter.setItem("key1", {"value": {"alpha":"epsilon", "gamma":"zeta"}});
            $A.test.assertEquals(128, this.adapter.getSize());
        }
    }

})