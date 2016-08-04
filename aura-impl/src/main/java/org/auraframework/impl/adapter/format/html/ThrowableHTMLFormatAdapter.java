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

import com.google.common.collect.Maps;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;
import java.io.IOException;
import java.util.Map;

@ThreadSafe
@ServiceComponent
public class ThrowableHTMLFormatAdapter extends HTMLFormatAdapter<Throwable> {
    @Inject
    private ContextService contextService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private RenderingService renderingService;

    @Override
    public Class<Throwable> getType() {
        return Throwable.class;
    }

    @Override
    public void write(Throwable value, Map<String, Object> attributes, Appendable out) throws IOException {

        Map<String, Object> attribs = Maps.newHashMap();
        attribs.put("autoInitialize", "false");
        attribs.put("bodyClass", "auraError");
        attribs.put("defaultBodyClass", "auraError");
        attribs.put("forceError", "true");

        boolean writeStack = false;
        if (contextService.isEstablished()) {
            Mode mode = contextService.getCurrentContext().getMode();
            writeStack = mode != Mode.PROD && mode != Mode.PRODDEBUG;
        }            
        if (writeStack) {
            attribs.put("errorMessage", AuraTextUtil.escapeForHTML(AuraExceptionUtil.getStackTrace(value)));
        } else {
            attribs.put("errorMessage", AuraTextUtil.escapeForHTML(value.getMessage()));
        }
        try {
            Component c = instanceService.getInstance("aura:template", ComponentDef.class, attribs);
            renderingService.render(c, out);
        } catch (QuickFixException e) {
            throw new AuraError(e);
        }
    }
}
