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
    createHTMLElement : function (cmp) {
        cmp.set('v.inputFileHtmlElement',this.createInputFileElementAndSetListener(cmp));
    },
    createInputFileElementAndSetListener : function (cmp) {
        var fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('multiple', cmp.get('v.multiple'));
        fileSelector.setAttribute('accept',   cmp.get('v.accept'));

        // setting listen input change event
        setTimeout(function () {
            fileSelector.addEventListener('change', this.handleChangeEvent.bind(this,cmp));
        }.bind(this),0);

        return fileSelector;
    },
    handleChangeEvent : function (cmp, event) {
        var files = event.target.files;

        if (this._meetsSizeConditions(cmp, files)) {
            cmp.getEvent('change').setParams({
                files: files
            }).fire();
        }
    },
    _meetsSizeConditions : function (cmp, files) {
        var size = cmp.get('v.maxSizeAllowed') || Infinity;
        return this._getFilesArr(files).every(function (file) {
            return file.size <= size;
        });
    },
    _getFilesArr : function (files) {
        return Object.keys(files).map(function (index) {
            return files[index];
        });
    }
});