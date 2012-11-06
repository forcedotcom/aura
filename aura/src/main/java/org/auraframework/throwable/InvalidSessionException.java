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
package org.auraframework.throwable;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.EventDef;
import org.auraframework.instance.Event;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

import org.apache.commons.httpclient.HttpStatus;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;

public class InvalidSessionException extends ClientSideEventException {

    private static final long serialVersionUID = -2007734227131769994L;

    private final String newToken;

    public InvalidSessionException(Throwable cause) {
        this(cause, null);
    }

    public InvalidSessionException(Throwable cause, String newToken) {
        super(cause.getMessage());
        this.newToken = newToken;
    }

    @Override
    public Event getEvent() {
        try {
            Map<String, Object> args = Maps.newHashMapWithExpectedSize(1);
            args.put("newToken", this.newToken);
            return Aura.getInstanceService().getInstance("aura:invalidSession", EventDef.class, args);
        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Override
    public JsFunction getDefaultHandler() {
        return new JsFunction(ImmutableList.<String>of(), "try{$A.clientService.hardRefresh();}catch(e){$L.clientService.hardRefresh();}");
    }

    @Override
    public int getStatusCode() {
        return HttpStatus.SC_NOT_FOUND;
    }

}
