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
package org.auraframework.util.test.perf.rdp;

import java.util.Map;

import org.json.JSONException;

//Immutable Java bean to serialize/deserialize trace event params json object
//This must exactly match the json keyset
// eg:
/* "params": {
			"args": {
				"data": {
					"documents": 1,
					"jsEventListeners": 0,
					"jsHeapSizeUsed": 814384,
					"nodes": 1
				}
			},
			"cat": "disabled-by-default-devtools.timeline",
			"name": "UpdateCounters",
			"ph": "I",
			"pid": 79023,
			"s": "g",
			"tid": 1299,
			"ts": 1019120543129.0,
			"tts": 103016
}
 */

public class TraceEvent {
    Map<String, Object> args;
    String cat;
    private String name;
    String ph;
    Long dur;
    Integer tdur;
    Integer pid;
    String s;
    Integer tid;
    Long ts;
    Long tts;

    public enum Type {
        Duration, Complete, Instant, Unsupported
    }

    public String getName(){
        return name;
    }

    public String getPhase(){
        return ph;
    }

    public Long getDuration(){
        return dur;
    }

    public Long getTimeStamp(){
        return ts;
    }

    public Map<String, Object> getArgs(){
        return args;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getData() throws JSONException{
        return (Map<String, Object>) getArgs().get("data");
    }

    /*public Long getJsHeapSizeUsed() throws JSONException{
		return getData().get("jsHeapSizeUsed");
	}

	public long getJsEventListeners() throws JSONException{
		return getData().get("jsEventListeners");
	}

	public long getDocuments() throws JSONException{
		return getData().getLong("documents");
	}

	public long getNodes() throws JSONException{
		return getData().getLong("nodes");
	}*/

    public Type getType(){
        String phase = getPhase();

        if(phase.equals("B") || phase.equals("E"))
            return Type.Duration;
        else if(phase.equals("X"))
            return Type.Complete;
        else if(phase.equals("I"))
            return Type.Instant;
        else
            return Type.Unsupported;

    }
}
