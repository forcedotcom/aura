/**
 * Inspector for Aura Storage Service.
 */
function AuraInspectorStorageView(devtoolsPanel) {
    /** Names of storages */
    var stores = {};

    /** Data from Aura Storage Service to display */
    var data = {};

    /** Whether rerender is required */
    var dirty = true;

    /** Id for this view, must be unique among all views. */
    this.panelId = "storage";

    /** Markup of panel */
    var markup = `
        <menu type="toolbar">
            <li><button id="refresh-button"><span>Refresh</span></button></li>
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

        // async fetch data about storages
        getStoresAndData.bind(this)();
    };

    this.render = function() {
        if (!dirty) { return; }
        dirty = false;

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
        output.textContent = JSON.stringify(formatted);

        var node = document.getElementById("storage-viewer");
        node.removeChildren();
        node.appendChild(output);
    };

    this.updateCache = function() {
        var command;
        for (var key in stores) {
            var store = stores[key];
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

            // Move this out of the devtools panel
            devtoolsPanel.updateCacheViewer(this.panelId, store, command);
        }
    };

    this.setData = function(key, value) {
        dirty = true;
        data[key] = value;
        this.render();
    };

    function AuraInspector_StorageData(event) {
        this.setData(event.id, JSON.parse(event.data));
    }

    function getStoresAndData() {
        data = {}; // Refresh data before fetching new data
        // must collect the store names before doing the cache update
        var command = "Object.keys($A.storageService.getStorages());";
        chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if(!response) { return; }
            // Replace ' \' '  to '_' so that template strings doesn't break.
            stores = response.map(function(x){ return x.replace('\'', '_'); });
            this.updateCache();
        }.bind(this));
    }

    function RefreshButton_OnClick(event) {
        getStoresAndData.bind(this)();
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
