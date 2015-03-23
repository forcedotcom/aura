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
    /**
     * Assert that component has a helper object even there is no helper file attached to this cmp, nor does this component extend/implement any other component.
     */
    testGetHelper: {
        test: function(component){
            var helper = component.getDef().getHelper();
            $A.test.assertNotUndefinedOrNull(helper, "even the component has no helper, we still should get a Helper object");
            $A.test.assertEquals($A.componentService.getComponentClass("test:testCmpNoJSHelper").prototype.helper, helper );
        }
    }
})