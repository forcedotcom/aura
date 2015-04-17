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
    testInsideIfBlock: {
        test: function(cmp) {
            var trueBlockFlavoredInstance = cmp.find("trueBlockFlavoredInstance").getElement();
            var elseBlockFlavoredInstance = cmp.find("elseBlockFlavoredInstance").getElement();
            var trueBlockFlavoredDefault = cmp.find("trueBlockFlavoredDefault").getElement();
            var elseBlockFlavoredDefault = cmp.find("trueBlockFlavoredDefault").getElement();

            var expected = $A.util.buildFlavorClass("test");
            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredInstance, expected), "component in if block did not apply instance flavor");
            $A.test.assertTrue($A.util.hasClass(elseBlockFlavoredInstance, expected),"component in else block did not apply instance flavor");
            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredDefault, expected), "component in if block did not apply default flavor");
            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredDefault, expected), "component in else block did not apply default flavor");
        }
    }
})
