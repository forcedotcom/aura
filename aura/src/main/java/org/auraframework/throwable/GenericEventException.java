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

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.def.EventDef;
import org.auraframework.instance.Event;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableList;

/**
 * An exception to fire an arbitrary event on the client side.
 * A generic event class to fire events on the client side to indicate an error state
 * while executing a server action. This object will encapsulate all the information
 * required to create and fire the event client side.
 * <p><i>Note: This event should not be used by the Aura framework itself, it should only be used inside of a
 * server action.</i></p>
 */
public class GenericEventException extends ClientSideEventException {

    private static final long serialVersionUID = 136968404446222002L;

    private String eventName;
    private Map<String,Object> params;

    /**
     * A flag indicating whether default error handling should be executed.
     */
    private Boolean useDefault = Boolean.FALSE;

    /**
     * Create an exception with a (visible) cause.
     *
     * @param eventName the name of the event triggering the exception
     * @param cause the cause (usually logged).
     * @see AuraHandledException#AuraHandledException(Throwable)
     * @see #GenericEventException(String)
     */
    public GenericEventException(String eventName, Throwable cause) {
        super(eventName, cause);
        this.eventName = eventName;
        this.params = new HashMap<>();
    }

    /**
     * Create an exception with a (visible) cause.
     *
     * @param eventName the name of the event triggering the exception
     * @see AuraHandledException#AuraHandledException(Throwable)
     * @see #GenericEventException(String, Throwable)
     */
    public GenericEventException(String eventName) {
        this(eventName, null);
    }

    public GenericEventException addParam(String name, Object value) {
        params.put(name, value);
        return this;
    }

    public GenericEventException addParamMap(Map<String,Object> newParams) {
        params.putAll(newParams);
        return this;
    }

    /**
     * Turn off default error handling to allow custom handling by action callback in client code.
     */
    public void setDefault() {
        this.useDefault = Boolean.TRUE;
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
        return new JsFunction(ImmutableList.<String>of(),
                "var e=new Error('[GenericEventException from server] Unable to process event');" +
                "e.reported=true;" +
                "throw e;");
    }

    @Override
    public int getStatusCode() {
        return HttpStatus.SC_OK;
    }

    /**
     * Serialize to JSON.
     */
    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("exceptionEvent", Boolean.TRUE);
        json.writeMapEntry("useDefault", this.useDefault);
        json.writeMapEntry("event", getEvent());
        json.writeMapEnd();
    }
}
