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
package org.auraframework.instance;

import org.auraframework.test.UnitTestCase;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

public class ActionDelegateTest extends UnitTestCase {
    public ActionDelegateTest(String name) throws Exception {
        super(name);
    }

    //
    // A class to remove the 'abstract'
    //
    private static class MyDelegateAction extends ActionDelegate {
        public MyDelegateAction(Action delegate) {
            super(delegate);
        }
    };


    private void oneCall(Map<String, Method> methodMap, Map<String,Boolean> calledMap, String name,
            Object... args) throws Throwable {
        Action spied = Mockito.mock(Action.class);
        Action delegate = new MyDelegateAction(spied);
        try {
            methodMap.get(name).invoke(delegate, args);
        } catch (InvocationTargetException ite) {
            throw ite.getTargetException();
        }
        Action verified = Mockito.verify(spied, Mockito.only());
        methodMap.get(name).invoke(verified, args);

        calledMap.put(name, Boolean.TRUE);
    }

    public void testCallsFunctions() throws Throwable {
        Map<String,Method> methodMap = Maps.newHashMap();
        Map<String,Boolean> calledMap = Maps.newHashMap();

        for (Method m : Action.class.getMethods()) {
            assertFalse("Duplicate method name "+m.getName(), methodMap.containsKey(m.getName()));
            methodMap.put(m.getName(), m);
            calledMap.put(m.getName(), Boolean.FALSE);
        }
        oneCall(methodMap, calledMap, "getDescriptor");
        oneCall(methodMap, calledMap, "getPath");
        oneCall(methodMap, calledMap, "serialize", (Object)null);
        
        oneCall(methodMap, calledMap, "getId");
        oneCall(methodMap, calledMap, "setId", new String("id"));
        oneCall(methodMap, calledMap, "run");
        oneCall(methodMap, calledMap, "add", (Object)null);
        oneCall(methodMap, calledMap, "getActions");
        oneCall(methodMap, calledMap, "getReturnValue");
        oneCall(methodMap, calledMap, "getState");
        oneCall(methodMap, calledMap, "getErrors");
        oneCall(methodMap, calledMap, "logParams", (Object)null);
        oneCall(methodMap, calledMap, "isStorable");
        oneCall(methodMap, calledMap, "setStorable");
        oneCall(methodMap, calledMap, "getParams");

        oneCall(methodMap, calledMap, "getInstanceStack");
        for (Method m : Action.class.getMethods()) {
            assertTrue(m.getName()+"was not called", calledMap.get(m.getName()));
        }
    }
}
