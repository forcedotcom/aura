package org.auraframework.perfTest;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Maps;

public class PerfMetricsBaseTest extends WebDriverTestCase {
	public PerfMetricsBaseTest(String name){
		super(name);
	}
	protected void output(Map<String,String> logStats)throws Exception{
		logStats.put("Commit", getCommitAndDate());
		logStats.put("TestName", getName());
		logStats.put("BrowserType", this.getBrowserType().toString());
		System.out.println(logStats);
	}
	protected void clearStats(){
		auraUITestingUtil.getEval("Jiffy.removeStats()");
	}
	protected Map<String, String> getJiffyStats(ArrayList<String> transactionsToGather){
		return getJiffyStats(null, transactionsToGather);
	}
	protected Map<String, String> getJiffyStats(String stage, ArrayList<String> transactionsToGather){
		Map<String,String> stats = Maps.newHashMap();
		String json = auraUITestingUtil.getEval("return JSON.stringify(Jiffy.toJson())").toString();
		String title = getName();
		json = json.replace("http://([^\"]*)", title);
		json = json.substring(1, json.length() -1);
		json = json.replace("\\\"", "\"");
		StringReader in = new StringReader(json);
		Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
		@SuppressWarnings("unchecked")
		ArrayList<HashMap<?,?>> measures = (ArrayList<HashMap<?,?>>)message.get("measures");
		for(HashMap<?,?> marks : measures){
			if(!transactionsToGather.isEmpty()){
				if(!transactionsToGather.contains(marks.get("measure"))){
					continue;
				}
			}
			String measureName = marks.get("measure").toString()+(stage!=null?("_"+stage):""); 
			stats.put(measureName, marks.get("et").toString());
		}
		return stats;
	}
	
	protected Map<String, String> makeBasePostParams() {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor",
                "java://org.auraframework.controller.java.StringSourceController/ACTION$getCommitSHAAndDate");
        Map<String, Object> actionParams = new HashMap<String, Object>();
        actionInstance.put("params", actionParams);
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = Json.serialize(message);
        Map<String, String> params = new HashMap<String, String>();
        params.put("message", jsonMessage);
        return params;
    }
	@SuppressWarnings("unchecked")
	protected String getCommitAndDate() throws Exception{
		Map<String, String> params = makeBasePostParams();
        params.put("aura.token", getCsrfToken());
        params.put("aura.context", String.format("{\"mode\":\"CADENCE\", \"fwuid\":\"%s\"}", Aura.getConfigAdapter().getAuraFrameworkNonce()));
        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        String rawResponse = getResponseBody(httpResponse);
        assertEquals(AuraBaseServlet.CSRF_PROTECT,
                rawResponse.substring(0, AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(rawResponse
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> action = (Map<String, Object>) ((List<Object>) json.get("actions")).get(0);
        String returnValue = (String)action.get("returnValue");
        EntityUtils.consume(httpResponse.getEntity());
        post.releaseConnection();
        return returnValue;
	}
	protected Map<String, String> getAuraStats(){
		return getAuraStats(null);
	}
	protected Map<String, String> getAuraStats(String stage){
		Map<String,String> stats = Maps.newHashMap();
		String counts = auraUITestingUtil.
						getEval("return [" +
								"$A.getQueryStatement().from('component').query().rowCount" +","+
								"$A.getQueryStatement().from('componentDef').query().rowCount" +","+
								"$A.getQueryStatement().from('controllerDef').query().rowCount" +","+
								"$A.getQueryStatement().from('modelDef').query().rowCount" +","+
								"$A.getQueryStatement().from('rendererDef').query().rowCount" +","+
								"$A.getQueryStatement().from('helperDef').query().rowCount" +","+
								"$A.getQueryStatement().from('providerDef').query().rowCount" +
								"]").toString();
		String[] count = counts.substring(1, counts.length()-1).split(",");
		String suffix = (stage!=null?("_"+stage):""); 
		stats.put(String.format("component%s",suffix), count[0]);
		stats.put(String.format("componentDef%s",suffix), count[1]);
		stats.put(String.format("controllerDef%s",suffix), count[2]);
		stats.put(String.format("modelDef%s",suffix), count[3]);
		stats.put(String.format("rendererDef%s",suffix), count[4]);
		stats.put(String.format("helperDef%s",suffix), count[5]);
		stats.put(String.format("providerDef%s",suffix), count[6]);
		return stats;
	}
}
