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
    /**
     * The initial setting of the tree is handled just like any other future
     * value change.
     */
    doInit : function(cmp, evt, helper) {
        if (helper.preprocessTree(cmp, evt)) {
            helper.doUpdate(cmp);
        }
    },
    
    /**
     * When the tree is set, try to preprocess it. If it exists, then update the
     * UI accordingly.
     */
    treeChange : function(cmp, evt, helper) {
        if (helper.preprocessTree(cmp, evt)) {
            helper.doUpdate(cmp);
        }
    },
    
    /**
     * If the location has changed to a new value with the layoutToken that
     * corresponds to this tree, update the UI.
     */
    handleLocationChange : function(cmp, event, helper) {
        var token = event.getParam('token');
        if (token == cmp.get('v.layoutToken')) {
            // only process updates if this tree is part of the new layout.
            helper.doUpdate(cmp);
        }
    }
}