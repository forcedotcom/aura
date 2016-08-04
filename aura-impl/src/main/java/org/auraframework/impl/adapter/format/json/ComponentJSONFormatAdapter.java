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
package org.auraframework.impl.adapter.format.json;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.util.json.JsonEncoder;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;
import java.io.IOException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

@ThreadSafe
@ServiceComponent
public class ComponentJSONFormatAdapter extends JSONFormatAdapter<Component> {
    @Inject
    private ContextService contextService;

    @Override
    public Class<Component> getType() {
        return Component.class;
    }

    @Override
    public void write(Component value, Map<String, Object> attributes, Appendable out) throws IOException {
        AuraContext c = contextService.getCurrentContext();
        JsonEncoder.serialize(value, out, c.getJsonSerializationContext());
    }

    @Override
    public void writeCollection(Collection<? extends Component> values, Appendable out) throws IOException {
        AuraContext c = contextService.getCurrentContext();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("components", values);
        m.put("context", c);
        JsonEncoder.serialize(m, out, c.getJsonSerializationContext());
    }
}
