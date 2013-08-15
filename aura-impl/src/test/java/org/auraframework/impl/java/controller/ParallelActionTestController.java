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

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.BackgroundAction;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

@Controller
public class ParallelActionTestController {

	
	@AuraEnabled
	public static void executeInForeground() {
		
	}

    @AuraEnabled
    public static Record errorInForeground() {
        int foo[] = new int[2];
        // Throw our error:
        foo[42] = 42;
        return null;
    }

	@AuraEnabled
	@BackgroundAction
	public static void executeInBackground() {
		
	}
	
	@AuraEnabled
	public static Record executeInForegroundWithReturn(@Key("i")int i) {
		return new Record(i);
	}
	
	@AuraEnabled
	@BackgroundAction
	public static Record executeInBackgroundWithReturn(@Key("i")int i) {
		return new Record(i);
	}
	
    /**
     * Object to represent return value for controller.
     */
    static class Record implements JsonSerializable {
        Integer counterValue;

        Record(Integer counter) {
            this.counterValue = counter;
        }

        public Integer getCounterValue() {
            return counterValue;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("Counter", getCounterValue());
            json.writeMapEnd();
        }
    }
}
