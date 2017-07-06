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
package org.auraframework.integration.test.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.junit.Assert.assertThat;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.ActionDelegate;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.system.Message;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonStreamReader;
import org.hamcrest.CoreMatchers;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class ServerServiceImplTest extends AuraImplTestCase {

    @Inject
    private InstanceService instanceService;

    @Inject
    private ServerService serverService;

    public ServerServiceImplTest() {
        super();
        setShouldSetupContext(false);
    }

    private static final Set<String> GLOBAL_IGNORE = Sets.newHashSet("context", "actions", "perf", "perfSummary");

    // Do not test for null message, it cannot legally be null.
    private static class EmptyActionDef implements ActionDef {
        private static final long serialVersionUID = 1L;
        StringWriter sw;
        String name;

        protected EmptyActionDef(StringWriter sw, String name) {
            this.sw = sw;
            this.name = name;
        }

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
        public String getAPIVersion() {
            return null;
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
            return this.name;
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

    private class EmptyAction extends AbstractActionImpl<EmptyActionDef> {
        private String returnValue = "";
        private Integer count = 0;
        private String parameter = "";
        private DefinitionService definitionService;

        public EmptyAction(StringWriter sw, String name, DefinitionService definitionService) {
            super(null, new EmptyActionDef(sw, name), null);
            this.definitionService = definitionService;
        }

        public EmptyAction(DefinitionService definitionService) {
            super(null, new EmptyActionDef(null, "simpleaction"), null);
            this.definitionService = definitionService;
        }

        public Integer getCount() {
            return this.count;
        }

        public String getName() {
            return this.actionDef.getName();
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return definitionService
                    .getDefDescriptor("java://aura.empty/ACTION$emptyAction", ActionDef.class);
        }

        @Override
        public void run() throws AuraExecutionException {
            this.count++;
            if (this.actionDef.sw != null) {
                this.returnValue = this.actionDef.sw.toString();
            } else {
                // do nothing
            }
            if (this.count > 1) {
                setParameter("#" + this.count);
            }
        }

        @Override
        public Object getReturnValue() {
            return this.returnValue;
        }

        private void setParameter(String parameter) {
            this.parameter = parameter;
        }

        @Override
        public List<Object> getErrors() {
            return null;
        }

        @Override
        public void serialize(Json json) throws IOException {
            Map<String, String> value = Maps.newHashMap();
            String res = this.getName();
            if (this.parameter != "") {
                res = res.concat("{" + this.parameter + "}");
            }
            value.put("action", res);
            json.writeValue(value);
        }
    };

    private static class ShareCmpAction extends ActionDelegate {

        private Map<String, Object> componentAttributes = null;
        private Component sharedCmp = null;
        private Object returnValue = null;
        private String name = "ShareCmpAction";

        public ShareCmpAction(String name, Action originalAction, Component sharedCmp,
                Map<String, Object> componentAttributes) {
            super(originalAction);
            this.sharedCmp = sharedCmp;
            this.componentAttributes = componentAttributes;
            this.name = name;
        }

        @Override
        public void run() throws AuraExecutionException {
            try {
                sharedCmp.getAttributes().set(componentAttributes);
            } catch (QuickFixException e) {
                throw new AuraExecutionException(e.getMessage(), e.getLocation());
            }
            super.run();
            String whatIsInResponse = (String) super.getReturnValue();
            int startPos = whatIsInResponse.lastIndexOf("shared_component");
            if (startPos >= 0) {
                this.returnValue = whatIsInResponse.substring(startPos);
            }
        }

        @Override
        public Object getReturnValue() {
            return this.returnValue;
        }

        @Override
        public void serialize(Json json) throws IOException {
            Map<String, Object> value = Maps.newHashMap();
            value.put("shared_component", this.sharedCmp);
            value.put("action", this.name);
            json.writeValue(value);
        }
    }

    /**
     * Test for W-2085617 This test is to verify when we have shared component between actions, they get serialized into
     * response correctly.
     *
     * Test Setup: EmptyAction a,b,c : when it run, it put whatever response has into their return value ShareCmpAction
     * d,e,f: when it run, it update the attribute of shared component, run its delegate action(a,b orc), then get the
     * latest shared_component(in Json format) from its delegate action's return value as its return value.
     *
     * when b runs, a has finish running, so b will have shared_component of a e will have shared_component of a in its
     * return value (with attrA) when c runs, b has finish running, so c will have shared_components of a & b e will
     * have shared_component of b in its return value (with attrB)
     *
     * @throws Exception
     */
    @Test
    public void testSharedCmp() throws Exception {
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Map<String, Object> attributes = Maps.newHashMap();
        Map<String, Object> attributesA = Maps.newHashMap();
        attributesA.put("attr", "attrA");
        Map<String, Object> attributesB = Maps.newHashMap();
        attributesB.put("attr", "attrB");
        Map<String, Object> attributesC = Maps.newHashMap();
        attributesC.put("attr", "attrC");
        Component sharedCmp = instanceService.getInstance("ifTest:testIfWithModel", ComponentDef.class,
                attributes);
        StringWriter sw = new StringWriter();
        Action a = new EmptyAction(sw, "first action", definitionService);
        Action b = new EmptyAction(sw, "second action", definitionService);
        Action c = new EmptyAction(sw, "third action", definitionService);
        Action d = new ShareCmpAction("d", a, sharedCmp, attributesA);
        Action e = new ShareCmpAction("e", b, sharedCmp, attributesB);
        Action f = new ShareCmpAction("f", c, sharedCmp, attributesC);
        List<Action> actions = Lists.newArrayList(d, e, f);
        Message message = new Message(actions);
        // run the list of actions.
        serverService.run(message, contextService.getCurrentContext(), sw, null);

        // sanity check, sharedCmp should have the latest attribute value.
        // this has nothing to do with the fix though
        assertEquals("attrC", sharedCmp.getAttributes().getValue("attr"));
        // Here are the checks for fix
        // returnValue of action e is going to have shared component from action d in Json format
        String returne = (String) e.getReturnValue();
        assertTrue(returne.contains("markup://ifTest:testIfWithModel"));
        assertTrue(returne.contains("\"attr\":\"attrA\""));
        // returnValue of action f is going to have shared component from action e in Json format
        String returnf = (String) f.getReturnValue();
        assertTrue(returnf.contains("markup://ifTest:testIfWithModel"));
        assertTrue(returnf.contains("\"attr\":\"attrB\""));

    }

    /**
     * Check that our EmptyAction is properly serialized.
     *
     * This does a positive and negative test, ensuring that we only serialize what we should.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> validateEmptyActionSerialization(String serialized, Set<String> ignore,
            List<String> actionNameList) {
        int actionNumber = actionNameList.size();
        Set<String> extras = Sets.newHashSet();
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(serialized);
        List<Object> actions = (List<Object>) json.get("actions");
        assertTrue(actions != null);
        assertTrue("expected " + actionNumber + " action, but get " + actions.size(), actions.size() == actionNumber);
        for (int i = 0; i < actionNumber; i++) {
            Map<String, Object> action = (Map<String, Object>) actions.get(i);
            assertEquals("didn't get expecting action on i:" + i,
                    actionNameList.get(i), action.get("action"));
        }
        for (String key : json.keySet()) {
            if (!GLOBAL_IGNORE.contains(key) && (ignore == null || !ignore.contains(key))) {
                extras.add(key);
            }
        }
        assertTrue("Expected no extra keys, found: " + extras + ", in: " + json, extras.isEmpty());
        return json;
    }

    /**
     * This test is for W-2063110 Test a list of actions. New Way : in ServerService, we serialize each action and write
     * it into response (via a string writer) right after it finish running. in the SimpleAction above, we put whatever
     * we have in the string writer as returnValue of the current action so when Action2 is running, we should have
     * Action1 in string writer, when Action3 is running, we should have both Action1 and Action2, .... Old Way: We used
     * to run all actions, store the result in Message, then write them into response at once, in the old way we won't
     * have anything in string writer/response until Action3 is finished.
     */
    @Test
    public void testMultipleActions() throws Exception {
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        StringWriter sw = new StringWriter();
        Action a = new EmptyAction(sw, "first action", definitionService);
        Action b = new EmptyAction(sw, "second action", definitionService);
        Action c = new EmptyAction(sw, "third action", definitionService);
        List<Action> actions = Lists.newArrayList(a, b, c);
        Message message = new Message(actions);
        // run the list of actions.
        serverService.run(message, contextService.getCurrentContext(), sw, null);
        String returnValuea = "{\"actions\":[";
        String returnValueb = returnValuea + "{\"action\":\"firstaction\"}";
        String returnValuec = returnValueb + ",{\"action\":\"secondaction\"}";

        List<String> returnValueList = Arrays.asList(returnValuea, returnValueb, returnValuec);
        for (int i = 0; i < actions.size(); i++) {
            Action act = actions.get(i);
            assertEquals("get different action return on i:" + i,
                    returnValueList.get(i), ((String) act.getReturnValue()).replaceAll("\\s+", ""));
        }

        validateEmptyActionSerialization(sw.toString(), null,
                Arrays.asList("first action", "second action", "third action"));
    }

    /**
     * This test is for W-2063110 Running the same action twice in a list since we output right after the run, we can
     * reuse the action. the second run will over-write the previous run's returnValue(unless we change the run()), but
     * response keep the info from previous run, so we are good
     */
    @Test
    public void testSameActionTwice() throws Exception {
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        StringWriter sw = new StringWriter();
        Action a = new EmptyAction(sw, "first action", definitionService);
        Action b = new EmptyAction(sw, "second action", definitionService);
        List<Action> actions = Lists.newArrayList(a, b, a, b);
        Message message = new Message(actions);
        serverService.run(message, contextService.getCurrentContext(), sw, null);
        assertTrue(((EmptyAction) a).getCount() == 2);
        assertTrue(((EmptyAction) b).getCount() == 2);
        // in the old way since we output action info into response after all actions finish running, the previous run's
        // info will get overwrited
        // but this is not the case now
        // we need to verify when same action run twice, and something about the action changed between the two runs
        // --like the parameter,
        // the response has the action info for both times.
        validateEmptyActionSerialization(sw.toString(), null,
                Arrays.asList("first action", "second action", "first action{#2}", "second action{#2}"));

    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    @Test
    public void testSimpleAction() throws Exception {
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);

        Action a = new EmptyAction(definitionService);
        List<Action> actions = Lists.newArrayList(a);
        Message message = new Message(actions);
        StringWriter sw = new StringWriter();
        serverService.run(message, contextService.getCurrentContext(), sw, null);
        validateEmptyActionSerialization(sw.toString(), null, Arrays.asList("simpleaction"));
    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    @Test
    public void testSimpleActionWithExtras() throws Exception {
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);

        Action a = new EmptyAction(definitionService);
        List<Action> actions = Lists.newArrayList(a);
        Map<String, String> extras = Maps.newHashMap();
        Message message = new Message(actions);
        StringWriter sw = new StringWriter();
        extras.put("this", "that");
        serverService.run(message, contextService.getCurrentContext(), sw, extras);

        Map<String, Object> json = validateEmptyActionSerialization(sw.toString(), Sets.newHashSet("this"),
                Arrays.asList("simpleaction"));
        assertEquals("Expected extras to be in " + json, "that", json.get("this"));
    }

    /**
     * Sanity check to make sure that app.css does not have duplicate copy of component CSS. Component CSS was being
     * added twice, once because they were part of preload namespace and a second time because of component dependency.
     * This test mocks such duplication. W-1588568
     */
    @Test
    public void testWriteCssWithoutDupes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService
                .getDefDescriptor("preloadTest:test_SimpleApplication", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);

        StringWriter output = new StringWriter();
        serverService.writeAppCss(dependencies, output);

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
    @Test
    public void testCSSOrder() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService
                .getDefDescriptor("auratest:test_SimpleServerRenderedPage", ApplicationDef.class);
        DefDescriptor<ComponentDef> grandparent = definitionService
                .getDefDescriptor("setAttributesTest:grandparent", ComponentDef.class);
        DefDescriptor<ComponentDef> parent = definitionService
                .getDefDescriptor("setAttributesTest:parent", ComponentDef.class);
        DefDescriptor<ComponentDef> child1 = definitionService
                .getDefDescriptor("setAttributesTest:child", ComponentDef.class);
        DefDescriptor<ComponentDef> child2 = definitionService
                .getDefDescriptor("setAttributesTest:anotherChild", ComponentDef.class);
        contextService.startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);

        Set<DefDescriptor<?>> writable = Sets.newLinkedHashSet();

        writable.add(definitionService.getDefinition(child1).getStyleDef().getDescriptor());
        writable.add(definitionService.getDefinition(grandparent).getStyleDef().getDescriptor());
        writable.add(definitionService.getDefinition(parent).getStyleDef().getDescriptor());
        writable.add(definitionService.getDefinition(child2).getStyleDef().getDescriptor());

        StringWriter output = new StringWriter();
        serverService.writeAppCss(writable, output);
        String css = output.toString();

        //
        // order should be exactly that above.
        // child1, grandparent, parent, child2
        //
        assertTrue("child CSS should be written before grandparent CSS in: " + css,
                css.indexOf(".setAttributesTestChild") < css.indexOf(".setAttributesTestGrandparent"));
        assertTrue("grandparent CSS should be written before parent CSS in: " + css,
                css.indexOf(".setAttributesTestGrandparent") < css.indexOf(".setAttributesTestParent"));
        assertTrue("parent CSS should be written before another child CSS in: " + css,
                css.indexOf(".setAttributesTestParent") < css.indexOf(".setAttributesTestAnotherChild"));
    }

    @Test
    public void testPreloadCSSDependencies() throws Exception {
        DefDescriptor<ComponentDef> appDesc = definitionService
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);

        StringWriter output = new StringWriter();
        serverService.writeAppCss(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");
        String preloaded1 = ".clientApiTestCssStyleTest{background-color:#eee}";
        String preloaded2 = ".testTestValidCSS{color:#1797c0";
        assertTrue("Does not have preloaded css (1) in " + output, sourceNoWhitespace.contains(preloaded1));
        assertTrue("Does not have preloaded css (2) in " + output, sourceNoWhitespace.contains(preloaded2));
    }

    /**
     * Sanity check to make sure that app.js doesn't blow up
     */
    @Test
    public void testWriteDefinitionsWithoutDupes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService
                .getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);

        // prime def cache
        StringWriter output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);
        String text = output.toString();
        final String dupeCheck = "$A.clientService.initDefs(";
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }

        // now check that defs not re-written with unempty cache
        output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);
        text = output.toString();
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }
    }

    /**
     * Verify that toggling whether LockerService is enabled or not returns a different result from writeDefinitions
     */
    @Test
    public void testWriteDefinitionsLockerServiceCacheBuster() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = definitionService
                .getDefDescriptor("lockerTest:basicTest", ComponentDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, cmpDesc);
        final String uid = definitionService.getUid(null, cmpDesc);
        context.addLoaded(cmpDesc, uid);
        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);

        // get defs with LockerService enabled
        getMockConfigAdapter().setLockerServiceEnabled(true);
        StringWriter output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);
        String firstOutput = output.toString();

        // now get defs with LockerService disabled
        getMockConfigAdapter().setLockerServiceEnabled(false);
        output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);
        String secondOutput = output.toString();

        assertFalse("Expected writeDefinitions output to change after modifying LockerService cache buster",
                firstOutput.equals(secondOutput));
    }

    /**
     * Verify that metrics service writes data out.
     */
    @Test
    public void testWriteDefinitionsMetricsWithDevMode() throws Exception {
        Action action = new EmptyAction(definitionService);
        Message message = new Message(Lists.newArrayList(action));
        DefDescriptor<ComponentDef> cmpDesc = definitionService
                .getDefDescriptor("lockerTest:basicTest", ComponentDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, cmpDesc);

        // get defs with LockerService enabled
        getMockConfigAdapter().setIsProduction(false);
        StringWriter output = new StringWriter();
        serverService.run(message, context, output, null);
        String outputStr = output.toString();
        JsonStreamReader reader = new JsonStreamReader(new ByteArrayInputStream(outputStr.getBytes()));
        reader.next();
        Map<String,Object> outputObj = reader.getObject();
        assertNotNull(outputObj);
        assertNotNull(outputObj.get("perf"));
    }

    /**
     * Verify that metrics service does not write anything out.
     */
    @Test
    public void testWriteDefinitionsNoMetricsWithProdMode() throws Exception {
        Action action = new EmptyAction(definitionService);
        Message message = new Message(Lists.newArrayList(action));
        DefDescriptor<ComponentDef> cmpDesc = definitionService
                .getDefDescriptor("lockerTest:basicTest", ComponentDef.class);
        AuraContext context = contextService
                .startContext(Mode.PROD, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, cmpDesc);

        // get defs with LockerService enabled
        getMockConfigAdapter().setIsProduction(true);
        StringWriter output = new StringWriter();
        serverService.run(message, context, output, null);
        String outputStr = output.toString();
        JsonStreamReader reader = new JsonStreamReader(new ByteArrayInputStream(outputStr.getBytes()));
        reader.next();
        Map<String,Object> outputObj = reader.getObject();
        assertNotNull(outputObj);
        assertNull(outputObj.get("perf"));
    }

    @Test
    public void testPreloadJSDependencies() throws Exception {
        DefDescriptor<ComponentDef> appDesc = definitionService
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.DEV, AuraContext.Format.JS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);
        definitionService.getDefinition(appDesc);

        StringWriter output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");

        String[] preloads = new String[] {
                "\"descriptor\":\"markup://aura:placeholder\"",
                "\"descriptor\":\"markup://ui:input\"",
                "\"descriptor\":\"markup://ui:inputText\"",
                "\"descriptor\":\"markup://ui:outputText\"",
                "\"descriptor\":\"markup://test:testValidCSS\""
        };

        for (String preload : preloads) {
            assertTrue("Does not have preloaded component: (" + preload + ")", sourceNoWhitespace.contains(preload));
        }
    }

    /**
     * Tests aura definitions has no syntax errors and can be compressed
     */
    @Test
    public void testNoAppJSCompressionErrors() throws Exception {
        // check js compression on main aura namespaces
        String[] namespaces = new String[] { "aura", "ui",
                "auradev", "auradocs", "auraStorage" };

        StringBuilder source = new StringBuilder();
        source.append("<aura:application>");
        for (String ns : namespaces) {
            source.append(String.format(
                    "<aura:dependency resource=\"%s:*\" type=\"*\" />", ns));
        }
        source.append("</aura:application>");

        String js = getDefinitionsOutput(source.toString(),
                AuraContext.Mode.PROD);
//        assertFalse(
//                "There are syntax errors preventing compression of application javascript",
//                js.contains("There are errors preventing this file from being minimized!"));
    }

    /**
     * When we write out the application javascript we should only include component classes once per component.
     */
    // @Test
    // public void testNoComponentClassDuplicate() throws Exception {
    //     Object componentClass = null;
    //     Boolean found = false;
    //     String js = getDefinitionsOutput(
    //             "<aura:application></aura:application>", AuraContext.Mode.DEV);

    //     assertTrue("aura:html component class not included in app js",
    //             js.contains("addComponentClass(\"markup://aura:html"));

    //     String start = "$A.clientService.initDefs(";
    //     int index = js.indexOf(start);
    //     String componentDefs = js.substring(index + start.length(),
    //             js.length() - 4);
    //     Map<?, ?> json = (Map<?, ?>) new JsonReader().read(componentDefs);
    //     List<?> defs = (List<?>) json.get("componentDefs");

    //     for (Object def : defs) {
    //         String desc = (String) ((Map<?, ?>) def).get("descriptor");
    //         if (desc.equals("markup://aura:html")) {
    //             componentClass = ((Map<?, ?>) def).get("componentClass");
    //             found = true;
    //         }
    //     }

    //     assertTrue("No aura:html componentDef entry found", found);
    //     assertNull(
    //             "Duplicate component class entires for aura:html in application javascript",
    //             componentClass);
    // }

    /**
     * This is verification for W-2657282. The bug was when an IOException is thrown in try block,
     * a new exception may be thrown in finally block, so the new exception will hide the original
     * exception.
     * Verify the original (real) IO exception is thrown from method run.
     */
    @Test
    public void testThrowsOriginalIOExceptionFromRun() throws Exception {
        String exceptionMessage = "Test exception";
        contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Writer writer = mock(Writer.class);
        when(writer.append('{')).thenThrow(new IOException(exceptionMessage));
        Message message = new Message(new ArrayList<Action>());
        try {
            serverService.run(message, contextService.getCurrentContext(), writer, null);
            fail("Exception should be thrown from method run().");
        } catch(IOException e) {
            assertEquals(exceptionMessage, e.getMessage());
        }
    }

    private String getDefinitionsOutput(String source, AuraContext.Mode mode)
            throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(
                ApplicationDef.class, source);
        AuraContext context = contextService.startContext(mode,
                AuraContext.Format.JS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Set<DefDescriptor<?>> dependencies = definitionService.getDependencies(uid);

        StringWriter output = new StringWriter();
        serverService.writeDefinitions(dependencies, output, false, -1);

        return output.toString();
    }

    @Test
    public void testWriteTemplateHasCsrfTokenIfAppcacheNotEnabled() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "useAppCache='false' render='client'", ""));
        AuraContext context = contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        context.setApplicationDescriptor(appDesc);
        ApplicationDef appDef = definitionService.getDefinition(appDesc);

        Component template = serverService.writeTemplate(context , appDef, null, null);

        String init = (String)template.getAttributes().getValue("auraInit");
        @SuppressWarnings("unchecked")
        Map<String,Object> initMap = (Map<String, Object>) new JsonReader().read(init);

        assertEquals("Token should be sent if appcache is not enabled", "aura", initMap.get("token"));
    }

    @Test
    public void testWriteTemplateHasNoCsrfTokenIfAppcacheEnabled() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "useAppCache='true' render='client'", ""));
        AuraContext context = contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        context.setApplicationDescriptor(appDesc);
        ApplicationDef appDef = definitionService.getDefinition(appDesc);

        Component template = serverService.writeTemplate(context , appDef, null, null);

        String init = (String)template.getAttributes().getValue("auraInit");
        @SuppressWarnings("unchecked")
        Map<String,Object> initMap = (Map<String, Object>) new JsonReader().read(init);

        assertEquals("Token should not be sent if appcache is enabled", false, initMap.containsKey("token"));
    }

    @Test
    public void testWriteTemplateHasPrefetchTagsForClientLibraries() throws Exception {
        // Arrange
        String appMarkup = "<aura:application><aura:clientLibrary name='CkEditor' type='JS' /></aura:application>";
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        context.setApplicationDescriptor(appDesc);
        definitionService.updateLoaded(appDesc);

        // Act
        ApplicationDef appDef = definitionService.getDefinition(appDesc);
        Component template = serverService.writeTemplate(context , appDef, null, null);

        // Assert
        String actual = template.getAttributes().getValue("prefetchTags").toString();
        assertThat(actual, CoreMatchers.containsString("ckeditor.js"));
    }
    

    @Test
    public void testWriteTemplateExcludesPrefetchFalseTagsForClientLibraries() throws Exception {
        // Arrange
        String appMarkup = "<aura:application><aura:clientLibrary name='CkEditor' type='JS' prefetch='false' /></aura:application>";
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        context.setApplicationDescriptor(appDesc);
        definitionService.updateLoaded(appDesc);

        // Act
        ApplicationDef appDef = definitionService.getDefinition(appDesc);
        Component template = serverService.writeTemplate(context , appDef, null, null);

        // Assert
        String actual = template.getAttributes().getValue("prefetchTags").toString();
        assertThat(actual, CoreMatchers.not(CoreMatchers.containsString("ckeditor.js")));
    }
}
