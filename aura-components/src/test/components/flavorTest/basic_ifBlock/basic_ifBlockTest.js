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
            var c1 = cmp.find("trueBlockFlavoredInstance");
            var trueBlockFlavoredInstance = c1.getElement();

            var c2 = cmp.find("elseBlockFlavoredInstance");
            var elseBlockFlavoredInstance = c2.getElement();

            var c3 = cmp.find("trueBlockFlavoredDefault");
            var trueBlockFlavoredDefault = c3.getElement();

            var c4 = cmp.find("trueBlockFlavoredDefault");
            var trueBlockFlavoredDefault = c4.getElement();

            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredInstance, $A.util.buildFlavorClass(c1, "flavorA")), "component in if block did not apply instance flavor");
            $A.test.assertTrue($A.util.hasClass(elseBlockFlavoredInstance, $A.util.buildFlavorClass(c2, "flavorA")),"component in else block did not apply instance flavor");
            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredDefault, $A.util.buildFlavorClass(c3, "explicitDefault")), "component in if block did not apply default flavor");
            $A.test.assertTrue($A.util.hasClass(trueBlockFlavoredDefault, $A.util.buildFlavorClass(c4, "explicitDefault")), "component in else block did not apply default flavor");
        }
    }
})
