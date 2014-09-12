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
    registerAsyncComponent: function (cmp, event, helper) {
        // register async component
        var registeredComponents = cmp._registeredComponents || [];
        var asyncComponent = event.getParam("asyncComponent");
        if(asyncComponent) {
            registeredComponents.push(event.getParam("asyncComponent"));
            cmp._registeredComponents = registeredComponents;

            // load next components if number of loading components is under concurrency limit
            helper.loadComponents(cmp);
        }
    },

    asyncComponentLoadedCallback: function (cmp, event, helper) {
    	// decrement loading component count
        var loadingComponents = cmp._numOfLoadingComponents;
        loadingComponents -= 1;
        cmp._numOfLoadingComponents =loadingComponents;

        // load next components if number of loading components is under concurrency limit
    	helper.loadComponents(cmp);
    }
})

