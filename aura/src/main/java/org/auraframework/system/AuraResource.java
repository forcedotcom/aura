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
package org.auraframework.system;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A publicly serveable resource.
 */
public interface AuraResource {
    /**
     * Write out the resource to a response.
     */
    void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException;

    /**
     * The name of the resource.
     */
    String getName();

    /**
     * The expected output format.
     */
    AuraContext.Format getFormat();

    /**
     * Do we need protection from CSRF?.
     */
    boolean isCSRFProtect();

	void setContentType(HttpServletResponse response);
}
