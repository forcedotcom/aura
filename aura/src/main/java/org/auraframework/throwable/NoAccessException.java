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

public class NoAccessException extends ClientSideEventException {
    private static final long serialVersionUID = 8805697813928173542L;
    private String redirectURL;

    /**
     * This is a special case for no access where the security provider failed.
     * 
     * @param message the message.
     * @param cause the cause of the failure in the security provider (should be
     *            logged).
     */
    public NoAccessException(String message, Throwable cause) {
        super(message, cause);
    }

    public NoAccessException(String message) {
        super(message);
    }

    public NoAccessException(String message, String redirectURL) {
        this(message);
        this.redirectURL = redirectURL;
    }

    @Override
    public Event getEvent() {
        try {
            Map<String, Object> attrs = Maps.newHashMapWithExpectedSize(1);
            attrs.put("redirectURL", redirectURL);

            return Aura.getInstanceService().getInstance("aura:noAccess", EventDef.class, attrs);
        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Override
    public JsFunction getDefaultHandler() {
        if (this.redirectURL != null) {
            return new JsFunction(ImmutableList.<String> of(), String.format("window.location = '%s';", redirectURL));
        } else {
            return new JsFunction(ImmutableList.<String> of(), "$A.clientService.hardRefresh()");
        }
    }

    @Override
    public int getStatusCode() {
        return HttpStatus.SC_NOT_FOUND;
    }
}
