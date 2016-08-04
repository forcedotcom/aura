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
package org.auraframework.impl.adapter.format.html;

import org.auraframework.impl.adapter.format.BaseFormatAdapter;

import javax.annotation.concurrent.ThreadSafe;
import java.io.IOException;
import java.util.List;

import org.auraframework.impl.util.TemplateUtil;
import org.auraframework.system.AuraContext;

/**
 */
@ThreadSafe
public abstract class HTMLFormatAdapter<T> extends BaseFormatAdapter<T> {
    private TemplateUtil templateUtil = new TemplateUtil();

    protected static final String name = "HTML";


    @Override
    public String getFormatName() {
        return name;
    }

    protected void writeHtmlStyle(String url, Appendable out) throws IOException {
        templateUtil.writeHtmlStyle(url, out);
    }

    protected void writeHtmlStyles(List<String> urls, Appendable out) throws IOException {
        templateUtil.writeHtmlStyles(urls, out);
    }

    protected void writeHtmlScripts(AuraContext context, List<String> scripts, boolean canBeAsync, Appendable out)
            throws IOException {
        templateUtil.writeHtmlScripts(context, scripts, canBeAsync, out);
    }
}
