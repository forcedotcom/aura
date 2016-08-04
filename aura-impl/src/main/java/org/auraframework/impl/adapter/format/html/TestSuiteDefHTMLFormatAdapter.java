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

import java.io.IOException;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

@ThreadSafe
@ServiceComponent
public class TestSuiteDefHTMLFormatAdapter extends HTMLFormatAdapter<TestSuiteDef> {
    @Inject
    private ContextService contextService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private RenderingService renderingService;

    @Inject
    private SerializationService serializationService;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;

    @Override
    public Class<TestSuiteDef> getType() {
        return TestSuiteDef.class;
    }

    @Override
    public void write(TestSuiteDef value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        Map<String, Object> attribs = Maps.newHashMap();
        attribs.put("autoInitialize", "false");
        attribs.put("bodyClass", " ");

        StringBuilder sb = new StringBuilder();
        writeHtmlStyles(servletUtilAdapter.getStyles(context), sb);
        attribs.put("auraStyleTags", sb.toString());

        sb = new StringBuilder();
        writeHtmlScripts(context, servletUtilAdapter.getScripts(context, true, false, attributes), false, sb);
        attribs.put("auraScriptTags", sb.toString());

        sb = new StringBuilder();
        serializationService.write(value, attributes, getType(), sb, "JSON");
        attribs.put("auraInitBlock", String.format("<script>$A.runAfterInit(function() {aura.test.init(%s);});</script>", sb.toString()));

        try {
            Component c = instanceService.getInstance("aura:template", ComponentDef.class, attribs);
            renderingService.render(c, out);
        } catch (QuickFixException e) {
            throw new AuraError(e);
        }
    }

}
