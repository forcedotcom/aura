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
package org.auraframework.util.j2v8;

import java.util.Properties;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

import org.auraframework.util.test.util.UnitTestCase;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.eclipsesource.v8.JavaCallback;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.eclipsesource.v8.utils.MemoryManager;

/**
 * Verifies J2V8 can be used in Aura plus usage examples
 */
public class J2V8Test extends UnitTestCase {

    private V8 v8;
    private MemoryManager memoryManager;

    @Before
    public void before() throws Exception {
        v8 = V8.createV8Runtime();
        memoryManager = new MemoryManager(v8);
    }

    @After
    public void after() throws Exception {
        memoryManager.release();
        memoryManager = null;
        v8.release(true);
        v8 = null;
    }

    // examples from http://eclipsesource.com/blogs/getting-started-with-j2v8/

    @Test
    public void testIsAvailable() {
        assertTrue(J2V8Util.isJ2V8Available());
    }
    
    @Test
    public void testHelloWorld() {
        int result = v8
                .executeIntegerScript("" + "var hello = 'hello, ';\n" + "var world = 'world!';\n" + "hello.length;\n");
        assertEquals(7, result);
    }

    @Test
    public void testAccessingJavaScriptObjects() {
        v8.executeVoidScript("" + "var person = {};\n" + "var hockeyTeam = {name : 'WolfPack'};\n"
                + "person.first = 'Ian';\n" + "person['last'] = 'Bull';\n" + "person.hockeyTeam = hockeyTeam;\n");

        // access global javascript objects
        V8Object person = v8.getObject("person");
        V8Object hockeyTeam = person.getObject("hockeyTeam");
        assertEquals("WolfPack", hockeyTeam.getString("name"));

        // modify javascript object
        hockeyTeam.add("captain", person);
        assertTrue(v8.executeBooleanScript("person === hockeyTeam.captain"));
    }

    @Test
    public void testV8Arrays() {
        V8Object player1 = new V8Object(v8).add("name", "John");
        V8Object player2 = new V8Object(v8).add("name", "Chris");
        V8Array players = new V8Array(v8).push(player1).push(player2);
        assertEquals(2, players.length());
    }

    @Test
    public void testCallingJavaScriptFunctions() {
        v8.executeVoidScript("" + "var hockeyTeam = {" + "  name      : 'WolfPack'," + "  players   : [],"
                + "  addPlayer : function(player) {" + "    this.players.push(player);"
                + "    return this.players.length;" + "  }" + "}");
        V8Object hockeyTeam = v8.getObject("hockeyTeam");
        V8Object player1 = new V8Object(v8).add("name", "John");
        V8Array parameters = new V8Array(v8).push(player1);
        int size = hockeyTeam.executeIntegerFunction("addPlayer", parameters);
        assertEquals(1, size);
    }

    @Test
    public void testCallingJSONStringify() {
        V8Object v8Object = new V8Object(v8).add("foo", "bar");
        V8Object json = v8.getObject("JSON");
        V8Array args = new V8Array(v8).push(v8Object);
        String result = (String) json.executeFunction("stringify", args);
        assertEquals("{\"foo\":\"bar\"}", result);
    }

    // examples from
    // http://eclipsesource.com/blogs/2015/06/06/registering-java-callbacks-with-j2v8/

    @Test
    public void testJavaCallback() {
        JavaCallback callback = new JavaCallback() {
            @Override
            public Object invoke(final V8Object receiver, final V8Array parameters) {
                return parameters.length();
            }
        };
        v8.registerJavaMethod(callback, "numParameters");
        assertEquals(3, v8.executeScript("numParameters('a', 'b', 'c');"));
    }

    @Test
    public void testRegisterMethodReflectively() {
        Properties javaSystemProperties = System.getProperties();
        V8Object v8JavaSystemProperties = new V8Object(v8);
        v8.add("javaSystemProperties", v8JavaSystemProperties);
        v8JavaSystemProperties.registerJavaMethod(javaSystemProperties, "getProperty", "getProperty",
                new Class<?>[] { String.class });
        assertEquals("Oracle Corporation", v8.executeStringScript("javaSystemProperties.getProperty('java.vm.specification.vendor')"));
    }

    // multithreading:
    // http://eclipsesource.com/blogs/2015/05/12/multithreaded-javascript-with-j2v8/

    @Test
    public void testAllInteractionsMustBeFromThreadThatInstantiatedV8() throws Exception {
        FutureTask<V8Object> futureTask = new FutureTask<>(new Callable<V8Object>() {
            @Override
            public V8Object call() {
                return v8.getObject("JSON");
            }
        });
        Thread thread = new Thread(futureTask);
        thread.start();
        try {
            futureTask.get();
            fail("expected Invalid V8 thread access");
        } catch (ExecutionException e) {
            assertEquals("Invalid V8 thread access", e.getCause().getMessage());
        }
    }
}