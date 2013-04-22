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
    changePage:function(component,domEvent,helper){
        var pageInput = component.find("pager:pageInput").getElement();
        var targetPage = parseInt(pageInput.value, 10);

        if (isNaN(targetPage) || targetPage<1 || targetPage > component.get("v.pageCount")) {
            // Reset currentPage visualization
            pageInput.value=component.get("v.currentPage");
            return;
        }

        helper.changePage(component,targetPage,domEvent);
    }
})
