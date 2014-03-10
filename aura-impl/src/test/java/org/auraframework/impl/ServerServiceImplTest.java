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
package org.auraframework.impl;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;

import org.auraframework.def.ActionDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.instance.Action;
import org.auraframework.service.ServerService;
import org.auraframework.system.Location;
import org.auraframework.system.Message;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class ServerServiceImplTest extends AuraImplTestCase {
    public ServerServiceImplTest(String name) {
        super(name, true);
    }

    // Do not test for null message, it cannot legally be null.
    
    private static class EmptyActionDef implements ActionDef {
		private static final long serialVersionUID = 1L;

		@Override
        public void validateDefinition() throws QuickFixException {
        }

        @Override
        public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        }

        @Override
        public void validateReferences() throws QuickFixException {
        }

        @Override
        public void markValid() {
        }

        @Override
        public boolean isValid() {
            return true;
        }

        @Override
        public Location getLocation() {
            return null;
        }

        @Override
        public Visibility getVisibility() {
            return null;
        }

        @Override
        public DefinitionAccess getAccess() {
            return null;
        }

        @Override
        public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
            return null;
        }

        @Override
        public void retrieveLabels() throws QuickFixException {
        }

        @Override
        public String getDescription() {
            return null;
        }

        @Override
        public String getOwnHash() {
            return null;
        }

        @Override
        public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
        }

        @Override
        public void serialize(Json json) throws IOException {
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return null;
        }

        @Override
        public ActionType getActionType() {
            return null;
        }

        @Override
        public String getName() {
            return null;
        }

        @Override
        public DefDescriptor<TypeDef> getReturnType() {
            return null;
        }

        @Override
        public List<ValueDef> getParameters() {
            return null;
        }

        @Override
        public List<String> getLoggableParams() {
            return Lists.newArrayList();
        }
    }

    private static class EmptyAction extends AbstractActionImpl<EmptyActionDef> {
        public EmptyAction() {
            super(null, new EmptyActionDef(), null);
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return Aura.getDefinitionService().getDefDescriptor("java://aura.empty/ACTION$emptyAction", ActionDef.class);
        }

        @Override
        public void run() throws AuraExecutionException {
            // do nothing.
        }

        @Override
        public Object getReturnValue() {
            return null;
        }

        @Override
        public List<Object> getErrors() {
            return null;
        }

        @Override
        public void serialize(Json json) throws IOException {
            Map<String,String> value = Maps.newHashMap();
            value.put("action", "simpleaction");
            json.writeValue(value);
        }
    };


    private static final Set<String> GLOBAL_IGNORE = Sets.newHashSet("context", "actions");

    /**
     * Check that our EmptyAction is properly serialized.
     *
     * This does a positive and negative test, ensuring that we only serialize what we should.
     */
    private Map<String,Object> validateEmptyActionSerialization(String serialized, Set<String> ignore) {
        Set<String> extras = Sets.newHashSet();

        @SuppressWarnings("unchecked")
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(serialized);
        @SuppressWarnings("unchecked")
        List<Object> actions = (List<Object>) json.get("actions");
        assertTrue("expected one action, got: "+actions, actions != null && actions.size() == 1);
        Map<String, Object> action = (Map<String, Object>) actions.get(0);
        assertTrue("expected just the action serialization, but got: "+action, action != null && action.size() == 1);
        assertEquals("expected simpleaction from "+action, "simpleaction", action.get("action"));

        for (String key : json.keySet()) {
            if (!GLOBAL_IGNORE.contains(key) && (ignore == null || !ignore.contains(key))) {
                extras.add(key);
            }
        }
        assertTrue("Expected no extra keys, found: "+extras+", in: "+json, extras.isEmpty());
        return json;
    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    public void testSimpleAction() throws Exception {
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction();
        List<Action> actions = Lists.newArrayList(a);
        Message message = new Message(actions);
        StringBuffer sb = new StringBuffer();
        ss.run(message, Aura.getContextService().getCurrentContext(), sb, null);
        validateEmptyActionSerialization(sb.toString(), null);
    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    public void testSimpleActionWithExtras() throws Exception {
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction();
        List<Action> actions = Lists.newArrayList(a);
        Map<String,String> extras = Maps.newHashMap();
        Message message = new Message(actions);
        StringBuffer sb = new StringBuffer();
        extras.put("this", "that");
        ss.run(message, Aura.getContextService().getCurrentContext(), sb, extras);

        Map<String, Object> json = validateEmptyActionSerialization(sb.toString(), Sets.newHashSet("this"));
        assertEquals("Expected extras to be in "+json, "that", json.get("this"));
    }
}
