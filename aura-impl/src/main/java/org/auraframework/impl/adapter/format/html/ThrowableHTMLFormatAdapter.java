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
package org.auraframework.impl.adapter.format.html;

import java.io.IOException;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 */
@ThreadSafe
public class ThrowableHTMLFormatAdapter extends HTMLFormatAdapter<Throwable> {

    @Override
    public Class<Throwable> getType() {
        return Throwable.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException {

        Throwable t = Aura.getExceptionAdapter().getRootCause((Throwable)value);
        Map<String, Object> attribs = Maps.newHashMap();
        attribs.put("autoInitialize", "false");
        attribs.put("bodyClass", "auraError");
        attribs.put("defaultBodyClass", "auraError");
        attribs.put("forceError", "true");

        if (Aura.getContextService().isEstablished() && Aura.getContextService().getCurrentContext().getMode() != Mode.PROD) {
            attribs.put("errorMessage", AuraExceptionUtil.getStackTrace(t));
        }else{
            attribs.put("errorMessage", t.getMessage());
        }
        try {
            Component c = Aura.getInstanceService().getInstance("aura:template", ComponentDef.class, attribs);
            Aura.getRenderingService().render(c, out);
        } catch (QuickFixException e) {
            throw new AuraError(e);
        }
    }

}
