/*
 * Copyright (C) 2012 salesforce.com, inc.
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
//    updateDisplay:function (component) {
//        var currentPage=component.get("v.currentPage");
//        var pageCount=component.get("v.pageCount");
//        var isFirstOrEmpty=(currentPage<=1);
//        var isLast=(currentPage==pageCount);
//        var triggers={
//            first:component.find("pager:first").getElement(),
//            previous:component.find("pager:previous").getElement(),
//            next:component.find("pager:next").getElement(),
//            last:component.find("pager:last").getElement()
//        };
//        $A.util[isFirstOrEmpty ? "addClass" : "removeClass"](triggers.first,"off");
//        $A.util[isFirstOrEmpty ? "addClass" : "removeClass"](triggers.previous,"off");
//        triggers.first.disabled = triggers.previous.disabled = isFirstOrEmpty;
//        triggers.first.setAttribute("aria-disabled",isFirstOrEmpty);
//        triggers.previous.setAttribute("aria-disabled", isFirstOrEmpty);
//
//        $A.util[isLast ? "addClass" : "removeClass"](triggers.next, "off");
//        $A.util[isLast ? "addClass": "removeClass"](triggers.last, "off");
//        triggers.next.disabled = triggers.last.disabled = isLast;
//        triggers.next.setAttribute("aria-disabled", isLast);
//        triggers.last.setAttribute("aria-disabled", isLast);
//    }
})
