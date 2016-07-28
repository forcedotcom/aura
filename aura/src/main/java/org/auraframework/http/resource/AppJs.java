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
import java.io.PrintWriter;
import java.net.URL;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

public class AppJs extends AuraResourceImpl {

    public AppJs() {
        super("app.js", Format.JS);
    }

    private void prependBootstrapJsPayload (PrintWriter writer) {
        String tmp = "";
        ResourceLoader resourceLoader = configAdapter.getResourceLoader();
        try {
            URL url = resourceLoader.getResource("js/prependAppJs.js");
            tmp = Resources.toString(url, Charsets.UTF_8);
        } catch (IOException e) {
        	throw new AuraRuntimeException(e);
        }

        writer.append(tmp);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        Set<DefDescriptor<?>> dependencies = servletUtilAdapter.verifyTopLevel(request, response, context);
        if (dependencies == null) {
            return;
        }
        try {
            PrintWriter writer = response.getWriter();
            prependBootstrapJsPayload(writer);
            serverService.writeDefinitions(dependencies, writer);
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
        }
    }
}
