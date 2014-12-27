/*
 * Copyright (C) 2014 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    testBrokenImageWithOnError:{
        test : function(cmp) {
            var imageElement = cmp.find("image1").getElement();
            var isHidden = $A.util.hasClass(imageElement,"hide");
            $A.test.assertTrue(isHidden);
        }
    },

    testUnBrokenImageWithOnError:{
        test : function(cmp) {
            var imageElement = cmp.find("image2").getElement();
            var isHidden = $A.util.hasClass(imageElement,"hide");
            $A.test.assertFalse(isHidden);
        }
    },

    testBrokenImageWithoutOnError:{
        test : function(cmp) {
            var imageElement = cmp.find("image3").getElement();
            var isHidden = $A.util.hasClass(imageElement,"hide");
            $A.test.assertFalse(isHidden);
        }
    }
})
