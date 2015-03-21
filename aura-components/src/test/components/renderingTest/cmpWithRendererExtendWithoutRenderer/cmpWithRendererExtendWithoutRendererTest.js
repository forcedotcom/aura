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
     * Verify base component's render() is only called once, when 
     * base component has its customized renderer but extend component
     * doesn't
     */
    testRenderOnceWithBaseCmpRenderer : {
        test : function(cmp) {
            $A.test.assertEquals(1, cmp.get("v.renderCounter"),
                    "Base component's render() doesn't get called once.");
        }
    },

    /*
     * Verify base component's rerender() is only called once, when 
     * base component has its customized renderer but extend component
     * doesn't
     */
    testRerenderOnceWithBaseCmpRenderer : {
        test: function(cmp) {
            cmp.rerender();
            $A.test.assertEquals(1, cmp.get("v.rerenderCounter"),
                    "Base component's rerender() doesn't get called once.");
        }
    },

    /*
     * Verify base component's unrender() is only called once once, when 
     * base component has its customized renderer but extend component
     * doesn't
     */
    testUnrenderOnceWithBaseCmpRenderer : {
        test : function(cmp) {
            cmp.unrender();
            $A.test.assertEquals(1, cmp.get("v.unrenderCounter"),
                    "Base component's render() doesn't get called once.");
        }
    }
})
