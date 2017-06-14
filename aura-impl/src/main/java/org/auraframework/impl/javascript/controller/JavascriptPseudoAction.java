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
package org.auraframework.impl.javascript.controller;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.controller.AuraClientException;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * This represents the Java bookkeeping idea of a Javascript action.  It is not
 * runnable server-side, but is used for example as the echo of a failed client
 * action when logging the failure to the server-hosted forensic log machinery.
 *
 * @since 194
 */
public class JavascriptPseudoAction implements Action {

    private final DefDescriptor<ActionDef> descriptor;
    private String id;
    private List<Object> errorList;

    public JavascriptPseudoAction(JavascriptActionDef actionDef) {
        this.descriptor = actionDef.getDescriptor();
    }

    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return descriptor;
    }

    @Override
    public String getPath() {
        throw new UnsupportedOperationException("client-side Javascript actions do not have a path");
    }

    @Override
    public void serialize(Json json) throws IOException {
        throw new UnsupportedOperationException("client-side Javascript actions do not serialize back from the server");
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public void run() throws AuraExecutionException {
        throw new UnsupportedOperationException("client-side Javascript actions cannot be run server-side in Java");
    }

    @Override
    public void setup(){
        //do nothing
    }

    @Override
    public void cleanup(){
        //do nothing
    }

    @Override
    public void add(List<Action> actions) {
        throw new UnsupportedOperationException("client-side Javascript actions do not contain other actions server-side");
    }

    @Override
    public List<Action> getActions() {
        throw new UnsupportedOperationException("client-side Javascript actions do not contain other actions server-side");
    }

    @Override
    public Object getReturnValue() {
        throw new UnsupportedOperationException("client-side Javascript actions do not have a server-side return value");
    }

    /** If the server knows about a client-side action, it's because something went wrong with it. */
    @Override
    public State getState() {
        return State.ERROR;
    }

    @Override
    public List<Object> getErrors() {
        return errorList;
    }

    public void addError(AuraClientException e) {
        if (errorList == null) {
            errorList = new ArrayList<>();
        }
        errorList.add(e);
    }

    @Override
    public void logParams(KeyValueLogger logger) {
        throw new UnsupportedOperationException("client-side Javascript actions do not have log params");
    }

    @Override
    public boolean isStorable() {
        return false;
    }

    @Override
    public void setStorable() {
        // no nothing
    }

    @Override
    public Map<String, Object> getParams() {
        return null;
    }

    @Override
    public InstanceStack getInstanceStack() {
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getCallingDescriptor() {
        throw new UnsupportedOperationException("client-side Javascript actions do not have get calling descriptor");
    }

    @Override
    public void setCallingDescriptor(DefDescriptor<ComponentDef> descriptor) {
        throw new UnsupportedOperationException("client-side Javascript actions do not have set calling descriptor");
    }

	@Override
	public String getCallerVersion() {
		throw new UnsupportedOperationException("client-side Javascript actions do not have set calling descriptor");
	}

	@Override
	public void setCallerVersion(String callerVersion) {
		throw new UnsupportedOperationException("client-side Javascript actions do not have set calling descriptor");
	}
}
