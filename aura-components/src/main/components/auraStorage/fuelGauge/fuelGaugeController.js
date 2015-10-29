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
    update : function(cmp, event, helper){
        helper.update(cmp);
    },

    showStats : function(cmp){

        var storage = $A.storageService.getStorage(cmp.get("v.storageName"));

        storage.getSize().then(
            undefined,
            function() { return "unknown"; }
        ).then($A.getCallback(function(size) {
            var message = $A.util.format("Storage name: {0}\nAdapter: {1}\nSize: {2} of {3} KB\n\nPress OK to clear ALL storages or cancel to abort.",
                cmp.get("v.storageName"),
                storage.getName(),
                size.toFixed ? size.toFixed(0) : size,
                storage.getMaxSize()
            );
            var confirmed = confirm(message); //eslint-disable-line no-alert
            if (confirmed) {
                $A.log("Asynchronously clearing all storages");
                var storages = $A.storageService.getStorages();
                var promises = [];
                for (var name in storages) {
                    promises.push(storages[name].clear());
                }
                Promise.all(promises).then(function() {
                    $A.log("All storages cleared");
                }, function(e) {
                    $A.warning("Error while clearing storages: ", e);
                });
            }
        }));
    }
})// eslint-disable-line semi
