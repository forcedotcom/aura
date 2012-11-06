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
package org.auraframework.impl.renderer.sampleJavaRenderers;

import java.io.IOException;

import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;

public class TestSimpleRenderer implements Renderer {
    public static String htmlOutput = "<div>salesforce.com, inc, All rights reserved <a href=\"http://www.salesforce.com\" target=\"_blank\">Home</a></div>";

    @Override
    public void render(BaseComponent<?, ?> cmp, Appendable out) throws IOException {
        out.append(htmlOutput);
    }
}
