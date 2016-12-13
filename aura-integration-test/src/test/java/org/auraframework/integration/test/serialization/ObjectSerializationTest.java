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
package org.auraframework.integration.test.serialization;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.instance.Action;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;

public class ObjectSerializationTest extends AuraImplTestCase {
    @Test
    public void testSerializeTestCaseDef() throws Exception {
        TestSuiteDef suite = definitionService.getDefinition("js://auratest.jsmock", TestSuiteDef.class);
        TestCaseDef test = null;
        for (TestCaseDef caseDef : suite.getTestCaseDefs()) {
            if ("testActionString".equals(caseDef.getName())) {
                test = caseDef;
                break;
            }
        }

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        ObjectOutputStream out = new ObjectOutputStream(buffer);
        out.writeObject(test);

        ByteArrayInputStream input = new ByteArrayInputStream(buffer.toByteArray());
        ObjectInputStream in = new ObjectInputStream(input);
        Object reconstituted = in.readObject();

        assertEquals(JavascriptTestCaseDef.class, reconstituted.getClass());
        JavascriptTestCaseDef newtest = (JavascriptTestCaseDef) reconstituted;
        assertNotSame(test, newtest);
        assertEquals("testActionString", newtest.getName());
        assertEquals("js://auratest.jsmock/TESTCASE$testActionString", newtest.getDescriptor().getQualifiedName());
        assertEquals(DefType.COMPONENT, newtest.getDefType());
        assertNull(newtest.getAttributeValues());
        assertEquals(test.getOwnHash(), newtest.getOwnHash());
        assertEquals(null, newtest.getAPIVersion());
        assertEquals(null, newtest.getDescription());
        assertEquals("", newtest.getOwner());
        assertTrue(newtest.getBrowsers().isEmpty());
        assertEquals(1, newtest.getTestLabels().size());
        assertTrue(newtest.getTestLabels().contains("basic"));
        Definition def = newtest.getLocalDefs().get(0);
        assertEquals("java://org.auraframework.components.test.java.controller.JavaTestController", def.getDescriptor()
                .getQualifiedName());
        ControllerDef controllerDef = (ControllerDef) def;
        ActionDef actionDef = controllerDef.getSubDefinition("getString");

        Action action = instanceService.getInstance(actionDef, ImmutableMap.<String, Object> of("param", "what I expected"));
        action.run();

        assertEquals("what I expected", action.getReturnValue().toString());

        //
        // FIXME SPRING: we can't instantiate model defs.
        //
        //ModelDef modelDef = (ModelDef)newtest.getLocalDefs().get(1);
        //assertEquals("java://org.auraframework.components.test.java.model.TestJavaModel", modelDef.getDescriptor()
                //.getQualifiedName());
        //assertEquals("<suite-level>",
        //        ((Model)instanceService.getInstance(modelDef)).getValue(new PropertyReferenceImpl("secret", null)).toString());
    }
}
