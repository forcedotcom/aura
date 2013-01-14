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

import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.date.DateOnly;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

@Controller
public class JavaTestController {

    @AuraEnabled
    public static void noArgs() {
    }

    @AuraEnabled
    public static Object getComponents(@Key("token") String token, @Key("input") String input) throws Exception {
        int count = input == null ? 1 : Integer.parseInt(input);
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

    /**
     * Note: these cases are pretty specific to js://test.testActionExceptions
     * 
     * @param exceptionType What type (class) of exception to throw
     * @param cause Cause parameter of Exception. Either a class of type
     *            Throwable or String
     */
    @AuraEnabled
    public static void throwsThrowable(@Key("type") String exceptionType, @Key("cause") String cause) throws Throwable {
        if (exceptionType.equals("java.lang.Throwable")) {
            throw new Throwable(cause);
        } else if (exceptionType.equals("java.lang.RuntimeException")) {
            throw new RuntimeException(new IllegalAccessException());
        } else if (exceptionType.equals("java.lang.Error")) {
            throw new Error(new RuntimeException());
        } else if (exceptionType.equals("java.lang.reflect.InvocationTargetException")) {
            throw new InvocationTargetException(new IllegalArgumentException());
        } else if (exceptionType.equals("java.lang.IllegalArgumentException")) {
            throw new IllegalArgumentException(cause);
        } else if (exceptionType.equals("java.lang.IllegalAccessException")) {
            throw new IllegalAccessException(cause);
        } else if (exceptionType.equals("java.lang.reflect.InvocationTargetException")) {
            if (cause.equals("java.lang.IllegalArgumentException")) {
                throw new InvocationTargetException(new IllegalArgumentException());
            } else if (cause.equals("aura.throwable.AuraHandledException")) {
                throw new InvocationTargetException(new AuraHandledException(""));
            }
        } else if (exceptionType.equals("aura.throwable.AuraHandledException")) {
            if (cause.equals("java.lang.IllegalArgumentException")) {
                throw new AuraHandledException(new IllegalArgumentException());
            } else {
                throw new AuraHandledException(cause);
            }
        } else {
            throw new RuntimeException();
        }
    }

    @AuraEnabled
    public static void throwsException(@Key("errorMsg") String errorMsg) throws Exception {
        throw new Exception(errorMsg);
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
     * Wait for delayMs milliseconds and then return a auratest:text component
     * whose value is the current buffer contents plus the current append.
     */
    @AuraEnabled
    public static Component appendBuffer(@Key("id") String id, @Key("delayMs") BigDecimal delayMs,
            @Key("append") String append) throws Exception {
        StringBuffer buffer = buffers.get(id);
        buffer.append(append);
        long delay = delayMs.longValue();
        if (delay > 0) {
            Thread.sleep(delay);
        }
        Map<String, Object> atts = ImmutableMap.of("value", (Object) (buffer + "."));
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
    public static DateOnly echoDate(@Key("inVar") DateOnly inVar) {
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
    public static long echoNumber(@Key("inVar") long inVar) {
        return inVar;
    }

    @AuraEnabled
    public static String echoNumberString(@Key("inVar") String inVar) {
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
    public static void throwExceptionNoLineNums() {
        Location loc = new Location("test-filename", 123456789);
        AuraRuntimeException e = new AuraRuntimeException("throwExceptionNoLineNums", loc);
        throw e;
    }
}
