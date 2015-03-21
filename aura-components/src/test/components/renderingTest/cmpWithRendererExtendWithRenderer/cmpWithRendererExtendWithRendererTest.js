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
    /*
     * Verify base component and derived component call their own render()
     * method once when base component and extend component both have customized
     * renderer.
     */
    testRenderOnceWithBaseAndExtendCmpRenderer : {
        test : function(cmp) {
            $A.test.assertEquals(1, cmp.get("v.renderCounter"),
                    "Base component's render() doesn't get called once.");
            $A.test.assertEquals(1, cmp.get("v.extendRenderCounter"),
                    "Extend component's render() doesn't get called once.");
        }
    },

    /*
     * Verify base component and derived component call their own rerender()
     * method once when base component and extend component both have customized
     * renderer.
     */
    testRerenderOnceWithBaseAndExtendCmpRenderer : {
        test : function(cmp) {
            cmp.rerender();
            $A.test.assertEquals(1, cmp.get("v.rerenderCounter"),
                    "Base component's rerender() doesn't get called once.");
            $A.test.assertEquals(1, cmp.get("v.extendRerenderCounter"),
                    "Extend component's rerender() doesn't get called once.");
        }
    },

    /*
     * Verify base component and derived component call their own unrender()
     * method once when base component and extend component both have customized
     * renderer.
     */
    testUnrenderOnceWithBaseAndExtendCmpRenderer : {
        test : function(cmp) {
            cmp.unrender();
            $A.test.assertEquals(1, cmp.get("v.unrenderCounter"),
                    "Base component's unrender() doesn't get called once.");
            $A.test.assertEquals(1, cmp.get("v.extendUnrenderCounter"),
                    "Extend component's unrender() doesn't get called once.");
        }
    }
})
