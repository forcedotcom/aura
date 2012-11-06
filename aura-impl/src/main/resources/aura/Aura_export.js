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
var p = Aura.prototype;
exp(p,
    "initAsync", p.initAsync,
    "initConfig", p.initConfig,
    "init", p.init,
    "initPriv", p.initPriv,
    "finishInit", p.finishInit,
    "error", p.error,
    "message", p.message,
    "get", p.get,
    "getRoot", p.getRoot,
    "getContext", p.getContext,
    "unwrap", p.unwrap,
    "assert", p.assert,
    "userAssert", p.userAssert,
    "log", p.log,
    "logf", p.logf,
    "trace", p.trace,
    "mark", p.mark,
    "measure", p.measure,
    "logLevel", p.logLevel,
    "fitTo", p.fitTo
    //#if {"excludeModes" : ["PRODUCTION"]}
        ,
        "devToolService", p.devToolService,
        "q", p.q,
        "qhelp", p.qhelp
    //#end

);
