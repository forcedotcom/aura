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


import org.apache.commons.httpclient.HttpStatus;

import com.google.common.collect.ImmutableList;

import org.auraframework.Aura;
import org.auraframework.def.EventDef;
import org.auraframework.instance.Event;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

public class ClientOutOfSyncException extends ClientSideEventException {
    private static final long serialVersionUID = 7178941169236716678L;

    /**
     * This is a special case for no client out of sync.
     *
     * @param message the message.
     */
    public ClientOutOfSyncException(String message) {
        super(message);
    }

    @Override
    public Event getEvent() {
        try {
            return Aura.getInstanceService().getInstance("aura:clientOutOfSync", EventDef.class);
        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Override
    public JsFunction getDefaultHandler() {
        return new JsFunction(ImmutableList.<String>of(), "try{$A.clientService.setOutdated()}catch(e){$L.clientService.setOutdated()}");
    }

    @Override
    public int getStatusCode() {
        return HttpStatus.SC_NOT_FOUND;
    }
}
