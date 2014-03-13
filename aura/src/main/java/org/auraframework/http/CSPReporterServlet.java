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

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.auraframework.util.json.JsonReader;

/**
 * Endpoint for reporting Content Security Policy violations,
 * per the <a href="http://www.w3.org/TR/CSP/">W3C Content Security
 * Policy 1.0 spec</a>.
 */
public class CSPReporterServlet extends HttpServlet {
    // KEEP THIS IN SYNC WITH THE SERVLET'S URL-MAPPING ENTRY IN WEB.XML!
    public static final String URL = "/_/csp";
    
    private static final String JSON_NAME = "csp-report";
    
    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        Map<String, String> report = null;
        
        try {
          BufferedReader reader = req.getReader();
          Map<?, ?> map = (Map<?, ?>) new JsonReader().read(reader);

          report = (Map<String, String>)map.get(JSON_NAME);
        } catch (Exception e) { /*report an error*/ }

        System.err.println(report.keySet());
        
        // TODO REPORT ALSO THE USER AGENT!
    }
}