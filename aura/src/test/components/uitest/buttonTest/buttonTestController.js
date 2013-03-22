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
{
    handleIconAndLabel : function(cmp, event){
        cmp.getAttributes().setValue("iconAndLabelButtonPressedMessage", "Icon and label button was pressed!!!");
    },

    handleLabelOnly : function(cmp, event){
        cmp.getAttributes().setValue("labelOnlyButtonPressedMessage", "Label only button was pressed!!!");
    },

    handleIconOnly : function(cmp, event){
        cmp.getAttributes().setValue("iconOnlyButtonPressedMessage", "Icon only button was pressed!!!");
    },
    
    checkDomEventSet : function(cmp, event){
    	var domEvent = event.getParam("domEvent");
    	if ($A.util.isUndefinedOrNull(domEvent)) {
    		cmp.getAttributes().setValue("isDomEventSet", false);
    	} else {
    		cmp.getAttributes().setValue("isDomEventSet", true);
    	}
    }
}
