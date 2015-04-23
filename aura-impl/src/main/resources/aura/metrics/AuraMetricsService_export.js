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
var p = MetricsService.prototype;

exp(p,
    "instrument"             , p.instrument,
    "unInstrument"           , p.unInstrument,
    "getBootstrapMetrics"    , p.getBootstrapMetrics,
    "registerBeacon"         , p.registerBeacon,
    "clearMarks"             , p.clearMarks,

    // plugin API
    "registerPlugin"         , p.registerPlugin,
    "disablePlugins"         , p.disablePlugins,
    "disablePlugin"          , p.disablePlugin,
    "enablePlugins"          , p.enablePlugins,
    "enablePlugin"           , p.enablePlugin,

    // mark API
    "mark"                   , p.markStamp,
    "markStart"              , p.markStart,
    "markEnd"                , p.markEnd,

    // transaction API
    "transaction"                  , p.transaction,
    "transactionStart"             , p.transactionStart,
    "transactionEnd"               , p.transactionEnd,
    "inTransaction"                , p.inTransaction,
    //#if {"excludeModes" : ["PRODUCTION"]}
    "getTransactions"              , p.getTransactions,
    "getTransaction"               , p.getTransaction,
    "setClearCompletedTransactions", p.setClearCompletedTransactions,
    //#end
    "onTransactionEnd"             , p.onTransactionEnd,
    "clearTransactions"            , p.clearTransactions
);
