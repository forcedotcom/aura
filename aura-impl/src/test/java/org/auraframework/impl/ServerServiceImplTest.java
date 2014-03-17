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

import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.instance.Action;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
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
        @SuppressWarnings("unchecked")
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
        StringWriter sw = new StringWriter();
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, null);
        validateEmptyActionSerialization(sw.toString(), null);
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
        StringWriter sw = new StringWriter();
        extras.put("this", "that");
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, extras);

        Map<String, Object> json = validateEmptyActionSerialization(sw.toString(), Sets.newHashSet("this"));
        assertEquals("Expected extras to be in "+json, "that", json.get("this"));
    }

    /**
     * Sanity check to make sure that app.css does not have duplicate copy of component CSS. Component CSS was being
     * added twice, once because they were part of preload namespace and a second time because of component dependency.
     * This test mocks such duplication. W-1588568
     */
    public void testWriteCssWithoutDupes() throws Exception {
        ServerService ss = Aura.getServerService();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("preloadTest:test_SimpleApplication", ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);
        
        StringWriter output = new StringWriter();
        ss.writeAppCss(dependencies, output);

        // A snippet of component css
        String cssPiece = "AuraResourceServletTest-testWriteCssWithoutDupes";
        Pattern pattern = Pattern.compile(cssPiece);
        Matcher matcher = pattern.matcher(output.toString());
        int count = 0;
        while (matcher.find() && count < 3) {
            count++;
        }
        assertEquals("Component CSS repeated", 1, count);
    }

    /**
     * Verify that the css writer writes in the order given.
     */
    public void testCSSOrder() throws Exception {
        ServerService ss = Aura.getServerService();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("auratest:test_SimpleServerRenderedPage", ApplicationDef.class);
        DefDescriptor<ComponentDef> grandparent = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:grandparent", ComponentDef.class);
        DefDescriptor<ComponentDef> parent = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:parent", ComponentDef.class);
        DefDescriptor<ComponentDef> child1 = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:child", ComponentDef.class);
        DefDescriptor<ComponentDef> child2 = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:anotherChild", ComponentDef.class);
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);

        Set<DefDescriptor<?>> writable = Sets.newLinkedHashSet();

        writable.add(child1.getDef().getStyleDescriptor());
        writable.add(grandparent.getDef().getStyleDescriptor());
        writable.add(parent.getDef().getStyleDescriptor());
        writable.add(child2.getDef().getStyleDescriptor());

        StringWriter output = new StringWriter();
        ss.writeAppCss(writable, output);
        String css = output.toString();

        //
        // order should be exactly that above.
        // child1, grandparent, parent, child2
        // 
        assertTrue("parent CSS should be written before child CSS in: "+css,
                css.indexOf(".setAttributesTestChild") < css.indexOf(".setAttributesTestGrandparent"));
        assertTrue("grandparent CSS should be written before parent CSS in: "+css,
                css.indexOf(".setAttributesTestGrandparent") < css.indexOf(".setAttributesTestParent"));
        assertTrue("parent CSS should be written before another child CSS in: "+css,
                css.indexOf(".setAttributesTestParent") < css.indexOf(".setAttributesTestAnotherChild"));
    }

    public void testPreloadCSSDependencies() throws Exception {

        ServerService ss = Aura.getServerService();
        DefDescriptor<ComponentDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        StringWriter output = new StringWriter();
        ss.writeAppCss(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");
        String preloaded1 = ".clientApiTestCssStyleTest{background-color:#eee}";
        String preloaded2 = ".testTestValidCSS{color:#1797c0";
        assertTrue("Does not have preloaded css", sourceNoWhitespace.contains(preloaded1));
        assertTrue("Does not have preloaded css", sourceNoWhitespace.contains(preloaded2));
    }

    /**
     * Sanity check to make sure that app.js doesn't blow up
     */
    public void testWriteDefinitionsWithoutDupes() throws Exception {
        ServerService ss = Aura.getServerService();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        // prime def cache
        StringWriter output = new StringWriter();
        ss.writeDefinitions(dependencies, output);
        String text = output.toString();
        final String dupeCheck = "$A.clientService.initDefs(";
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }

        // now check that defs not re-written with unempty cache
        output = new StringWriter();
        ss.writeDefinitions(dependencies, output);
        text = output.toString();
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }
    }

    public void testPreloadJSDependencies() throws Exception {
        ServerService ss = Aura.getServerService();
        DefDescriptor<ComponentDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        StringWriter output = new StringWriter();
        ss.writeDefinitions(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");

        String[] preloads = new String[]{
                "\"descriptor\":\"markup://aura:placeholder\",",
                "\"descriptor\":\"markup://ui:input\",",
                "\"descriptor\":\"markup://ui:inputText\",",
                "\"descriptor\":\"markup://ui:output\",",
                "\"descriptor\":\"markup://ui:outputText\",",
                "\"descriptor\":\"markup://test:testValidCSS\","
        };

        for (String preload : preloads) {
            assertTrue("Does not have preloaded component: (" + preload + ")" , sourceNoWhitespace.contains(preload));
        }
    }
}
