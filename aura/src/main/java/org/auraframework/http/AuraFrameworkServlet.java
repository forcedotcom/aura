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
package org.auraframework.http;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.http.services.AuraFrameworkServletService;
import org.auraframework.http.services.AuraFrameworkServletServiceImpl;

public class AuraFrameworkServlet extends AuraBaseServlet {

//    private static final long serialVersionUID = 6034969764380397480L;
//    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
//    private static final String MINIFIED_FILE_SUFFIX = ".min";
//
//    // RESOURCES_PATTERN format:
//    // /required_root/optional_nonce/required_rest_of_path
//    private static final Pattern RESOURCES_PATTERN = Pattern.compile("^/([^/]+)(/[-_0-9a-zA-Z]+)?(/.*)$");
//
//    public static final String RESOURCES_FORMAT = "%s/auraFW/resources/%s/%s";

    private AuraFrameworkServletService servletService;
    
    public AuraFrameworkServlet() {
        servletService = new AuraFrameworkServletServiceImpl(
                Aura.getConfigAdapter(),
                Aura.getServletUtilAdapter());
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        servletService.doGet(request, response);
    }
}
