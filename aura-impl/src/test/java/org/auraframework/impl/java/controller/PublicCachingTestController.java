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
package org.auraframework.impl.java.controller;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Annotations.PublicCachingEnabled;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

@ServiceComponent
public class PublicCachingTestController implements Controller {

    @AuraEnabled
    public static void executeWithoutPublicCaching() {}

    @AuraEnabled
    @PublicCachingEnabled(expiration = 10)
    public static void executeWithPublicCaching() {}

    @AuraEnabled
    public static CallCounter executeInForegroundWithReturn(@Key("i")int i) {
        return new CallCounter(i);
    }

    @AuraEnabled
    @PublicCachingEnabled(expiration = 100)
    public static CallCounter executeWithPublicCachingWithReturn(@Key("i") int i) {
        return new CallCounter(i);
    }

    @AuraEnabled
    @PublicCachingEnabled(expiration = 100)
    public static CallCounter executeWithPublicCachingWithException(@Key("i") int i) {
        throw new RuntimeException("Action failed!");
    }
    
	// needs to be final in order to ensure visibility to other threads (since
	// requests are expected to be handled by multiple threads).
	// needs to be AtomicInteger in order to ensure that the count is to other
	// threads when updated concurrently.
    private static final AtomicInteger callCount = new AtomicInteger();

    /**
     * Object to represent return value for controller.
     * Copied from ParallelActionTestController
     */
    static class CallCounter implements JsonSerializable {
        Integer id;
        Integer currentCallCount;

        CallCounter(Integer id) {
            this.currentCallCount = new Integer(callCount.incrementAndGet());
            this.id = id;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("id", id);
            json.writeMapEntry("callCount", currentCallCount);
            json.writeMapEnd();
        }
    } 
}
