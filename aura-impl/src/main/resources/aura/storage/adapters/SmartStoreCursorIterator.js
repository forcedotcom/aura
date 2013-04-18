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
/*jslint sub: true */
/**
 * @namespace Provides iteration over elements in a SmartStore cursor, hiding paging and stuff like that.
 * @constructor
 */
var SmartStoreCursorIterator = function SmartStoreCursorIterator(smartstore, cursor){
    this._smartstore = smartstore;
    this._cursor = cursor;
    this._indexInCurrentPage = 0;
    this._end = false;
};

/**
 * Iterate over a single element in the iterator, if that element exists.
 */
SmartStoreCursorIterator.prototype.iterateOne = function(itemFunction, successCallback, errorCallback, closeCursor){
    var that = this;
    this._next(
            function(nextItem){
                // on hasNext, close the cursor, invoke the itemFunction, and return to the successCallback
                if(closeCursor){ 
                    that._smartstore["closeCursor"](that._cursor);
                }
                itemFunction(nextItem);
                successCallback();
            },
            function(){
                // on dontHaveNext (it means there were no items at all), close the cursor and return to the caller
                if(closeCursor){ 
                    that._smartstore["closeCursor"](that._cursor);
                }
                successCallback();
            },
            function(err){
                // on error, close the cursor and return an error to the caller
                if(closeCursor){ 
                    that._smartstore["closeCursor"](that._cursor);
                }
                errorCallback(err);
            });
};

/**
 * Iterate over all elements in the iterator.
 */
SmartStoreCursorIterator.prototype.iterateAll = function(itemFunction, successCallback, errorCallback, closeCursor){
    var that = this;
    this._next(
            function(nextItem){
                // on hasNext, invoke the itemFunction and iterate again
                itemFunction(nextItem);
                that.iterateAll(itemFunction, successCallback, errorCallback);
            },
            function(){
                // on dontHaveNext, close the cursor and return to the caller
                if(closeCursor){ 
                    that._smartstore["closeCursor"](that._cursor);
                }
                successCallback();
            },
            function(err){
                // on error, close the cursor and return an error to the caller
                if(closeCursor){ 
                    that._smartstore["closeCursor"](that._cursor);
                }
                errorCallback(err);
            });
};

/**
 * Determine if there is another element in the array and, if so, invoke hasNext() on it.
 */
SmartStoreCursorIterator.prototype._next = function(hasNext, doesNotHaveNext, errorCallback) {
    if(this._end === true){
        // it has been previously determined that there are no more elements.  
        // This should never happen if the iterator is being used correctly.
        throw new Error("Too many calls to next");
    } else if(this._indexInCurrentPage < this._cursor["currentPageOrderedEntries"].length){
        // the next item is in the current page
        hasNext(this._cursor["currentPageOrderedEntries"][this._indexInCurrentPage++]);
    } else if(this._cursor["currentPageIndex"] < this._cursor["totalPages"] - 1){
        // have reached the end of the current page.  there is another.
        this._indexInCurrentPage = 0;
        var that = this;
        this._smartstore["moveCursorToNextPage"](
            this._cursor,
            function(){
                // moved to the next page, continue with iteration
                that._next(hasNext, doesNotHaveNext, errorCallback);
            },
            errorCallback);
    } else {
        // there are no more elements to return
        this._end = true;
        doesNotHaveNext();
    }
};