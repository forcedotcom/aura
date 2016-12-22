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

package org.auraframework.http.resource;

import java.io.IOException;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;

@ServiceComponent
public class AppCss extends AuraResourceImpl {

    public AppCss() {
        super("app.css", Format.CSS);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        Set<DefDescriptor<?>> dependencies = servletUtilAdapter.verifyTopLevel(request, response, context);
        if (dependencies == null) {
            return;
        }

        try {
            serverService.writeAppCss(dependencies, response.getWriter());
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
            exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
        }
    }
}

