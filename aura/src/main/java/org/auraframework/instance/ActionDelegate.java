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
package org.auraframework.instance;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.json.Json;

public abstract class ActionDelegate implements Action {
    public ActionDelegate(Action original) {
        this.original = original;
    }

    @Override
    public void serialize(Json json) throws IOException {
        original.serialize(json);
    }

    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return original.getDescriptor();
    }

    @Override
    public String getId() {
        return original.getId();
    }

    @Override
    public void setId(String id) {
        original.setId(id);
    }

    @Override
    public void run() throws AuraExecutionException {
        original.run();
    }

    @Override
    public void setup() {
        original.setup();
    }

    @Override
    public void cleanup() {
        original.cleanup();
    }

    @Override
    public void add(List<Action> newActions) {
        original.add(newActions);
    }

    @Override
    public List<Action> getActions() {
        return original.getActions();
    }

    @Override
    public Object getReturnValue() {
        return original.getReturnValue();
    }

    @Override
    public State getState() {
        return original.getState();
    }

    @Override
    public List<Object> getErrors() {
        return original.getErrors();
    }

    @Override
    public Map<String, Object> getParams() {
        return original.getParams();
    }

    @Override
    public boolean isStorable() {
        return original.isStorable();
    }

    @Override
    public void setStorable() {
        original.setStorable();
    }

    @Override
    public String toString() {
        return original.toString();
    }

    @Override
    public void logParams(KeyValueLogger logger) {
        original.logParams(logger);
    }

    @Override
    public InstanceStack getInstanceStack() {
        return original.getInstanceStack();
    }

    @Override
    public String getPath() {
        return original.getPath();
    }

    @Override
    public DefDescriptor<ComponentDef> getCallingDescriptor() {
        return original.getCallingDescriptor();
    }

    @Override
    public void setCallingDescriptor(DefDescriptor<ComponentDef> descriptor) {
        original.setCallingDescriptor(descriptor);
    }
    
	@Override
	public String getCallerVersion() {
		return original.getCallerVersion();
	}

	@Override
	public void setCallerVersion(String callerVersion) {
		original.setCallerVersion(callerVersion);
	}

    private Action original;
}
