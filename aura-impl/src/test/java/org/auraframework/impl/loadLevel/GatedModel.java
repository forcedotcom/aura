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
package org.auraframework.impl.loadLevel;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

@Model
public class GatedModel {
    static ConcurrentHashMap<String, String> pending = new ConcurrentHashMap<String, String>();

    public GatedModel() throws Exception {
        Aura.getContextService().getCurrentContext().getComponents();
        Aura.getContextService().getCurrentContext().getGlobalProviders();
        String id = null;
        try {
            id = (String) Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes()
                    .getValue("waitId");
        } catch (Throwable t) {
            return;
        }
        if (id != null) {
            pending.putIfAbsent(id, id);
            id = pending.get(id);
            synchronized (id) {
                id.wait(15000);
            }
        }
    }

    @AuraEnabled
    public List<String> getStringList() {
        ArrayList<String> sl = new ArrayList<String>();
        sl.add("foo");
        sl.add("bar");
        sl.add("beer");
        return sl;
    }

    @AuraEnabled
    public String getString() {
        BaseComponent<?, ?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String str = (String) component.getAttributes().getExpression("stringAttribute");
        return str;
    }
}
