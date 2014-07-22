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
import java.util.Arrays;
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
import org.auraframework.instance.ActionDelegate;
import org.auraframework.instance.Component;
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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class ServerServiceImplTest extends AuraImplTestCase {
    public ServerServiceImplTest(String name) {
        super(name, false);
    }

    private static final Set<String> GLOBAL_IGNORE = Sets.newHashSet("context", "actions");
    
    // Do not test for null message, it cannot legally be null.
    private static class EmptyActionDef implements ActionDef {
		private static final long serialVersionUID = 1L;
		StringWriter sw;
		String name;
		
		protected EmptyActionDef(StringWriter sw,String name) {
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
    
   

    private static class EmptyAction extends AbstractActionImpl<EmptyActionDef> {
        private String returnValue="";
        private Integer count=0;
        private String parameter="";
        
        public EmptyAction(StringWriter sw, String name) {
            super(null, new EmptyActionDef(sw,name), null);
        }
		
		public EmptyAction() {
            super(null, new EmptyActionDef(null,"simpleaction"), null);
        }
		
		public Integer getCount() {
			return this.count;
		}

		public String getName() {
			return this.actionDef.getName();
		}
		
        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return Aura.getDefinitionService().getDefDescriptor("java://aura.empty/ACTION$emptyAction", ActionDef.class);
        }

        @Override
        public void run() throws AuraExecutionException {
        	this.count++;
        	if(this.actionDef.sw!=null) {
        		this.returnValue = this.actionDef.sw.toString();
        	} else {
        		//do nothing
        	}
        	if(this.count>1) {
        		setParameter("#"+this.count);
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
            Map<String,String> value = Maps.newHashMap();
            String res=this.getName();
            if(this.parameter!="") { res=res.concat("{"+this.parameter+"}"); }
            value.put("action", res);
            json.writeValue(value);
        }
    };

    private static class ShareCmpAction extends ActionDelegate {

    	private Map<String,Object> componentAttributes = null;
    	private Component sharedCmp = null;
    	private Object returnValue = null;
    	private String name="ShareCmpAction";
    	
    	public ShareCmpAction(String name, Action originalAction, Component sharedCmp, Map<String,Object> componentAttributes) {
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
			if(startPos >=0 ) {
				this.returnValue = whatIsInResponse.substring(startPos);
			}
		}

		@Override
		public Object getReturnValue() {
			return this.returnValue;
		}
		
		@Override
		public void serialize(Json json) throws IOException {
			Map<String,Object> value = Maps.newHashMap();
			value.put("shared_component", this.sharedCmp);
			value.put("action", this.name);
            json.writeValue(value);
		}
    }

    /**
     * Test for W-2085617
     * This test is to verify when we have shared component between actions, they get serialized into response correctly.
     * 
     * Test Setup: 
     * EmptyAction a,b,c : when it run, it put whatever response has into their return value
     * ShareCmpAction d,e,f: when it run, it update the attribute of shared component, run its delegate action(a,b orc),
     * then get the latest shared_component(in Json format) from its delegate action's return value as its return value.
     * 
     * when b runs, a has finish running, so b will have shared_component of a
     * e will have shared_component of a in its return value (with attrA)
     * when c runs, b has finish running, so c will have shared_components of a & b
     * e will have shared_component of b in its return value (with attrB)
     * @throws Exception
     */
    public void testSharedCmp() throws Exception {
    	Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    	Map<String, Object> attributes = Maps.newHashMap();
    	Map<String, Object> attributesA = Maps.newHashMap();
    	attributesA.put("attr", "attrA");
    	Map<String, Object> attributesB = Maps.newHashMap();
    	attributesB.put("attr", "attrB");
    	Map<String, Object> attributesC = Maps.newHashMap();
    	attributesC.put("attr", "attrC");
		Component sharedCmp = Aura.getInstanceService().getInstance("ifTest:testIfWithModel", ComponentDef.class,
                attributes);
    	StringWriter sw = new StringWriter();
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction(sw,"first action");
        Action b = new EmptyAction(sw,"second action");
        Action c = new EmptyAction(sw,"third action");
        Action d = new ShareCmpAction("d",a,sharedCmp,attributesA);
        Action e = new ShareCmpAction("e",b,sharedCmp,attributesB);
        Action f = new ShareCmpAction("f",c,sharedCmp,attributesC);
        List<Action> actions = Lists.newArrayList(d,e,f);
        Message message = new Message(actions);
        //run the list of actions. 
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, null);
        
        //sanity check, sharedCmp should have the latest attribute value. 
        //this has nothing to do with the fix though
        assertEquals("attrC",sharedCmp.getAttributes().getValue("attr"));
        //Here are the checks for fix
        //returnValue of action e is going to have shared component from action d in Json format
        String returne = (String) e.getReturnValue();
        assertTrue(returne.contains("markup://ifTest:testIfWithModel"));
        assertTrue(returne.contains("\"attr\":\"attrA\""));
        //returnValue of action f is going to have shared component from action e in Json format
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
    private Map<String,Object> validateEmptyActionSerialization(String serialized, Set<String> ignore, 
    		List<String> actionNameList) {
    	int actionNumber = actionNameList.size();
        Set<String> extras = Sets.newHashSet();
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(serialized);
        List<Object> actions = (List<Object>) json.get("actions");
        assertTrue(actions != null);
        assertTrue("expected "+actionNumber+" action, but get "+actions.size(), actions.size() == actionNumber);
        for(int i=0;i<actionNumber;i++) {
            Map<String, Object> action = (Map<String, Object>) actions.get(i);
        	assertEquals("didn't get expecting action on i:"+i, 
        			actionNameList.get(i), action.get("action"));
        }
        for (String key : json.keySet()) {
            if (!GLOBAL_IGNORE.contains(key) && (ignore == null || !ignore.contains(key))) {
                extras.add(key);
            }
        }
        assertTrue("Expected no extra keys, found: "+extras+", in: "+json, extras.isEmpty());
        return json;
    }
    
    /**
     * This test is for W-2063110
     * Test a list of actions.
     * New Way : in ServerService, we serialize each action and write it into response (via a string writer) 
     * right after it finish running. 
     * in the SimpleAction above, we put whatever we have in the string writer as returnValue of the current action
     * so when Action2 is running, we should have Action1 in string writer, 
     * when Action3 is running, we should have both Action1 and Action2, ....
     * Old Way: We used to run all actions, store the result in Message, then write them into response at once,
     * in the old way we won't have anything in string writer/response until Action3 is finished.
     */
    public void testMultipleActions() throws Exception {
    	Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    	StringWriter sw = new StringWriter();
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction(sw,"first action");
        Action b = new EmptyAction(sw,"second action");
        Action c = new EmptyAction(sw,"third action");
        List<Action> actions = Lists.newArrayList(a,b,c);
        Message message = new Message(actions);
        //run the list of actions. 
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, null);
        String returnValuea = "{\"actions\":[";
        String returnValueb = returnValuea+"{\"action\":\"firstaction\"}";
        String returnValuec = returnValueb+",{\"action\":\"secondaction\"}";
        
        List<String> returnValueList = Arrays.asList(returnValuea,returnValueb,returnValuec);
        for(int i=0;i<actions.size();i++) {
        	Action act = actions.get(i);
        	assertEquals("get different action return on i:"+i,
        			returnValueList.get(i),((String)act.getReturnValue()).replaceAll("\\s+", ""));
        }
        
        validateEmptyActionSerialization(sw.toString(), null, Arrays.asList("first action","second action","third action"));
    }
    
    
    /**
     * This test is for W-2063110
     * Running the same action twice in a list
     * since we output right after the run, we can reuse the action. 
     * the second run will over-write the previous run's returnValue(unless we change the run()), 
     * but response keep the info from previous run, so we are good
     */
    public void testSameActionTwice() throws Exception {
    	Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    	StringWriter sw = new StringWriter();
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction(sw,"first action");
        Action b = new EmptyAction(sw,"second action");
        List<Action> actions = Lists.newArrayList(a,b,a,b);
        Message message = new Message(actions);
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, null);
        assertTrue(((EmptyAction)a).getCount()==2);
        assertTrue(((EmptyAction)b).getCount()==2);
        //in the old way since we output action info into response after all actions finish running, the previous run's info will get overwrited
        //but this is not the case now
        //we need to verify when same action run twice, and something about the action changed between the two runs --like the parameter, 
        //the response has the action info for both times.
        validateEmptyActionSerialization(sw.toString(), null, 
        		Arrays.asList("first action","second action","first action{#2}","second action{#2}"));
  
    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    public void testSimpleAction() throws Exception {
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);

        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction();
        List<Action> actions = Lists.newArrayList(a);
        Message message = new Message(actions);
        StringWriter sw = new StringWriter();
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, null);
        validateEmptyActionSerialization(sw.toString(), null, Arrays.asList("simpleaction"));
    }

    /**
     * Test a simple action that serializes a specific value.
     *
     * We carefully test only the parts that we care about for ServerService.
     */
    public void testSimpleActionWithExtras() throws Exception {
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    	
        ServerService ss = Aura.getServerService();
        Action a = new EmptyAction();
        List<Action> actions = Lists.newArrayList(a);
        Map<String,String> extras = Maps.newHashMap();
        Message message = new Message(actions);
        StringWriter sw = new StringWriter();
        extras.put("this", "that");
        ss.run(message, Aura.getContextService().getCurrentContext(), sw, extras);

        Map<String, Object> json = validateEmptyActionSerialization(sw.toString(), Sets.newHashSet("this"),Arrays.asList("simpleaction"));
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
        assertTrue("Does not have preloaded css (1) in "+output, sourceNoWhitespace.contains(preloaded1));
        assertTrue("Does not have preloaded css (2) in "+output, sourceNoWhitespace.contains(preloaded2));
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
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.JS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        StringWriter output = new StringWriter();
        ss.writeDefinitions(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");

        String[] preloads = new String[]{
                "\"descriptor\":\"markup://aura:placeholder\"",
                "\"descriptor\":\"markup://ui:input\"",
                "\"descriptor\":\"markup://ui:inputText\"",
                "\"descriptor\":\"markup://ui:output\"",
                "\"descriptor\":\"markup://ui:outputText\"",
                "\"descriptor\":\"markup://test:testValidCSS\""
        };

        for (String preload : preloads) {
            assertTrue("Does not have preloaded component: (" + preload + ")" , sourceNoWhitespace.contains(preload));
        }
    }

    /**
     * Tests aura definitions has no syntax errors and can be compressed
     */
    public void testNoAppJSCompressionErrors() throws Exception {

        // check js compression on main aura namespaces
        String[] namespaces = new String[] {
            "aura", "ui", "auraadmin", "auradev", "auradocs", "auraStorage"
        };

        StringBuilder source = new StringBuilder();
        source.append("<aura:application>");
        for (String ns : namespaces) {
            source.append(String.format("<aura:dependency resource=\"%s:*\" type=\"*\" />", ns));
        }
        source.append("</aura:application>");

        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, source.toString());
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.PROD, AuraContext.Format.JS,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        ServerService ss = Aura.getServerService();
        StringWriter output = new StringWriter();
        ss.writeDefinitions(dependencies, output);

        String js = output.toString();
        assertFalse("There are syntax errors preventing compression of application javascript",
            js.contains("There are errors preventing this file from being minimized!"));
    }
}
