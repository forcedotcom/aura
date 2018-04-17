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
import java.io.Writer;

import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.system.AuraContext.Format;

@ServiceComponent
public class TestJs extends TestResource {
    public TestJs() {
        super("test.js", Format.JS);
    }

    @Override
    void write(HttpServletResponse response, TestSuiteDef testSuite, String testName) throws IOException {
        Writer writer = response.getWriter();
        writer.append(""
        		+ "(function(name,suite){"
        		+   "function run(){"
        		+     "window.$A.test.run(name,suite)"
        		+   "}"
        		+   "if(window.$A && window.$A.test){"
        		+     "run()"
        		+   "}else{"
        		+     "window.$test=run"
        		+   "}"
        		+ "})('");
        writer.append(testName);
        writer.append("',");
        writer.append(testSuite.getCode());
        writer.append("\n)");
    }
}
