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
    init : function (cmp, event, helper) {
        helper.setDropZoneClassList(cmp);
    },
    handleDragEnter : function (cmp, event, helper) {
        helper.setElementOverStyleClass(cmp);
    },
    handleDragLeave : function (cmp, event, helper) {
        helper.removeElementOverStyleClass(cmp);
    },
    handleOnDrop : function (cmp, event, helper) {
        event.preventDefault();
        helper.removeElementOverStyleClass(cmp);

        if (helper.thereAreFiles(event) && helper.filesAreValid(cmp,event)) {
            helper.fireDropEvent(cmp,event);
        }
    },
    allowDrop : function (cmp, event, helper) {
        event.preventDefault();
        helper.setElementOverStyleClass(cmp);
    }
})