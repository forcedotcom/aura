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
    checkImageMatches : function(cmp, expectedSrc) {
        var imgElement = cmp.find("image").getElement().firstChild;
        $A.test.assertTrue($A.util.stringEndsWith(imgElement.src, expectedSrc), "Expected src should be " + expectedSrc
                + " by default");
        // check image was passed as a parameter to the action
        $A.test.addWaitForWithFailureMessage(true, function() {
            return $A.util.stringEndsWith(cmp.find("outputStatus").get("v.value"), expectedSrc)
        }, "Expected src should be " + expectedSrc + " by default after onload is fired");
    },

    /**
     * Test case for when the image is done loading, passes the image loaded as a parameter to the action. Bug:
     * W-2509320
     */
    testImageOnLoadPassesParams : {
        test : [ function(cmp) {
            var defaultSrc = "/auraFW/resources/aura/s.gif";
            this.checkImageMatches(cmp, defaultSrc);
        }, function(cmp) {
            $A.test.clickOrTouch(cmp.find("loadButton").getElement());
        }, function(cmp) {
            var expectedSrc = "/auraFW/resources/aura/auralogo.png";
            this.checkImageMatches(cmp, expectedSrc);
        } ]
    }
})
