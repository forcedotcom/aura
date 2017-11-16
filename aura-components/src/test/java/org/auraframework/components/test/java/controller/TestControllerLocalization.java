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
package org.auraframework.components.test.java.controller;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

@ServiceComponent
public class TestControllerLocalization implements Controller {

    @Inject
    private InstanceService instanceService;

    @AuraEnabled
    public void noArgs() {

    }

    @AuraEnabled
    public Object getComponents(@Key("token") String token, @Key("input") String input) throws Exception {
        int count = Integer.parseInt(input);
        List<Component> cmps = new LinkedList<>();
        while (count-- > 0) {
            Component cmp = instanceService.getInstance("auratest:text", ComponentDef.class);
            Object val = token + ":java:" + count;
            Map<String, Object> atts = ImmutableMap.of("value", val);
            cmp.getAttributes().set(atts);
            cmps.add(cmp);
        }
        return cmps.toArray();
    }

    @AuraEnabled
    public String getString(@Key("param") String param) throws Exception {
        return param;
    }

    @AuraEnabled
    public int getInt(@Key("param") int param) throws Exception {
        return param;
    }

    @AuraEnabled
    public void throwsThrowable(@Key("token") String token, @Key("input") String input) {
        throw new RuntimeException();
    }

    private static Map<String, StringBuffer> buffers = Maps.newLinkedHashMap();

    @AuraEnabled
    public String getBuffer() throws Exception {
        String id = UUID.randomUUID().toString();
        buffers.put(id, new StringBuffer());
        return id;
    }

    @AuraEnabled
    public void deleteBuffer(@Key("id") String id) throws Exception {
        buffers.remove(id);
    }

    /**
     * Wait for delayMs milliseconds and then return a auratest:text component
     * whose value is the current buffer contents plus the current append.
     */
    @AuraEnabled
    public Component appendBuffer(@Key("id") String id, @Key("delayMs") BigDecimal delayMs,
                                  @Key("append") String append) throws Exception {
        StringBuffer buffer = buffers.get(id);
        buffer.append(append);
        long delay = delayMs.longValue();
        if (delay > 0) {
            Thread.sleep(delay);
        }
        Map<String, Object> atts = ImmutableMap.of("value", (Object) (buffer + "."));
        return instanceService.getInstance("auratest:text", ComponentDef.class, atts);
    }

    @AuraEnabled
    public Boolean echoCheckbox(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public BigDecimal echoCurrency(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public BigDecimal echoDecimal(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public Date echoDate(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public Date echoTime(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public Date echoDateTime(@Key("inVar") Date inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoEmail(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public BigDecimal echoNumber(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoNumberString(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public BigDecimal echoPercentString(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoDateString(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public Boolean echoOption(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public BigDecimal echoPercent(@Key("inVar") BigDecimal inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoPhone(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoPicklist(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoSearch(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoSecret(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoSelect(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoSelectMulti(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public Boolean echoSelectOption(@Key("inVar") Boolean inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoText(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoTextArea(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public String echoUrl(@Key("inVar") String inVar) {
        return inVar;
    }

    @AuraEnabled
    public Component getInputNumberCmp(@Key("value") BigDecimal value, @Key("step") BigDecimal step,
                                       @Key("max") BigDecimal max, @Key("min") BigDecimal min) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        Component inputNumCmp = null;

        attributes.put("value", value);
        attributes.put("aura:id", "inputNumber");
        attributes.put("step", step);
        attributes.put("max", max);
        attributes.put("min", min);
        inputNumCmp = instanceService.getInstance("ui:inputNumber", ComponentDef.class, attributes);

        return inputNumCmp;
    }

    @AuraEnabled
    public Component getOutputNumberCmp(@Key("inVar") BigDecimal inVar) throws QuickFixException {
        return getOutputComponent(inVar, "ui:outputNumber");
    }

    @AuraEnabled
    public Component getOutputPercentStringCmp(@Key("inVar") BigDecimal inVar) throws QuickFixException {
        return getOutputComponent(inVar, "ui:outputPercent");
    }

    @AuraEnabled
    public Component getOutputDateCmp(@Key("inVar") Date inVar) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputDateCmp = null;

        attributes.put("value", inVar);
        try {
            outputDateCmp = instanceService.getInstance("ui:outputDate", ComponentDef.class, attributes);
        } catch (Exception e) {
        }
        return outputDateCmp;
    }

    @AuraEnabled
    public Component getOutputTimeCmp(@Key("inVar") Date inVar) throws DefinitionNotFoundException,
            QuickFixException {
        return getOutputDateComponent(inVar, "ui:outputDateTime");
    }

    @AuraEnabled
    public Component getOutputDateTimeCmp(@Key("inVar") Date inVar) throws DefinitionNotFoundException,
            QuickFixException {
        return getOutputDateComponent(inVar, "ui:outputDateTime");
    }

    @AuraEnabled
    public Component getOutputCurrencyCmp(@Key("inVar") BigDecimal inVar) throws QuickFixException {
        return getOutputComponent(inVar, "ui:outputCurrency");
    }

    @AuraEnabled
    public Component getOutputPercentCmp(@Key("inVar") BigDecimal inVar) throws QuickFixException {
        return getOutputComponent(inVar, "ui:outputPercent");
    }

    private Component getOutputComponent(BigDecimal inVar, String component) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputCmp = null;
        try {
            attributes.put("value", inVar);
            outputCmp = instanceService.getInstance(component, ComponentDef.class, attributes);
        } catch (Exception nfe) {
            StringWriter errors = new StringWriter();
            nfe.printStackTrace(new PrintWriter(errors));

            attributes.clear();
            attributes.put("title", errors.toString());
            attributes.put("severity", "error");
            outputCmp = instanceService.getInstance("ui:message", ComponentDef.class, attributes);
        }
        return outputCmp;
    }

    private Component getOutputDateComponent(Date inVar, String component) {
        Map<String, Object> attributes = Maps.newHashMap();
        Component outputDateCmp = null;

        long time = inVar.getTime();
        Calendar c = Calendar.getInstance();
        c.setTime(new Date(time));
        attributes.put("value", c);
        try {
            outputDateCmp = instanceService.getInstance(component, ComponentDef.class, attributes);
        } catch (Exception e) {
        }
        return outputDateCmp;
    }
}
