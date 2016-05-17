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
        var body = cmp.get('v.body')
          , helperCmpList;

        helperCmpList = helper.findAllHelperCmps(body);

        // Storing helper component list, then we don't have traverse the body more than one
        helper.storeHelperCmpRefs(cmp, helperCmpList);

        helperCmpList.forEach(function (helperCmp) {
            helperCmp.setAttributeValueProvider(cmp);
            helper.setCmpContext(cmp, helperCmp);
        });
    },
    handleChange : function (cmp, event, helper) {
        var files = event.getParam('files');
        helper.updateInputFile(cmp,files);
        helper.updateFilesAttr(cmp,files);
        helper.attachFormElement(cmp,event);

        if (helper.thereIsHelperCmps(cmp)) {
            helper.updateHelperCmpContext(cmp);
        }
    },
    reset : function (cmp, event, helper) {
        var EMPTY_OBJ = {};
        helper.fireChangeEvent(cmp, EMPTY_OBJ);
    }

});