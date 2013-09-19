package org.auraframework.perfTest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.RendererDef;
import org.auraframework.http.AuraServlet;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class PerfAppStressTest extends PerfMetricsBaseTest {
	public PerfAppStressTest(String name){
		super(name);
	}
	private Set<DefDescriptor<?>> cleanUpDds;
	
	@Override
	public void tearDown() throws Exception {
        // Clean up any defs that were created on the test app server
        if (cleanUpDds != null && !cleanUpDds.isEmpty()) {
            removeSource(cleanUpDds);
            cleanUpDds.clear();
        }
        super.tearDown();
    }
	
	/**
	 * Test the breaking point when the component size expands like a tree(Increasing width)
	 *  <Level A>
	 *     <Level B/>
	 *     <Level B/>
	 *     <!--n times /-->
	 *  </Level A>
	 *     <Level B>
	 *     		<Level C/>
	 *     		<Level C/>
	 *     		<!--n times /-->
	 *     <Level B>
	 *      	Upto breaking point    
	 *      	<Level X>
	 *      
	 *      	</Level X>
	 *      
	 * Stress is on ComponentDef size     
	 */
	public void testTreeExpansion() throws Exception{
		int leaves = 3;
		int level = 10;
		Map<String,String> logStats = Maps.newHashMap();
		DefDescriptor<ComponentDef> testCmp = Aura.getDefinitionService().getDefDescriptor("aura:text", ComponentDef.class);
		for(int i=0; i<level; i++){
			testCmp = growComponentTree(testCmp, leaves, i);
			open(String.format("/%s/%s.cmp",testCmp.getNamespace(), testCmp.getName()), Mode.CADENCE);
			logStats.putAll(
					getJiffyStats("_"+i,Lists.newArrayList(
							"Json.resolveRefs",
							"ClientService.init",
							"PageStart",
							"Received Response - XHR 1",
							"t_onLoad","t_page", "t_done", 
							"Initial Component Created",
							"Initial Component Rendered",
							"Component Load Complete", //Currently not getting logged, gotto check
							"HistoryService.init",
							"LayoutService.init",
							"Aura.finishInit")));
			logStats.putAll(getAuraStats("_"+i));
			output(logStats);	
			getDriver().close();
			logStats.clear();
		}
	}
	
	private DefDescriptor<ComponentDef> growComponentTree(DefDescriptor<ComponentDef> innerCmp, int leaves, int level){
		//Do not worry about the correctness of this renderer, all we are trying to do is fatten up the component def
		String rendererMarkup = "({"+
									"render: function(component){"+
										"return this.superRender();"+
    								"},"+
    								"afterRender: function(component){"+
    									"this.superAfterRender();"+
									"},"+
									"rerender: function(component){"+
										"this.superRerender();"+
									"}"+
								"})";
		DefDescriptor<RendererDef> jsRndrDesc = addSource(null, rendererMarkup, RendererDef.class);
		
		//Do not worry about the correctness of this controller, all we are trying to do is fatten up the component def
		String controllerMarkup = "({"+
										"anyRandomFunction:function(cmp){"+
											"if(cmp.get(\"v.count\") === 0){"+
												"cmp.getAttributes().setValue(\"count\", 10);"+
	        								"}else{"+
	        									"cmp.getAttributes().setValue(\"count\", 5);"+
	        								"}"+
	    								"}," +
	    								"noOp:function(cmp){" +
	    								"}"+
        							"})";
		DefDescriptor<ControllerDef> jsCntrlrDesc = addSource(null, controllerMarkup, ControllerDef.class);
		
		String markupStub = 
				"<aura:component controller='%s' renderer='%s'> \n" +
						"<aura:registerevent name='press' type='ui:press'/>\n"+
						"<aura:registerevent name='click' type='ui:click'/>\n"+
						"<aura:handler event='aura:connectionLost' action='{!c.noOp}'/>\n"+
					    "<aura:handler event='aura:layoutFailed' action='{!c.noOp}'/>\n"+
					    "<aura:handler event='aura:invalidSession' action='{!c.noOp}'/>\n"+
					    "<aura:handler event='aura:doneWaiting' action='{!c.noOp}'/>\n"+
					    "<aura:handler event='aura:titleChange' action='{!c.noOp}'/>\n"+
						"<aura:attribute name='count' type='Integer' default='%s'/> \n" +
						"<aura:attribute name='data' type='List' default='1,2,3,4,5,6,7,8,9,10'/>\n"+
						"Level: %s\n"+
						"<aura:iteration items='{!v.data}' var='stuff' indexVar='index' start='0' end='{!v.count}'>\n"+
							"Leaf:{!stuff}<%s:%s/><p/>\n"+
						"</aura:iteration>\n"+
						"<br/>\n"+		
				"</aura:component>";
		DefDescriptor<ComponentDef> desc = addSource(null, 
				String.format(markupStub,
						jsCntrlrDesc.getQualifiedName(),
						jsRndrDesc.getQualifiedName(), 
						leaves,level, 
						innerCmp.getNamespace(), innerCmp.getName()), 
				ComponentDef.class);
		return desc;
	}
	
	/**
	 * Test the breaking point when the component size expands like a tower(Constant width)
	 *  <Level A>
	 *     <Level B/> <!--Only one instance-->
	 *  </Level A>
	 *     <Level B>
	 *     		<Level C/> <!--Only one instance-->
	 *     <Level B>
	 *      	Upto breaking point    
	 *      	<Level X>
	 *      
	 *      	</Level X>
	 * 	 
	 * Stress is on Number of ComponentDefs to resolve
	 */
	public void testTowerExpansion()throws Exception{
		int leaves = 1;
		int level = 50;
		Map<String,String> logStats = Maps.newHashMap();
		DefDescriptor<ComponentDef> testCmp = Aura.getDefinitionService().getDefDescriptor("aura:text", ComponentDef.class);
		for(int i=0; i<level; i++){
			//Skip 5 generations and gather data, we can go however finer we want
			for(int j=0; j< 5;j++){
				testCmp = growComponentTree(testCmp, leaves, i);
			}
			open(String.format("/%s/%s.cmp",testCmp.getNamespace(), testCmp.getName()), Mode.CADENCE);
			logStats.putAll(
					getJiffyStats("_"+i,Lists.newArrayList(
							"Json.resolveRefs",
							"ClientService.init",
							"PageStart",
							"Received Response - XHR 1",
							"t_onLoad","t_page", "t_done", 
							"Initial Component Created",
							"Initial Component Rendered",
							"Component Load Complete", //Currently not getting logged, gotto check
							"HistoryService.init",
							"LayoutService.init",
							"Aura.finishInit")));
			logStats.putAll(getAuraStats("_"+i));
			output(logStats);	
			getDriver().close();
			logStats.clear();
		}
	}
	/**
     * Since the aura app server is hosted as a seperate process, the test just uses a standalone controller to
     * add a new String source def on the app server.
     *
     * @param <T>
     * @param name
     *            name of the component/application/event. Any type of def with MARKUP://
     * @param contents
     * @param defClass
     * @return
     */
    @SuppressWarnings("unchecked")
    protected <T extends Definition> DefDescriptor<T> addSource(String name, String contents, Class<T> defClass) {
        Map<String, Object> actionParams = new HashMap<String, Object>();
        actionParams.put("name", name);
        actionParams.put("content", contents);
        actionParams.put("defType", DefType.getDefType(defClass));
        actionParams.put("lastModified", System.currentTimeMillis());
        String response = null;
        try {
        	HttpResponse httpResponse = executeServerAction(
                    "java://org.auraframework.controller.java.StringSourceController/ACTION$addSource", actionParams);
            response = getResponseBody(httpResponse);;
        } catch (Exception e) {
            fail(e.getMessage());
        }
        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(response
                .substring(AuraServlet.CSRF_PROTECT.length()));
        Object actionReturnValue = json.get("actions");
        assertTrue(actionReturnValue instanceof ArrayList);
        Map<String, Object> returnValue = (Map<String, Object>)((ArrayList<?>)actionReturnValue).get(0);
        assertTrue("Failed inserting contents to StringSource", returnValue.get("state").equals("SUCCESS"));

        DefDescriptor<T> dd = Aura.getDefinitionService().getDefDescriptor((String)returnValue.get("returnValue"),
                defClass);
        if (cleanUpDds == null) cleanUpDds = Sets.newHashSet();
        cleanUpDds.add(dd);
        return dd;
    }
    /**
     * Clean up defs created by tests.
     *
     * @param defs
     */
    @SuppressWarnings("unchecked")
    protected void removeSource(Set<DefDescriptor<?>> defs) {
        Map<String, Object> actionParams = new HashMap<String, Object>();
        List<String> namesToRemove = new ArrayList<String>();
        List<String> defType = new ArrayList<String>();
        Iterator<DefDescriptor<?>> it = defs.iterator();
        while (it.hasNext()) {
            DefDescriptor<?> dd = it.next();
            namesToRemove.add(dd.getQualifiedName());
            defType.add(dd.getDefType().name());
        }
        actionParams.put("names", namesToRemove);
        actionParams.put("defType", defType);
        String response = null;
        try {
        	HttpResponse httpResponse = executeServerAction(
                    "java://org.auraframework.controller.java.StringSourceController/ACTION$removeSource", actionParams);
            response = getResponseBody(httpResponse);
        } catch (Exception e) {
            fail(e.getMessage());
        }
        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(response
                .substring(AuraServlet.CSRF_PROTECT.length()));
        Object actionReturnValue = json.get("actions");
        assertTrue(actionReturnValue instanceof ArrayList);
        Map<String, Object> returnValue = (Map<String, Object>)((ArrayList<?>)actionReturnValue).get(0);
        assertTrue("Failed to clean up defs from StringSource", returnValue.get("state").equals("SUCCESS"));
        return;
    }
    @SuppressWarnings("rawtypes")
	protected HttpResponse executeServerAction(String qualifiedName , Map<String, Object> actionParams) throws Exception{
    	 Map<String, Object> message = new HashMap<String, Object>();
    	Map<String, Object> actionInstance = new HashMap<String, Object>();
    	actionInstance.put("descriptor", qualifiedName);
    	actionInstance.put("params", actionParams);
    	
    	Map[] actions = { actionInstance };
    	message.put("actions", actions);
    	String jsonMessage = Json.serialize(message);
    	Map<String, String> params = new HashMap<String, String>();
    	params.put("message", jsonMessage);
    	HttpPost post = null;
    	params.put("aura.token", getCsrfToken());
    	params.put("aura.context", String.format("{\"mode\":\"CADENCE\", \"fwuid\":\"%s\"}", Aura.getConfigAdapter().getAuraFrameworkNonce()));
        post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        return httpResponse;
    }
}
