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
var p = SmartStoreAdapter.prototype;
exp(p
    // Some magic is already exposing some SmartStoreAdapter methods.  Expose the rest for testing purposes.
    //#if {"excludeModes" : ["PRODUCTION"]}
        ,
        "getExpired", p.getExpired,
        "getNumItems", p.getNumItems,
        "getSize", p.getSize,
        "QUERY_PAGE_SIZE", p.QUERY_PAGE_SIZE
    //#end
);
