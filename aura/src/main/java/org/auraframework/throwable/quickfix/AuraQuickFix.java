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
package org.auraframework.throwable.quickfix;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * @see QuickFixException
 */
public abstract class AuraQuickFix implements JsonSerializable {

    private final String description;
    private final Map<String, Object> attributes;
    private final DefDescriptor<ComponentDef> ui;

    protected AuraQuickFix(String description, Map<String, Object> attributes, DefDescriptor<ComponentDef> ui) {
        this.description = description;
        this.attributes = attributes;
        this.ui = ui;
    }

    /**
     * @return Returns the description.
     */
    public String getDescription() {
        return description;
    }

    /**
     * @return Returns the attributes.
     */
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    protected Object getAttribute(String key) {
        return getAttribute(attributes, key);
    }

    @SuppressWarnings("unchecked")
    private Object getAttribute(Map<String, Object> root, String key) {
        if (root == null) {
            return null;
        }

        if (key.indexOf(".") > -1) {
            List<String> split = AuraTextUtil.splitSimple(".", key);
            Object newRoot = root.get(split.get(0));
            if (newRoot == null) {
                return null;
            } else {
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i < split.size(); i++) {
                    sb.append(split.get(i));
                    if (i < split.size() - 1) {
                        sb.append('.');
                    }
                }
                return getAttribute((Map<String, Object>) newRoot, sb.toString());
            }
        } else {
            return root.get(key);
        }
    }

    protected boolean getBooleanAttribute(String key) {
        Object obj = getAttribute(key);
        if (obj == null) {
            return false;
        }

        if (obj.equals("on") || obj.equals("true") || obj.equals(true)) {
            return true;
        }

        return false;

    }

    /**
     * Run the fix.
     * 
     * @throws QuickFixException
     */
    public void execute() throws Exception {
        this.fix();
    }

    /**
     * This should return a descriptor for a component that implements
     * aura:quickFix
     */
    public DefDescriptor<ComponentDef> getUI() {
        return ui;
    }

    protected abstract void fix() throws Exception;

    private String getName() {
        String n = getClass().getSimpleName();
        if (n.endsWith("QuickFix")) {
            n = n.substring(0, n.length() - 8);
        }
        return n;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", getName());
        json.writeMapEntry("description", getDescription());
        json.writeMapEntry("attributes", getAttributes());
        json.writeMapEntry("ui", getUI());
        json.writeMapEnd();
    }

    protected void resetCache(DefDescriptor<?> descriptor) {
        Aura.getContextService().getCurrentContext().getDefRegistry().invalidate(descriptor);
        Aura.getDefinitionService().onSourceChanged(descriptor, SourceMonitorEvent.created);
    }
}
