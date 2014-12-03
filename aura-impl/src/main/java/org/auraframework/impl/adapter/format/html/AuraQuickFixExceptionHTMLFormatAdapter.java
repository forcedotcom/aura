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
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 */
@ThreadSafe
@aQute.bnd.annotation.component.Component (provide=AuraServiceProvider.class)
public class AuraQuickFixExceptionHTMLFormatAdapter extends HTMLFormatAdapter<QuickFixException> {

    @Override
    public Class<QuickFixException> getType() {
        return QuickFixException.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        Mode m = Aura.getContextService().getCurrentContext().getMode();
        if (m != Mode.DEV) {
            Aura.getSerializationService().write(value, attributes, Throwable.class, out, getFormatName());
            return;
        }

        try {
            Map<String, Object> attribs = Maps.newHashMap();
            Throwable t = (Throwable)value;
            attribs.put("exception", value);
            if (t.getCause() != null) {
                StringWriter sw = new StringWriter();
                t.getCause().printStackTrace(new PrintWriter(sw));
                attribs.put("cause", sw.toString());
            }

            Component cmp = Aura.getInstanceService()
                                .getInstance("auradev:quickFixException", ComponentDef.class, attribs);
            Aura.getSerializationService().write(cmp, attribs, Component.class, out);
        } catch (QuickFixException e) {
            throw new AuraError(e);
        }
    }

}
