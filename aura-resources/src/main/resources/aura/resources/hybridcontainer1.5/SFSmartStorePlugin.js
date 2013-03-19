/*
 * Copyright (c) 2012, salesforce.com, inc.
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

cordova.define("salesforce/plugin/smartstore", function (require, exports, module) {
    // Version this js was shipped with
    var SDK_VERSION = "1.5";

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
     * SoupQuerySpec constructor
     */
    var SoupQuerySpec = function (path) {
    //the kind of query, one of: "exact","range", or "like":
    //"exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey
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

        //"ascending" or "descending" : optional
        this.order = "ascending";

        //the number of entries to copy from native to javascript per each cursor page
        this.pageSize = 10;
    };

    /**
     * PagedSoupCursor constructor
     */
    var PagedSoupCursor = function () {
        //the soup name from which this cursor was generated
        this.soupName = null;
        //a unique identifier for this cursor, used by plugin
        this.cursorId = null;
        //the query spec that generated this cursor
        this.querySpec = null;
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
    // Returns a cursor that will page through all soup entries in order by the given path value
    // Internally it simply does a range query with null begin and end keys
    var buildAllQuerySpec = function (path, order, pageSize) {
        var inst = new SoupQuerySpec(path);
        inst.queryType = "range";
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a cursor that will page all entries exactly matching the matchKey value for path
    var buildExactQuerySpec = function (path, matchKey, pageSize) {
        var inst = new SoupQuerySpec(path);
        inst.matchKey = matchKey;
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a cursor that will page all entries in the range beginKey ...endKey for path
    var buildRangeQuerySpec = function (path, beginKey, endKey, order, pageSize) {
        var inst = new SoupQuerySpec(path);
        inst.queryType = "range";
        inst.beginKey = beginKey;
        inst.endKey = endKey;
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // Returns a cursor that will page all entries matching the given likeKey value for path
    var buildLikeQuerySpec = function (path, likeKey, order, pageSize) {
        var inst = new SoupQuerySpec(path);
        inst.queryType = "like";
        inst.likeKey = likeKey;
        if (order) { inst.order = order; } // override default only if a value was specified
        if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
        return inst;
    };

    // ====== Soup manipulation ======
    var registerSoup = function (soupName, indexSpecs, successCB, errorCB) {
        console.log("SmartStore.registerSoup: '" + soupName + "' indexSpecs: " + indexSpecs);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRegisterSoup",
             [{"soupName": soupName, "indexes": indexSpecs}]
            );
    };

    var removeSoup = function (soupName, successCB, errorCB) {
        console.log("SmartStore.removeSoup: " + soupName);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRemoveSoup",
             [{"soupName": soupName}]
            );
    };

    var soupExists = function (soupName, successCB, errorCB) {
        console.log("SmartStore.soupExists: " + soupName);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgSoupExists",
             [{"soupName": soupName}]
            );
    };

    var querySoup = function (soupName, querySpec, successCB, errorCB) {
        console.log("SmartStore.querySoup: '" + soupName + "' indexPath: " + querySpec.indexPath);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgQuerySoup",
             [{"soupName": soupName, "querySpec": querySpec}]
            );
    };

    var retrieveSoupEntries = function (soupName, entryIds, successCB, errorCB) {
        if (logLevel > 0) {
            console.log("SmartStore.retrieveSoupEntry: '" + soupName + "' entryIds: " + entryIds);
        }
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
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
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgUpsertSoupEntries", 
             [{"soupName": soupName, "entries": entries, "externalIdPath": externalIdPath}]
            );
    };

    var removeFromSoup = function (soupName, entryIds, successCB, errorCB) {
        console.log("SmartStore.removeFromSoup: '" + soupName + "' entryIds: " + entryIds);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
             "pgRemoveFromSoup",
             [{"soupName": soupName, "entryIds": entryIds}]
            );
    };

    //====== Cursor manipulation ======
    var moveCursorToPageIndex = function (cursor, newPageIndex, successCB, errorCB) {
        console.log("moveCursorToPageIndex: " + cursor.cursorId + "  newPageIndex: " + newPageIndex);
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
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
        exec(SDK_VERSION, successCB, errorCB, SERVICE,
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
        registerSoup: registerSoup,
        removeSoup: removeSoup,
        soupExists: soupExists,
        querySoup: querySoup,
        retrieveSoupEntries: retrieveSoupEntries,
        upsertSoupEntries: upsertSoupEntries,
        upsertSoupEntriesWithExternalId: upsertSoupEntriesWithExternalId,
        removeFromSoup: removeFromSoup,
        moveCursorToPageIndex: moveCursorToPageIndex,
        moveCursorToNextPage: moveCursorToNextPage,
        moveCursorToPreviousPage: moveCursorToPreviousPage,
        closeCursor: closeCursor,
        
        // Constructors
        SoupQuerySpec: SoupQuerySpec,
        SoupIndexSpec: SoupIndexSpec,
        PagedSoupCursor: PagedSoupCursor
    };
});

// For backward compatibility
navigator.smartstore = cordova.require("salesforce/plugin/smartstore");
var SoupIndexSpec = navigator.smartstore.SoupIndexSpec;
var SoupQuerySpec = navigator.smartstore.SoupQuerySpec;
var PagedSoupCursor = navigator.smartstore.PagedSoupCursor;

