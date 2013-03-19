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
/*jslint sub: true */

//TODO: A list of things to address before we are DONE DONE:
//- What is our logging story?  Do we just reuse $A.log?  Are we also trying to do some cordova-specific logging?

//#include aura.storage.adapters.SizeEstimator
//#include aura.storage.adapters.SmartStoreCursorIterator

//Public methods
/**
 * @namespace The SmartStore adapter for storage service implementation
 * @constructor
 * The constructor does not call setup (which is asynchronous) because it does not work on device
 */
var SmartStoreAdapter = function SmartStoreAdapter(config) {
	
	
	// DCHASMAN TODO Figure out how to wire up config["name"] to create instances of this adapter!
	// Looks like we just need to append the config["name"] to the SOUP_NAME prefix in SmartStoreAdapter.prototype.registerSoup() 
	
	
    this.setupStage = this.SETUP_STAGE_NOT_STARTED;
    this.clearRegisterSoupFailed = false;
    this._currentSize = 0;
    this.sizeEstimator = new SizeEstimator();
};

//Used at the end of the file before the variable is initialized so the name must be statically available
SmartStoreAdapter.NAME = "smartstore";

SmartStoreAdapter.prototype.SOUP_NAME = "cache";

//Soup item properties
SmartStoreAdapter.prototype.SOUP_KEY = "key";
SmartStoreAdapter.prototype.SOUP_VALUE = "soup_value";

//A property inside soup_value
SmartStoreAdapter.prototype.SOUP_EXPIRES = "expires";

//Stages of setup
SmartStoreAdapter.prototype.SETUP_STAGE_NOT_STARTED = "not_started";
SmartStoreAdapter.prototype.SETUP_STAGE_IN_PROGRESS = "in_progress";
SmartStoreAdapter.prototype.SETUP_STAGE_COMPLETED = "complete";
SmartStoreAdapter.prototype.SETUP_STAGE_ERROR = "error";
SmartStoreAdapter.prototype.QUERY_PAGE_SIZE = 20;


SmartStoreAdapter.prototype.getName = function() {
    return SmartStoreAdapter.NAME;
};

SmartStoreAdapter.prototype.getSize = function() {
    return this._currentSize;
};

//
// getItem
// successCallback is required, errorCallback is optional
// returns an item with value, created and expires attributes, excluding size attribute the we added and _soupEntryId that smartstore added
// calls setup

SmartStoreAdapter.prototype.getItem = function(key, successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        throw new Error("No successCallback passed to getItem");
    }
    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }
    var that = this;
    this.setup(
        function(){
            that.querySoupForItem(
                key, 
                function(entry){
                    // extract the value from the returned entry
                    if($A.util.isUndefinedOrNull(entry)){
                        successCallback();
                        return;
                    }

                    var entryValue = entry[that.SOUP_VALUE];
                    var item = {
                        "value": entryValue["value"],
                        "created": entryValue["created"],
                        "expires": entryValue["expires"]
                    };

                    successCallback(item);
                },
                function(err){
                    that.handleSmartStoreError("getItem", "querySoup", err, errorCallback);
                });
        },
        errorCallback);
};

//
// setItem
// sets item in the repository.  successCallback and errorCallback are optional
// calls setup
// Currently setting an item is a two-step process:
// 1. Get the existing item from the soup (if it exists) to recalculate size.
// 2. Insert the new item into the soup.
//
// item should have value, created, expires attributes
// We augment with size property when storing.
//
SmartStoreAdapter.prototype.setItem = function(key, item, successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        successCallback = function(){};
    }
    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }

    if(!$A.util.isObject(item)) {
        // fatal error: don't pass anything other than Objects into this layer
        throw "Item is not an object";
    }

    var that = this;
    this.setup(
        function(){
            that._logger("setItem");

            item.size = that.sizeEstimator.estimateSize(key) + that.sizeEstimator.estimateSize(item);
            that._logger("setItem() item.size = " + item.size);
            var newSize = that.incrementSize(item.size);
            that._logger("setItem() adapter size pre-Query = " + newSize);

            that.querySoupForItem(
                key, 
                function(entryFromQuery){
                    // extract the value from the returned entry
                    if(!$A.util.isUndefinedOrNull(entryFromQuery)){
                        // there was an existing value at this key
                        var newSize = that.incrementSize(-entryFromQuery[that.SOUP_VALUE]["size"]);
                        that._logger("setItem() adapter size post-Query = " + newSize);
                    }

                    var sanitizedKey = that.sanitizeKey(key);
                    var entriesToUpsert = [{}];
                    entriesToUpsert[0][that.SOUP_KEY] = sanitizedKey;
                    entriesToUpsert[0][that.SOUP_VALUE] = item;
                    that._smartstore["upsertSoupEntriesWithExternalId"](
                        that.SOUP_NAME,
                        entriesToUpsert,
                        that.SOUP_KEY,
                        function(items){
                            that._logger("upserted: " + items.length);
                            successCallback();
                        },
                        function(err){ 
                            that.handleSmartStoreError("setItem", "upsertSoupEntriesWithExternalId", err, errorCallback);
                        });
                },
                function(err){
                    that.handleSmartStoreError("setItem", "querySoup", err, errorCallback);
                });
        },
        errorCallback);
};

//
// removeItem
// optional successCallback and errorCallback
// calls setup
//to remove item:
//1. get the internal id of the object using a key-based query
//2. delete using the internal id

SmartStoreAdapter.prototype.removeItem = function(key, successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        successCallback = function(){};
    }
    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }

    var that = this;
    this.setup(function(){
        that.querySoupForItem(
            key,
            function(entryFromQuery) { 
                if($A.util.isUndefinedOrNull(entryFromQuery)){
                    // nothing to delete
                    successCallback();
                    return;
                }
                var newSize = that.incrementSize(-entryFromQuery[that.SOUP_VALUE]["size"]);
                that._logger("setItem() size post-Remove = " + newSize);
                that._smartstore["removeFromSoup"](that.SOUP_NAME,
                    // TODO: This is kind of ugly, looking at this internal variable.  Is this really what is expected?
                    [entryFromQuery["_soupEntryId"]],
                    function() {
                        successCallback();
                    },
                    function(err) {
                        that.handleSmartStoreError("removeItem", "removeFromSoup", err, errorCallback);
                    });
            },
            function(err) {
                that.handleSmartStoreError("removeItem", "querySoup", err, errorCallback);
            });
    },
    errorCallback);
};

// clear
// optional successCallback and errorCallback
// calls setup
//1. remove Soup
//2. register Soup
SmartStoreAdapter.prototype.clear = function(successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        successCallback = function(){};
    }
    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }
    var that = this;

    this.setup(
        function(){
            that.setSize(0);
            // the plan is to remove the soup then register it again
            that._smartstore["removeSoup"](
                that.SOUP_NAME, 
                function(){
                    that.registerSoup(
                        successCallback, 
                        function(err) {
                            // a failure on registerSoup puts the storage in a weird
                            // state where we have no soup to write to
                            that.clearRegisterSoupFailed = true;
                            that.handleSmartStoreError("clear", "registerSoup", err, errorCallback);
                        });
                },
                function(err) {
                    that.handleSmartStoreError("clear", "removeSoup", err, errorCallback);
                });
        },
        errorCallback);
};

// getExpired
// required successCallback, optional errorCallback
// query soup for items older than now and return our keys
// calls setup
// Note that any caller that also wants to remove the items will have to get the smartstore internal id for each item in order to delete
// Which is what removeItem does
SmartStoreAdapter.prototype.getExpired = function(successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        throw new Error("No successCallback passed to getExpired");
    }

    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }

    var that = this;
    this.setup(function(){
        that._logger("getExpired");
        var now = new Date().getTime();
        var querySpec = that._smartstore["buildRangeQuerySpec"](that.SOUP_VALUE + "." + that.SOUP_EXPIRES, 0, now, null, that.QUERY_PAGE_SIZE);
        that._smartstore["querySoup"](
            that.SOUP_NAME,
            querySpec,
            function(cursor) {
                var cursorIterator = new SmartStoreCursorIterator(that._smartstore, cursor);
                var expired = [];
                cursorIterator.iterateAll(
                    function(item){
                        // on each iteration, add the key to the expired items
                        expired.push(that.unsanitizeKey(item[that.SOUP_KEY]));
                    },
                    function(){
                        // when done, return the expired items
                        successCallback(expired);
                    },
                    function(err){
                        that.handleSmartStoreError("getExpired", "moveCursorToNextPage", err, errorCallback);
                    },
                    true);
            },
            function(err) {
                that.handleSmartStoreError("getExpired", "querySoup", err, errorCallback);
            });
    },
    errorCallback);
};

//Internals

SmartStoreAdapter.prototype.setSize = function(size) {
    this._currentSize = size;
    return this._currentSize;
};

SmartStoreAdapter.prototype.incrementSize = function(size){
    return this.setSize(this.getSize() + size);
};

//Setup requires success and error callbacks

SmartStoreAdapter.prototype.setup = function(successCallback, errorCallback) {
    if ($A.util.isUndefinedOrNull(successCallback)) {
        throw new Error("SmartStoreAdapter setup called without successCallback.");
    }
    if ($A.util.isUndefinedOrNull(errorCallback)) {
        throw new Error("SmartStoreAdapter setup called without errorCallback.");
    }

    var that = this;
    if(this.clearRegisterSoupFailed){
        // in a weird state where clear failed at just the wrong time
        errorCallback("SmartStoreAdapter was improperly cleared.");
        return;
    } else if(this.setupStage === this.SETUP_STAGE_COMPLETED){
        successCallback();
        return;
    } else if(this.setupStage === this.SETUP_STAGE_STARTED){
        // setup is in process.  reschedule this command for the future.
        // TODO: We have to determine a proper timeout value.
        setTimeout(function() {
            that.setup(successCallback, errorCallback);
        }, 0);
        return;
    } else if(this.setupStage === this.SETUP_STAGE_ERROR){
        errorCallback("SmartStoreAdapter was not properly initialized.");
        return;
    }
    // else we are this.setupStage === this.SETUP_STAGE_NOT_STARTED
    this.setupStage = this.SETUP_STAGE_STARTED;

    /* Get a logger that we can reliably use.  
     * On device, the logger can go to the apps (xcode or eclipse) native console
     */
    if (window.console && typeof console.log === "function"){
        // Alias the log per http://stackoverflow.com/questions/2653963/why-doesnt-javascript-function-aliasing-work
        // use apply to preserve context and invocations with multiple arguments
        // TODO determine better way of console.log that preserves the actual line #
        this._logger = function () { console.log.apply(console, arguments); };
    } else {
        this._logger = function(){ return; };
    }
    try {
        var tmplogger = cordova["require"]("salesforce/util/logger")["logToConsole"];
        tmplogger("Verifying this._logger in SmartStoreAdapter");
        this._logger = tmplogger;
    } catch(e) {    
    }

    /* Initialize the smartstore function to use the new cordova style of cordova.require if available
     * fallback to using the older cordova style of navigator.smartstore style that is supported by smartstore
     */
    this._smartstore = navigator["smartstore"];
    try {
        this._smartstore = cordova["require"]("salesforce/plugin/smartstore");
    } catch(e2) {
    }
    this._logger("SmartStoreAdapter setup()");

    // TODO figure out correct sizing for smartstore
    this.setSize(0);
    this.registerSoup(
        function(){
            that.setupStage = that.SETUP_STAGE_COMPLETED;
            successCallback();
        },
        function(err){
            that.setupStage = that.SETUP_STAGE_ERROR;
            errorCallback("Error during SmartStoreAdapter initialization. Error on registerSoup: " + err);
        });
};

//Register a soup
//callbacks are optional as this is called internally
SmartStoreAdapter.prototype.registerSoup = function (successCallback, errorCallback) {  
    var indexes = [ {path:this.SOUP_KEY, type:"string"},
                    {path:this.SOUP_VALUE, type:"string"},
                    {path:this.SOUP_VALUE + "." + this.SOUP_EXPIRES, type:"integer"}];
    var that = this;
    this._smartstore["registerSoup"](
        this.SOUP_NAME,
        indexes,
        function(param) {
            that._logger("Success on registerSoup:" + param);
            successCallback();
        },
        function(err) {
            errorCallback(err);
        });
};

//
//querySoupForItem
//queries soup for an andividual item returning first matching item in case there's some strange reason for multiple items
//

SmartStoreAdapter.prototype.querySoupForItem = function(key, successCallback, errorCallback) {
    var sanitizedKey = this.sanitizeKey(key);
    this._logger("querySoupForItem() key = " + sanitizedKey);

    var querySpec = this._smartstore["buildExactQuerySpec"](this.SOUP_KEY, sanitizedKey, 1);
    var that = this;
    this._smartstore["querySoup"](this.SOUP_NAME,querySpec,
        function(cursor){ 
            var cursorIterator = new SmartStoreCursorIterator(that._smartstore, cursor);
            var itemToReturn;
            cursorIterator.iterateAll(
                function(item){
                    // if there was an item, we will return it
                    itemToReturn = item;
                },
                function(){
                    // when done, return the item.  Note that itemToReturn might be undefined if
                    // no items were found.
                    successCallback(itemToReturn);
                },
                function(err){
                    that.handleSmartStoreError("querySoupForItem", "moveCursorToNextPage", err, errorCallback);
                },
                true);
    },
    function(err){ 
        errorCallback(err);
    });
};

//Sanitize the key for sqllite.  It doesn't like :.{$/ and a few more.
//escape is typically frowned on but our scenario is escaping an aura action key, which is
//a URI + JSON body.  
SmartStoreAdapter.prototype.sanitizeKey = function(key) {
    return escape(key).replace(/[\.]/g,"%2e");
};

//Unsanitize the key from sqllite.
SmartStoreAdapter.prototype.unsanitizeKey = function(key) {
  return unescape(key.replace(/%2e/g,"."));
};


/**
 * A suboptimal, asynchronous, test-only means of getting the number of items in the store.
 */
SmartStoreAdapter.prototype.getNumItems = function(successCallback, errorCallback) {
    if($A.util.isUndefinedOrNull(successCallback)) {
        throw new Error("No successCallback passed to getNumItems");
    }
    if($A.util.isUndefinedOrNull(errorCallback)) {
        errorCallback = function(){};
    }
    var that = this;
    this.setup(
        function(){
            var querySpec = that._smartstore["buildLikeQuerySpec"](that.SOUP_KEY, "%", null, that.QUERY_PAGE_SIZE);
                that._smartstore["querySoup"](
                    that.SOUP_NAME,
                    querySpec,
                    function(cursor) {
                        var cursorIterator = new SmartStoreCursorIterator(that._smartstore, cursor);
                        var numItems = 0;
                        cursorIterator.iterateAll(
                            function(){
                                // on each iteration, increment the count
                                numItems++;
                            },
                            function(){
                                // when done, return the count
                                successCallback(numItems);
                            },
                            function(err){
                                that.handleSmartStoreError("getNumItems", "moveCursorToNextPage", err, errorCallback);
                            },
                            true);
                    },
                    function(err) {
                        that.handleSmartStoreError("getNumItems", "querySoup", err, errorCallback);
                    });
            },
            errorCallback);
};

SmartStoreAdapter.prototype.handleSmartStoreError = function(adapterOperationName, smartStoreOperationName, err, errorCallback){
    var callbackMessage = "Error in " + adapterOperationName + " on call to SmartStore." + smartStoreOperationName + ": " + err;
    this._logger(callbackMessage);
    errorCallback(callbackMessage);
};

//#include aura.storage.adapters.SmartStoreAdapter_export

var smartStoreAvailable = true;
try {
    cordova["require"]("salesforce/plugin/smartstore");
} catch (cordovaRequireErr) {
    smartStoreAvailable = false;
}
try {
    if(smartStoreAvailable){
	$A.storageService.registerAdapter({ 
	    "name": SmartStoreAdapter.NAME, 
	    "adapterClass": SmartStoreAdapter,
	    "persistent": true,
	    "secure": true
	});
    }
} catch(auraErr) {
}
