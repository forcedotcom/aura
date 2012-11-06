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
package org.auraframework.impl.java.controller;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

@Controller
public class TestControllerLocalization {

    static Log log = LogFactory.getLog(Aura.class);

    @AuraEnabled
    public static void noArgs() {

    }

    @AuraEnabled
    public static Object getComponents(@Key("token") String token, @Key("input") String input) throws Exception {
        int count = Integer.parseInt(input);
        List<Component> cmps = new LinkedList<Component>();
        while (count-- > 0) {
            Component cmp = Aura.getInstanceService().getInstance("auratest:text", ComponentDef.class);
            Object val = token + ":java:" + count;
            Map<String, Object> atts = ImmutableMap.of("value", val);
            cmp.getAttributes().set(atts);
            cmps.add(cmp);
        }
        return cmps.toArray();
    }

    @AuraEnabled
    public static String getString(@Key("param") String param) throws Exception {
        return param;
    }

    @AuraEnabled
    public static int getInt(@Key("param") int param) throws Exception {
        return param;
    }

    @AuraEnabled
    public static void throwsThrowable(@Key("token") String token, @Key("input") String input) {
        throw new RuntimeException();
    }

    private static Map<String, StringBuffer> buffers = Maps.newLinkedHashMap();

    @AuraEnabled
    public static String getBuffer() throws Exception {
        String id = UUID.randomUUID().toString();
        buffers.put(id, new StringBuffer());
        return id;
    }

    @AuraEnabled
    public static void deleteBuffer(@Key("id") String id) throws Exception {
        buffers.remove(id);
    }

    /**
     * Wait for delayMs milliseconds and then return a auratest:text component whose value is the current buffer
     * contents plus the current append.
     */
    @AuraEnabled
    public static Component appendBuffer(@Key("id") String id, @Key("delayMs") BigDecimal delayMs,
            @Key("append") String append) throws Exception {
        StringBuffer buffer = buffers.get(id);
        buffer.append(append);
        long delay = delayMs.longValue();
        if (delay > 0) Thread.sleep(delay);
        Map<String, Object> atts = ImmutableMap.of("value", (Object)(buffer + "."));
        return Aura.getInstanceService().getInstance("auratest:text", ComponentDef.class, atts);
    }

    @AuraEnabled
    public static Boolean echoCheckbox(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public static BigDecimal echoCurrency(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public static BigDecimal echoDecimal(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Date echoDate(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Date echoTime(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Date echoDateTime(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoEmail(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static BigDecimal echoNumber(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoNumberString(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static BigDecimal echoPercentString(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoDateString(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Boolean echoOption(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public static BigDecimal echoPercent(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoPhone(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoPicklist(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoSearch(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoSecret(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoSelect(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoSelectMulti(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Boolean echoSelectOption(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoText(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoTextArea(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoUrl(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public static Component getInputNumberCmp(@Key("value") BigDecimal value, @Key("step") BigDecimal step, @Key("max") BigDecimal max, @Key("min") BigDecimal min) throws DefinitionNotFoundException, QuickFixException {
        log.info("api:getInputNumberCmp values received on server:"+" value:"+value+" step:"+step+" max:"+max+" min:"+min);
        Map<String, Object> attributes = Maps.newHashMap();
        Component inputNumCmp = null;

        attributes.put("value", value);
        attributes.put("aura:id", "inputNumber");
        attributes.put("step", step);
        attributes.put("max", max);
        attributes.put("min", min);
        inputNumCmp = Aura.getInstanceService().getInstance("ui:inputNumber", ComponentDef.class, attributes);

        return inputNumCmp;
    }

    @AuraEnabled
    public static Component getOutputNumberCmp(@Key("inVar") BigDecimal inVar) throws DefinitionNotFoundException, QuickFixException {
        log.info("getOutputNumberCmp value received on server:"+inVar);
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputCmp = null;
        try{
            attributes.put("value", inVar);
            outputCmp = Aura.getInstanceService().getInstance("ui:outputNumber", ComponentDef.class, attributes);
        }
        catch(Exception nfe){
            StringWriter errors = new StringWriter();
            nfe.printStackTrace(new PrintWriter(errors));

            attributes.clear();
            attributes.put("title", errors.toString());
            attributes.put("severity", "error");
            outputCmp = Aura.getInstanceService().getInstance("ui:message", ComponentDef.class, attributes);
        }
        return outputCmp;
    }


    @AuraEnabled
    public static Component getOutputPercentStringCmp(@Key("inVar") BigDecimal inVar) throws DefinitionNotFoundException, QuickFixException {
        log.info("api:getOutputPercentStringCmp value received on server:"+inVar);
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputCmp = null;
        try{
            attributes.put("value", inVar);
            outputCmp = Aura.getInstanceService().getInstance("ui:outputPercent", ComponentDef.class, attributes);
        }
        catch(Exception nfe){
            StringWriter errors = new StringWriter();

            attributes.clear();
            attributes.put("title", errors.toString());
            attributes.put("severity", "error");
            outputCmp = Aura.getInstanceService().getInstance("ui:message", ComponentDef.class, attributes);
        }
        return outputCmp;
    }

    @AuraEnabled
    public static Component getOutputDateCmp(@Key("inVar") Date inVar) throws DefinitionNotFoundException, QuickFixException {
        log.info("api:getOutputDateCmp value received on server:"+inVar);
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputDateCmp = null;

        attributes.put("value", inVar);
        try{
            outputDateCmp = Aura.getInstanceService().getInstance("ui:outputDate", ComponentDef.class, attributes);
        }
        catch(Exception e){
        }
        return outputDateCmp;
    }

    @AuraEnabled
    public static Component getOutputTimeCmp(@Key("inVar") Date inVar) throws DefinitionNotFoundException, QuickFixException {
        log.info("api:getOutputDateTimeCmp value received on server:"+inVar);
        Map<String, Object> attributes = Maps.newHashMap();

        Component outputDateCmp = null;
        long time = inVar.getTime();
        Calendar c = Calendar.getInstance();
        c.setTime(new Date(time));
        attributes.put("value", inVar);
        try{
            outputDateCmp = Aura.getInstanceService().getInstance("ui:outputDateTime", ComponentDef.class, attributes);
        }
        catch(Exception e){
        }
        return outputDateCmp;
    }

    @AuraEnabled
    public static Component getOutputDateTimeCmp(@Key("inVar") Date inVar) throws DefinitionNotFoundException, QuickFixException {
        log.info("api:getOutputDateTimeCmp value received on server:"+inVar);
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputDateCmp = null;

        long time = inVar.getTime();
        Calendar c = Calendar.getInstance();
        c.setTime(new Date(time));
        attributes.put("value", c);
        try{
            outputDateCmp = Aura.getInstanceService().getInstance("ui:outputDateTime", ComponentDef.class, attributes);
        }
        catch(Exception e){
        }
		return outputDateCmp;
	}
    
    @AuraEnabled
    public static Component getOutputCurrencyCmp(@Key("inVar") BigDecimal inVar) throws DefinitionNotFoundException, QuickFixException {
		log.info("api:getOutputCurrencyCmp value received on server:"+inVar);
		Map<String, Object> attributes = Maps.newHashMap();
        Component outputCmp = null;
        try{
        	attributes.put("value", inVar);
        	outputCmp = Aura.getInstanceService().getInstance("ui:outputCurrency", ComponentDef.class, attributes);
        }
        catch(Exception nfe){
        	StringWriter errors = new StringWriter();
        	nfe.printStackTrace(new PrintWriter(errors));
        	
        	attributes.clear();
        	attributes.put("title", errors.toString());
        	attributes.put("severity", "error");
        	outputCmp = Aura.getInstanceService().getInstance("ui:message", ComponentDef.class, attributes);
        }
		return outputCmp;
	}
	
	@AuraEnabled
	public static Component getOutputPercentCmp(@Key("inVar") BigDecimal inVar) throws DefinitionNotFoundException, QuickFixException {
		log.info("api:getOutputPercentCmp value received on server:"+inVar);
		Map<String, Object> attributes = Maps.newHashMap();
        Component outputCmp = null;
        try{
        	attributes.put("value", inVar);
        	outputCmp = Aura.getInstanceService().getInstance("ui:outputPercent", ComponentDef.class, attributes);
        }
        catch(Exception nfe){
        	StringWriter errors = new StringWriter();
        	
        	attributes.clear();
        	attributes.put("title", errors.toString());
        	attributes.put("severity", "error");
        	outputCmp = Aura.getInstanceService().getInstance("ui:message", ComponentDef.class, attributes);
        }
		return outputCmp;
	}
}
