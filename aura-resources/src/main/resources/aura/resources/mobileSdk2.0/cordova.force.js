/*
 * Copyright (c) 2012-13, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

// Version this js was shipped with
var SALESFORCE_MOBILE_SDK_VERSION = "2.0.0";

/**
 * Utilify functions for logging
 */
cordova.define("salesforce/util/logger", function(require, exports, module) {
    var appStartTime = (new Date()).getTime();  // Used for debug timing measurements.

    /**
     * Logs text to a given section of the page.
     *   section - id of HTML section to log to.
     *   txt - The text (html) to log.
     */
    var log = function(section, txt) {
        console.log("jslog: " + txt);
        if ((typeof debugMode !== "undefined") && (debugMode === true)) {
            var now = new Date();
            var fullTxt = "<p><i><b>* At " + (now.getTime() - appStartTime) + "ms:</b></i> " + txt + "</p>";
            var sectionElt = document.getElementById(section);
            if (sectionElt) {
                sectionElt.style.display = "block";
                document.getElementById(section).innerHTML += fullTxt;
            }
        }
    };

    /**
     * Logs debug messages to a "debug console" section of the page.  Only
     * shows when debugMode (above) is set to true.
     *   txt - The text (html) to log to the console.
     */
    var logToConsole = function(txt) {
        log("console", txt);
    };

    /**
     * Use to log error messages to an "error console" section of the page.
     *   txt - The text (html) to log to the console.
     */
    var logError = function(txt) {
        log("errors", txt);
    };

    /**
     * Sanitizes a URL for logging, based on an array of querystring parameters whose
     * values should be sanitized.  The value of each querystring parameter, if found
     * in the URL, will be changed to '[redacted]'.  Useful for getting rid of secure
     * data on the querystring, so it doesn't get persisted in an app log for instance.
     *
     * origUrl            - Required - The URL to sanitize.
     * sanitizeParamArray - Required - An array of querystring parameters whose values
     *                                 should be sanitized.
     * Returns: The sanitzed URL.
     */
    var sanitizeUrlParamsForLogging = function(origUrl, sanitizeParamArray) {
        var trimmedOrigUrl = origUrl.trim();
        if (trimmedOrigUrl === '')
            return trimmedOrigUrl;
        
        if ((typeof sanitizeParamArray !== "object") || (sanitizeParamArray.length === 0))
            return trimmedOrigUrl;
        
        var redactedUrl = trimmedOrigUrl;
        for (var i = 0; i < sanitizeParamArray.length; i++) {
            var paramRedactRegexString = "^(.*[\\?&]" + sanitizeParamArray[i] + "=)([^&]+)(.*)$";
            var paramRedactRegex = new RegExp(paramRedactRegexString, "i");
            if (paramRedactRegex.test(redactedUrl))
                redactedUrl = redactedUrl.replace(paramRedactRegex, "$1[redacted]$3");
        }
        
        return redactedUrl;
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        logToConsole: logToConsole,
        logError: logError,
        sanitizeUrlParamsForLogging: sanitizeUrlParamsForLogging
    };
});

cordova.define("salesforce/util/event", function(require, exports, module) {

    var logger = require("salesforce/util/logger");

    /**
     * Enumeration of event types.
     */
    var EventType = {
        AUTHENTICATING: {code: 0, description: "Authenticating...", isError: false},
        STARTING: {code: 1, description: "Loading application", isError: false},
        OFFLINE: {code: 2, description: "Your device is offline. Can't continue.", isError: true}
    };
           
    /**
     * Dispatches event with current status text and success indicator.
     */
    var sendStatusEvent = function(statusEvent) {
        if (statusEvent.isError) {
            logger.logError(statusEvent.description);
        } else {
            logger.logToConsole(statusEvent.description);
        }
        cordova.fireDocumentEvent('bootstrapStatusEvent', statusEvent);
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        EventType: EventType,
        sendStatusEvent: sendStatusEvent
    };
});

/**
 * Utility functions used at startup 
 */
cordova.define("salesforce/util/bootstrap", function(require, exports, module) {

    var logger = require("salesforce/util/logger");

    /**
     * Determine whether the device is online.
     */
    var deviceIsOnline = function() {
        var connType;
        if (navigator && navigator.connection) {
            connType = navigator.connection.type;
            logger.logToConsole("deviceIsOnline connType: " + connType);
        } else {
            logger.logToConsole("deviceIsOnline connType is undefined.");
        }
        
        if (typeof connType !== 'undefined') {
            // Cordova's connection object.  May be more accurate?
            return (connType != null && connType != Connection.NONE && connType != Connection.UNKNOWN);
        } else {
            // Default to browser facility.
    	    return navigator.onLine;
        }
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        deviceIsOnline: deviceIsOnline
    };
});

/**
 * Helper function used to call the native side
 */
cordova.define("salesforce/util/exec", function(require, exports, module) {
    var exec = function(pluginVersion, successCB, errorCB, service, action, args) {
        var defaultSuccessCB = function() {
            console.log(service + ":" + action + " succeeded");
        };
        var defaultErrorCB = function() {
            console.error(service + ":" + action + " failed");
        };
        successCB = typeof successCB !== "function" ? defaultSuccessCB : successCB;
        error = typeof errorCB !== "function" ? defaultErrorCB : errorCB;
        args.unshift("pluginSDKVersion:" + pluginVersion);
        var cordovaExec = require('cordova/exec');
        return cordovaExec(successCB, errorCB, service, action, args);                  
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        exec: exec
    };
});

cordova.define("salesforce/plugin/sdkinfo", function(require, exports, module) {
    var SERVICE = "com.salesforce.sdkinfo";

    var exec = require("salesforce/util/exec").exec;

    /**
      * SDKInfo data structure
      */
    var SDKInfo = function(sdkVersion, forcePluginsAvailable, appName, appVersion) {
        this.sdkVersion = sdkVersion;
        this.forcePluginsAvailable = forcePluginsAvailable;
        this.appName = appName;
        this.appVersion = appVersion;
    };

    /**
     * Returns a populated SDKInfo object (via a callback)
     */
    var getInfo = function(successCB, errorCB) {
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE, "getInfo", []);
    };


    /**
     * Part of the module that is public
     */
    module.exports = {
        getInfo: getInfo,

        // Constructor
        SDKInfo: SDKInfo
    };
});

// For backward compatibility
var SFHybridApp = {
    logToConsole: cordova.require("salesforce/util/logger").logToConsole,
    logError: cordova.require("salesforce/util/logger").logError
};

cordova.define("salesforce/plugin/oauth", function (require, exports, module) {
    var SERVICE = "com.salesforce.oauth";

    var exec = require("salesforce/util/exec").exec;

    /**
     * Whether or not logout has already been initiated.  Can only be initiated once
     * per page load.
     */
    var logoutInitiated = false;
 
	/**
	 * Obtain authentication credentials, calling 'authenticate' only if necessary.
	 * Most index.html authors can simply use this method to obtain auth credentials
	 * after onDeviceReady.
     *   success - The success callback function to use.
     *   fail    - The failure/error callback function to use.
	 * cordova returns a dictionary with:
	 *     accessToken
	 *     refreshToken
     *  clientId
	 *     userId
	 *     orgId
     *  loginUrl
	 *     instanceUrl
	 *     userAgent
	 */
    var getAuthCredentials = function (success, fail) {
        exec(SALESFORCE_MOBILE_SDK_VERSION, success, fail, SERVICE, "getAuthCredentials", []);
    };
 
    /**
     * Initiates the authentication process, with the given app configuration.
     *   success         - The success callback function to use.
     *   fail            - The failure/error callback function to use.
     * cordova returns a dictionary with:
     *   accessToken
     *   refreshToken
     *   clientId
     *   userId
     *   orgId
     *   loginUrl
     *   instanceUrl
     *   userAgent
     */
    var authenticate = function (success, fail) {
        exec(SALESFORCE_MOBILE_SDK_VERSION, success, fail, SERVICE, "authenticate", []);
    };

    /**
     * Logout the current authenticated user. This removes any current valid session token
     * as well as any OAuth refresh token.  The user is forced to login again.
     * This method does not call back with a success or failure callback, as 
     * (1) this method must not fail and (2) in the success case, the current user
     * will be logged out and asked to re-authenticate.  Note also that this method can only
     * be called once per page load.  Initiating logout will ultimately redirect away from
     * the given page (effectively resetting the logout flag), and calling this method again
     * while it's currently processing will result in app state issues.
     */
    var logout = function () {
        if (!logoutInitiated) {
            logoutInitiated = true;
            exec(SALESFORCE_MOBILE_SDK_VERSION, null, null, SERVICE, "logoutCurrentUser", []);
        }
    };
 
    /**
     * Gets the app's homepage as an absolute URL.  Used for attempting to load any cached
     * content that the developer may have built into the app (via HTML5 caching).
     *
     * This method will either return the URL as a string, or an empty string if the URL has not been
     * initialized.
     */
    var getAppHomeUrl = function (success) {
        exec(SALESFORCE_MOBILE_SDK_VERSION, success, null, SERVICE, "getAppHomeUrl", []);
    };

    /**
     * Goes through the refresh flow, and sets the new session token in the supplied forcetkClient.
     */
    var forcetkRefresh = function (forcetkClient, success, fail) {
        authenticate(function(oauthResponse) {
            var oauthResponseData = oauthResponse;
            if (oauthResponse.data)  {
                oauthResponseData = oauthResponse.data;
            }
            forcetkClient.setSessionToken(oauthResponseData.accessToken, null, oauthResponseData.instanceUrl);
            success();
        },
        error);
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        getAuthCredentials: getAuthCredentials,
        authenticate: authenticate,
        logout: logout,
        getAppHomeUrl: getAppHomeUrl,
        forcetkRefresh: forcetkRefresh
    };
});

// For backward compatibility
var SalesforceOAuthPlugin = cordova.require("salesforce/plugin/oauth");

cordova.define("salesforce/plugin/smartstore", function (require, exports, module) {
    var SERVICE = "com.salesforce.smartstore";

    var exec = require("salesforce/util/exec").exec;


    /**
     * SoupIndexSpec consturctor
     */
    var SoupIndexSpec = function (path, type) {
        this.path = path;
        this.type = type;
    };

    /**
     * QuerySpec constructor
     */
    var QuerySpec = function (path) {
	    // the kind of query, one of: "exact","range", "like" or "smart":
	    // "exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey, "smart" uses smartSql
	    this.queryType = "exact";

        //path for the original IndexSpec you wish to use for search: may be a compound path eg Account.Owner.Name
        this.indexPath = path;

        //for queryType "exact"
        this.matchKey = null;

        //for queryType "like"
        this.likeKey = null;
        
        //for queryType "range"
        //the value at which query results may begin
        this.beginKey = null;
        //the value at which query results may end
        this.endKey = null;

        // for queryType "smart"
        this.smartSql = null;

        //"ascending" or "descending" : optional
        this.order = "ascending";

        //the number of entries to copy from native to javascript per each cursor page
        this.pageSize = 10;
    };
    
    /**
     * StoreCursor constructor
     */
    var StoreCursor = function () {
        //a unique identifier for this cursor, used by plugin
        this.cursorId = null;
        //the maximum number of entries returned per page 
        this.pageSize = 0;
        //the total number of pages of results available
        this.totalPages = 0;
        //the current page index among all the pages available
        this.currentPageIndex = 0;
        //the list of current page entries, ordered as requested in the querySpec
        this.currentPageOrderedEntries = null;
    };
    
    // ====== Logging support ======
    var logLevel = 0;
    var setLogLevel = function (l) {
        logLevel = l;
    };

    var getLogLevel = function () {
        return logLevel;
    };


    // ====== querySpec factory methods
    // Returns a query spec that will page through all soup entries in order by the given path value
    // Internally it simply does a range query with null begin and end keys
    var buildAllQuerySpec = function (path, order, pageSize) {
        var inst = new QuerySpec(path);
        inst.queryType = "range";
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a query spec that will page all entries exactly matching the matchKey value for path
    var buildExactQuerySpec = function (path, matchKey, pageSize) {
        var inst = new QuerySpec(path);
        inst.matchKey = matchKey;
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a query spec that will page all entries in the range beginKey ...endKey for path
    var buildRangeQuerySpec = function (path, beginKey, endKey, order, pageSize) {
        var inst = new QuerySpec(path);
        inst.queryType = "range";
        inst.beginKey = beginKey;
        inst.endKey = endKey;
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a query spec that will page all entries matching the given likeKey value for path
    var buildLikeQuerySpec = function (path, likeKey, order, pageSize) {
        var inst = new QuerySpec(path);
        inst.queryType = "like";
        inst.likeKey = likeKey;
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a query spec that will page all results returned by smartSql
    var buildSmartQuerySpec = function (smartSql, pageSize) {
        var inst = new QuerySpec();
        inst.queryType = "smart";
        inst.smartSql = smartSql;
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };
    
    // ====== Soup manipulation ======
    var registerSoup = function (soupName, indexSpecs, successCB, errorCB) {
        console.log("SmartStore.registerSoup: '" + soupName + "' indexSpecs: " + JSON.stringify(indexSpecs));
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRegisterSoup",
             [{"soupName": soupName, "indexes": indexSpecs}]
            );
    };

    var removeSoup = function (soupName, successCB, errorCB) {
        console.log("SmartStore.removeSoup: " + soupName);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRemoveSoup",
             [{"soupName": soupName}]
            );
    };

    var soupExists = function (soupName, successCB, errorCB) {
        console.log("SmartStore.soupExists: " + soupName);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgSoupExists",
             [{"soupName": soupName}]
            );
    };

    var querySoup = function (soupName, querySpec, successCB, errorCB) {
        if (querySpec.queryType == "smart") throw new Error("Smart queries can only be run using runSmartQuery");
    	console.log("SmartStore.querySoup: '" + soupName + "' indexPath: " + querySpec.indexPath);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgQuerySoup",
             [{"soupName": soupName, "querySpec": querySpec}]
            );
    };

    var runSmartQuery = function (querySpec, successCB, errorCB) {
        if (querySpec.queryType != "smart") throw new Error("runSmartQuery can only run smart queries");
    	console.log("SmartStore.runSmartQuery: smartSql: " + querySpec.smartSql);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRunSmartQuery",
             [{"querySpec": querySpec}]
            );
    };

    var retrieveSoupEntries = function (soupName, entryIds, successCB, errorCB) {
        if (logLevel > 0) {
            console.log("SmartStore.retrieveSoupEntry: '" + soupName + "' entryIds: " + entryIds);
        }
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRetrieveSoupEntries",
             [{"soupName": soupName, "entryIds": entryIds}]
            );
    };

    var upsertSoupEntries = function (soupName, entries, successCB, errorCB) {
        upsertSoupEntriesWithExternalId(soupName, entries, "_soupEntryId", successCB, errorCB);
    };

    var upsertSoupEntriesWithExternalId = function (soupName, entries, externalIdPath, successCB, errorCB) {
        if (logLevel > 0) { 
            console.log("SmartStore.upsertSoupEntries: '" + soupName + "' entries.length: " + entries.length);
        }
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgUpsertSoupEntries", 
             [{"soupName": soupName, "entries": entries, "externalIdPath": externalIdPath}]
            );
    };

    var removeFromSoup = function (soupName, entryIds, successCB, errorCB) {
        console.log("SmartStore.removeFromSoup: '" + soupName + "' entryIds: " + entryIds);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRemoveFromSoup",
             [{"soupName": soupName, "entryIds": entryIds}]
            );
    };

    //====== Cursor manipulation ======
    var moveCursorToPageIndex = function (cursor, newPageIndex, successCB, errorCB) {
        console.log("moveCursorToPageIndex: " + cursor.cursorId + "  newPageIndex: " + newPageIndex);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgMoveCursorToPageIndex",
             [{"cursorId": cursor.cursorId, "index": newPageIndex}]
            );
    };

    var moveCursorToNextPage = function (cursor, successCB, errorCB) {
        var newPageIndex = cursor.currentPageIndex + 1;
        if (newPageIndex >= cursor.totalPages) {
            errorCB(cursor, new Error("moveCursorToNextPage called while on last page"));
        }
        else {
            moveCursorToPageIndex(cursor, newPageIndex, successCB, errorCB);
        }
    };

    var moveCursorToPreviousPage = function (cursor, successCB, errorCB) {
        var newPageIndex = cursor.currentPageIndex - 1;
        if (newPageIndex < 0) {
            errorCB(cursor, new Error("moveCursorToPreviousPage called while on first page"));
        }
        else {
            moveCursorToPageIndex(cursor, newPageIndex, successCB, errorCB);
        }
    };

    var closeCursor = function (cursor, successCB, errorCB) {
        console.log("closeCursor: " + cursor.cursorId);
        exec(SALESFORCE_MOBILE_SDK_VERSION, successCB, errorCB, SERVICE,
             "pgCloseCursor",
             [{"cursorId": cursor.cursorId}]
            );
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        getLogLevel: getLogLevel,
        setLogLevel: setLogLevel,
        buildAllQuerySpec: buildAllQuerySpec,
        buildExactQuerySpec: buildExactQuerySpec,
        buildRangeQuerySpec: buildRangeQuerySpec,
        buildLikeQuerySpec: buildLikeQuerySpec,
        buildSmartQuerySpec: buildSmartQuerySpec,
        registerSoup: registerSoup,
        removeSoup: removeSoup,
        soupExists: soupExists,
        querySoup: querySoup,
        runSmartQuery: runSmartQuery,
        retrieveSoupEntries: retrieveSoupEntries,
        upsertSoupEntries: upsertSoupEntries,
        upsertSoupEntriesWithExternalId: upsertSoupEntriesWithExternalId,
        removeFromSoup: removeFromSoup,
        moveCursorToPageIndex: moveCursorToPageIndex,
        moveCursorToNextPage: moveCursorToNextPage,
        moveCursorToPreviousPage: moveCursorToPreviousPage,
        closeCursor: closeCursor,
        
        // Constructors
        QuerySpec: QuerySpec,
        SoupIndexSpec: SoupIndexSpec,
        StoreCursor: StoreCursor
    };
});

// For backward compatibility
navigator.smartstore = cordova.require("salesforce/plugin/smartstore");
var SoupIndexSpec = navigator.smartstore.SoupIndexSpec;
var QuerySpec = navigator.smartstore.QuerySpec;
var StoreCursor = navigator.smartstore.StoreCursor;
