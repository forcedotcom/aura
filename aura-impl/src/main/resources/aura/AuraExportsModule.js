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
Aura.ExportsModule = {
    "dispatchGlobalEvent": function (eventName, eventParams) {
        var context = $A.getContext();
        context.setCurrentAccess($A.getRoot());
        try {
            $A.eventService.newEvent(eventName).setParams(eventParams).fire();
        } finally {
            context.releaseCurrentAccess();    
        }
    }
};