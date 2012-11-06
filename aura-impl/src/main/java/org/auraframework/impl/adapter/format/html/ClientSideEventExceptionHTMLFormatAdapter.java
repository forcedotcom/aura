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
import org.auraframework.throwable.ClientSideEventException;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 */
@ThreadSafe
public class ClientSideEventExceptionHTMLFormatAdapter extends HTMLFormatAdapter<ClientSideEventException> {

    @Override
    public Class<ClientSideEventException> getType() {
        return ClientSideEventException.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException, QuickFixException {

        Map<String, Object> attribs = Maps.newHashMap();

        StringBuilder sb = new StringBuilder();
        Aura.getSerializationService().write(value, attributes, getType(), sb, "JS");
        attribs.put("auraInitBlock", String.format("<script>%s</script>", sb.toString()));

        try {
            Component c = Aura.getInstanceService().getInstance("aura:template", ComponentDef.class, attribs);
            Aura.getRenderingService().render(c, out);
        } catch (QuickFixException e) {
            throw new AuraError(e);
        }
    }

}
