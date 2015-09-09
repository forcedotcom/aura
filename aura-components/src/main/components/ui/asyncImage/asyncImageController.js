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
    load: function (cmp) {
        var imageElement = cmp.getElement().getElementsByTagName("img")[0];
        imageElement.src = cmp.get("v.actualImageSrc");
        var callback = $A.getCallback(function () {
            if (cmp && cmp.isValid()) {
                $A.get("e.ui:asyncComponentLoaded").fire({"asyncComponent": cmp});
            }
        });
        // notify asyncComponentManager when image is loaded (or there was an error)
        imageElement.onload = callback;
        imageElement.onerror = callback;
    }
})// eslint-disable-line semi
