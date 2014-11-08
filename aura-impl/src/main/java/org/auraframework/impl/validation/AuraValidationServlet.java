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
package org.auraframework.impl.validation;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext;
import org.auraframework.util.json.Json;
import org.auraframework.util.validation.ValidationError;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;

/**
 * Servlet used as endpoint for the Aura ValidationClient
 */
public class AuraValidationServlet extends AuraBaseServlet {

    private static final Log LOG = LogFactory.getLog(AuraValidationServlet.class);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuraContext context = ValidationUtil.startValidationContext();
        try {
            handle(request, response);
        } catch (Exception ex) {
            handleServletException(ex, false, context, request, response, false);
        } finally {
            ValidationUtil.endValidationContext();
        }
    }

    protected final void handle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        LOG.info("request: " + request);
        String path = request.getParameter("path");
        String report = request.getParameter("report");
        Boolean exit = Boolean.parseBoolean(request.getParameter("exit"));

        List<ValidationError> errors = Lists.newArrayList();
        ValidationEngine validationEngine = new ValidationEngine();
        Set<DefDescriptor<?>> descriptors = ValidationUtil.getAllDescriptorsIn(path);
        LOG.info("descriptors.size: " + descriptors.size());
        if (descriptors.size() > 0) {
            for (DefDescriptor<?> descriptor : descriptors) {
                List<ValidationError> ret = validationEngine.validate(descriptor);
                for (ValidationError error : ret) {
                    errors.add(error);
                }
            }
        }

        String charset = Charsets.UTF_8.toString();
        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding(charset);
        setBasicHeaders(Aura.getContextService().getCurrentContext().getApplicationDescriptor(),
                request, response);

        if (report != null) {
            File reportFile = new File(report);
            String message = ValidationUtil.writeReport(errors, reportFile);
            response.setContentType("text/plain");
            response.getOutputStream().write(message.getBytes(charset));
            if (exit) {
                LOG.info("exiting JVM");
                System.exit(0);
            }
        } else {
            // only send back errors if no report written
            StringBuilder content = new StringBuilder();
            for (ValidationError error : errors) {
                content.append(error.toCommonFormat());
                content.append('\n');
            }
            byte[] data = content.toString().getBytes(charset);
            response.setContentType(Json.MIME_TYPE);
            response.setContentLength(data.length);
            response.getOutputStream().write(data);
        }
    }

    private static final long serialVersionUID = 1L;
}
