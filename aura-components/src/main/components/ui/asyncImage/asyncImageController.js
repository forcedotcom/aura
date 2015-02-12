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
    load: function(cmp, event, helper) {
        var imageElement = cmp.getElement().getElementsByTagName("img")[0];
        imageElement.src = cmp.get("v.actualImageSrc");
        // refresh default image and notify asyncComponentManager when new image is loaded.
        imageElement.onload = function() {
            $A.get("e.ui:asyncComponentLoaded").setParams({
                asyncComponent: cmp
            }).fire();
        };

        // notify asyncComponentManager when image is loaded with error
        imageElement.onerror = function() {
            $A.get("e.ui:asyncComponentLoaded").setParams({
                asyncComponent: cmp
            }).fire();
        };
    }
})
