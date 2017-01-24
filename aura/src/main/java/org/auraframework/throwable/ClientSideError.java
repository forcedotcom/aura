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

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * A server side representation of an error on the client side Note that this should only be used by the
 * server side error handling API within Aura Framework.
 * 
 * @author yungcheng.chen
 *
 */
public class ClientSideError implements JsonSerializable {

    /*
     * Error message.
     * */
    private String message;

    /*
     * Error stack from the exception.
     * */
    private final String stacktrace;

    /*
     * Custom data for client side action callback.
     * */
    private JsonSerializable data;

    /*
     * Error id that should be set by gack stacktraceId.
     * */
    private final String errorId;

    public ClientSideError(
            String message,
            String stacktrace,
            JsonSerializable data,
            String errorId) {
        this.message = message;
        this.stacktrace = stacktrace;
        this.data = data;
        this.errorId = errorId;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("message", this.message);
        json.writeMapEntry("stackTrace", this.stacktrace);
        json.writeMapEntry("data", this.data == null ? null : this.data);
        json.writeMapEntry("id", this.errorId);
        json.writeMapEnd();
    }
}
