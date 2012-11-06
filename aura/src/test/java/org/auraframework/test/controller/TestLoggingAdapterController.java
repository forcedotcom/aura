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
package org.auraframework.test.controller;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.test.adapter.TestLoggingAdapter;

@Controller
public class TestLoggingAdapterController {

    @AuraEnabled
    public static void beginCapture() {
        LoggingAdapter adapter = Aura.get(LoggingAdapter.class);
        if(!(adapter instanceof TestLoggingAdapter)){
            throw new Error("TestLoggingAdapter not configured!");
        }
        ((TestLoggingAdapter)adapter).clear();
        ((TestLoggingAdapter)adapter).beginCapture();
    }

    @AuraEnabled
    public static List<Map<String, Object>> endCapture() {
        LoggingAdapter adapter = Aura.get(LoggingAdapter.class);
        if(!(adapter instanceof TestLoggingAdapter)){
            throw new Error("TestLoggingAdapter not configured!");
        }
        ((TestLoggingAdapter)adapter).endCapture();
        return ((TestLoggingAdapter)adapter).getLogs();
    }
}
