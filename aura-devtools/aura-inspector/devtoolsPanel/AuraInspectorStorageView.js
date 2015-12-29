/**
 * Inspector for Aura Storage Service.
 */
function AuraInspectorStorageView(devtoolsPanel) {
    /** Data from Aura Storage Service to display */
    var data = {};

    /** Whether rerender is required */
    var dirty = true;

    var firstLoad = true;

    /** Id for this view, must be unique among all views. */
    this.panelId = "storage";

    /** Markup of panel */
    var markup = `
        <menu type="toolbar">
        <li>
          <button id="refresh-button" class="refresh-status-bar-item status-bar-item" title="Refresh">
            <div class="glyph toolbar-button-theme"></div>
            <div class="glyph shadow"></div>
          </button>
        </li>
        </menu>
        <div class="storage-viewer" id="storage-viewer"/>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        // refresh button
        var refreshButton = tabBody.querySelector("#refresh-button");
        refreshButton.addEventListener("click", RefreshButton_OnClick.bind(this));

        // listen for data
        devtoolsPanel.subscribe("AuraInspector:StorageData", AuraInspector_StorageData.bind(this));

        // listen for removing storage item for action
        devtoolsPanel.subscribe("AuraInspector:RemoveStorageData", AuraInspector_RemoveData.bind(this));
    };

    this.render = function() {
        if (!dirty) { return; }
        dirty = false;

        if(firstLoad) {
            firstLoad = false;
            this.refresh();
        } else {
            drawStoragePanel();
        }
    };

    this.refresh = function(){
        this.clearData();
        this.getStoresList(function(stores){
            this.updateStores(stores, function() {
                drawStoragePanel();
                dirty = false;
            });
        }.bind(this));
    };

    this.updateStores = function(stores, allDoneCallback) {
        var command;
        var count = stores && stores.length || 0;
        var processed = 0;

        if(!count) {
            allDoneCallback();
            return;
        }

        for (var c=0;c<count;c++) {
            var store = stores[c];
            var command = `
                var o_${store} = new Object();
                var i_${store} = $A.storageService.getStorage('${store}');

                // sync
                o_${store}.name = i_${store}.getName();
                o_${store}.maxSize = i_${store}.getMaxSize();
                o_${store}.version = i_${store}.getVersion();

                // async
                i_${store}.getSize()
                    .then(function(size) { o_${store}.size = size; }, function(err) { o_${store}.size = JSON.stringify(err); })
                    .then(function() { return i_${store}.getAll(); })
                    .then(function(all) { o_${store}.all = all; }, function(err) { o_${store}.all = JSON.stringify(err); })
                    // last then() is to post the results to aura inspector
                    .then(function() { window.postMessage({action:'AuraInspector:publish', key: 'AuraInspector:StorageData', data:{ id:'${store}', data: JSON.stringify(o_${store})} }, window.location.href); });

                // sync return whatever properties we have
                o_${store};
            `;

            chrome.devtools.inspectedWindow.eval(command, function(storeKey, response, exceptionInfo) {
                if(exceptionInfo) { console.error(exceptionInfo); }
                if(!response) { ++processed; return; }
                this.setData(storeKey, response);

                if(++processed === count) {
                    allDoneCallback();
                }
            }.bind(this, store));
        }
    };

    this.getStoresList = function(callback) {
        var stores = [];

        // must collect the store names before doing the cache update
        var command = "Object.keys($A.storageService.getStorages());";
        chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if(!response) { return; }
            // Replace ' \' '  to '_' so that template strings doesn't break.
            stores = response.map(function(name){ return name.replace('\'', '_'); });

            if(callback) {
                callback(stores);
            }
        });
    };

    this.setData = function(key, value) {
        dirty = true;
        data[key] = value;
    };

    this.clearData = function() {
        dirty = true;
        data = {};
    }

    function drawStoragePanel(){
        var formatted = {};
        var f, d;
        for (var i in data) {
            // note: any item that is async fetched may not exist in this render cycle
            d = data[i];
            f = {};
            f.Adapter = d.name;

            var sizeAsPercent;
            f.sizeEstimate = "";
            if (d.size !== undefined) {
                sizeAsPercent = (d.size / d.maxSize * 100).toFixed(0);
                f.sizeEstimate = d.size.toFixed(1) + " KB (" + sizeAsPercent + "% of " + d.maxSize.toFixed(0) + " KB)";
            }

            f.Version = d.version;

            f.Items = {};
            if (d.all !== undefined && d.all.length > 0) {
                var item = {};
                for (var index in d.all){
                    item = {
                        key : d.all[index].key,
                        value : d.all[index].value,
                        CreatedTime : (d.all[index].value.storage) ? toDate(d.all[index].value.storage.created) : '',
                        sizeEstimate : estimateSize(d.all[index].value)
                    };
                    f.Items[d.all[index].key] = item;
                }
            }

            formatted[i] = f;
        }

        var output = document.createElement("aurainspector-json");
        output.setAttribute("expandTo", 2);
        //Lin TODO: make each storage item a single element ?
        output.textContent = JSON.stringify(formatted);

        var node = document.getElementById("storage-viewer");
        node.removeChildren();
        node.appendChild(output);
    }

    this.removeData = function(key) {
        dirty = true;
        if(key && key.length > 0 ) {
            //Lin TODO: highlight the storage item we gonna delete in StorageView, and ask for confirmation.
            if(key in data) {
                delete data[key];
            }
        }
        this.render();
    }

    function AuraInspector_StorageData(event) {
        this.setData(event.id, JSON.parse(event.data));
        this.render();
    }

    function AuraInspector_RemoveData(event) {
        this.removeData(event.storageKey);
    }

    function RefreshButton_OnClick(event) {
        this.refresh();
    }

    /**
     * Gets a KB-based label.
     * @param {Number} value - value, in bytes, to convert.
     * @return {String} label in KB.
     */
    function toKb(value, decimals) {
        return (value / 1024).toFixed(decimals) + " KB";
    }

    /**
     * Estimates the size of a value. This is very approximate and a simplified
     * version of $A.util.estimateSize().
     * @return {String} label in KB.
     */
    function estimateSize(value) {
        var estimate = JSON.stringify(value).length;
        return toKb(estimate, 1);
    }

    /**
     * Gets localized Date string
     * @param {Number} long number - time stamp.
     * @return {String} localized date string
     */
     function toDate(long) {
        return new Date(long).toLocaleTimeString();
     }
}
