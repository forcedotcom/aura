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
package org.auraframework.throwable;

import java.util.Map;

import org.apache.commons.httpclient.HttpStatus;

import org.auraframework.Aura;

import org.auraframework.def.EventDef;

import org.auraframework.instance.Event;

import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;

/**
 * An exception to fire an arbitrary event on the client side.
 *
 */
public class GenericEventException extends ClientSideEventException {
    private static final long serialVersionUID = 8972903096686059699L;

    private String eventName;
    private Map<String,Object> params;

    /**
     * Create an exception with a (visible) cause.
     * 
     * @see AuraHandledException#AuraHandledException(Throwable)
     * @param cause the cause (usually logged).
     */
    public GenericEventException(String eventName, Throwable cause) {
        super(cause);
        this.eventName = eventName;
        this.params = Maps.newHashMap();
    }

    /**
     * Create an exception with a (visible) cause.
     * 
     * @see AuraHandledException#AuraHandledException(Throwable)
     * @param cause the cause (usually logged).
     */
    public GenericEventException(String eventName) {
        super(eventName);
        this.eventName = eventName;
        this.params = Maps.newHashMap();
    }

    public GenericEventException addParam(String name, Object value) {
        params.put(name, value);
        return this;
    }

    public GenericEventException addParamMap(Map<String,Object> newParams) {
        params.putAll(newParams);
        return this;
    }

    @Override
    public Event getEvent() {
        try {
            return Aura.getInstanceService().getInstance(eventName, EventDef.class, params);
        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Override
    public JsFunction getDefaultHandler() {
        return new JsFunction(ImmutableList.<String> of(), "$A.error('Unable to process event');");
    }

    @Override
    public int getStatusCode() {
        return HttpStatus.SC_OK;
    }
}
