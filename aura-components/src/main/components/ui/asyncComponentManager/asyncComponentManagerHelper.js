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
     * Load components if there are registered components and concurrency limit is not reached
     */
    loadComponents: function (cmp) {
        var numOfLoadingComponents = cmp._numOfLoadingComponents || 0;
        var registeredComponents = cmp._registeredComponents || [];
        var maxConcurrency = cmp.get("v.maxConcurrency");
        var asyncCmp = "";

        while(numOfLoadingComponents < maxConcurrency && registeredComponents.length > 0) {
            // get the next registered component to load
       	    asyncCmp = registeredComponents.shift();
            cmp._registeredComponents = registeredComponents;

            // fire load event
            if(asyncCmp) {
                asyncCmp.get("e.load").fire();

                // increment loadingComponents count
                numOfLoadingComponents += 1;
                cmp._numOfLoadingComponents = numOfLoadingComponents;
            }
        }
    }
})

