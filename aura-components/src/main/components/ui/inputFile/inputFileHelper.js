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
    updateInputFile : function (cmp, files) {
        cmp.getElement('input.hidden-input-file').files = files;
    },
    updateFilesAttr : function (cmp, files) {
        cmp.set('v.files', files);
    },
    attachFormElement : function (cmp, event) {
        event.setParam('form',this.getFormElement(cmp));
    },
    getFormElement : function (cmp) {
        return cmp.find('hidden-input').getElement().form;
    },
    customBody : function (cmp) {
        return cmp.get('v.body').length > 0;
    },
    findAllHelperCmps : function (body) {
        return body.reduce(function (prev, cmp) {
            if (cmp.meta.name === 'aura$text') { return prev; }
            if (cmp.meta.name === 'aura$html') {
                return prev.concat(this.findAllHelperCmps(cmp.get('v.body')));
            }
            if (this.isValidHelperCmp(cmp)) {
                prev.push(cmp);
                return prev;
            }
            return prev;
        }.bind(this),[]);
    },
    isValidHelperCmp : function (cmp) {
        var VALID_NAMES_MAP = {
            'ui$inputFileDroppableZone': true,
            'ui$inputFileOpenBrowse'   : true,
            'ui$inputFileFilesList'    : true
        };
        return cmp.isValid() && VALID_NAMES_MAP[cmp.meta && cmp.meta.name];
    },
    storeHelperCmpRefs : function (cmp, refs) {
        cmp.set('v.privateHelperCmpRefs', refs);
    },
    thereIsHelperCmps : function (cmp) {
        return cmp.get('v.privateHelperCmpRefs').length > 0;
    },
    setCmpContext : function (cmp, cmpRef) {
        switch (cmpRef.meta.name) {
            case 'ui$inputFileDroppableZone':
            case 'ui$inputFileOpenBrowse' :
                cmpRef.set('v.accept'        , cmp.get('v.accept'));
                cmpRef.set('v.multiple'      , cmp.get('v.multiple'));
                cmpRef.set('v.maxSizeAllowed', cmp.get('v.maxSizeAllowed'));
                cmpRef.set('v.disabled'      , cmp.get('v.disabled'));
                break;
            case 'ui$inputFileFilesList' :
                cmpRef.set('v.files', cmp.get('v.files'));
                break;
        }

    },
    updateHelperCmpContext : function (cmp) {
        var helperCmpRefs = cmp.get('v.privateHelperCmpRefs');
        helperCmpRefs.forEach(function (cmpHelper) {
            this.setCmpContext(cmp, cmpHelper);
        }.bind(this));
    },
    getMappedFiles : function (cmp) {
        var files  = cmp.get('v.files');
        return Object.keys(files).map(function (index) {
            return files[index];
        });
    },
    registerActions : function (cmp) {
        var customList = cmp.get('v.privateHelperCmpRefs');
        customList.forEach(function (custom) {
            custom.register('reset', cmp.reset);
        });
    },
    fireChangeEvent : function (cmp, files) {
        cmp.getEvent('change').setParams({
            files : files
        }).fire();
    }

});