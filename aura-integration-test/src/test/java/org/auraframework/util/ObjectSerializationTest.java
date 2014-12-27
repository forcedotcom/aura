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
package org.auraframework.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import org.auraframework.Aura;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;

import com.google.common.collect.ImmutableMap;

public class ObjectSerializationTest extends AuraImplTestCase {

    public ObjectSerializationTest(String name) {
        super(name);
    }

    public void testSerializeTestCaseDef() throws Exception {
        TestSuiteDef suite = Aura.getDefinitionService().getDefinition("js://auratest.jsmock", TestSuiteDef.class);
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
        assertTrue(newtest.getAttributeValues().isEmpty());
        assertEquals(test.getOwnHash(), newtest.getOwnHash());
        assertEquals(null, newtest.getAPIVersion());
        assertEquals(null, newtest.getDescription());
        assertEquals("", newtest.getOwner());
        assertTrue(newtest.getBrowsers().isEmpty());
        assertTrue(newtest.getTestLabels().isEmpty());
        Definition controllerDef = newtest.getLocalDefs().get(0);
        assertEquals("java://org.auraframework.component.test.java.controller.JavaTestController", controllerDef.getDescriptor()
                .getQualifiedName());
        assertEquals("what I expected",
                ((ControllerDef) controllerDef).createAction("getString", ImmutableMap.<String, Object> of())
                        .getReturnValue().toString());
        Definition modelDef = newtest.getLocalDefs().get(1);
        assertEquals("java://org.auraframework.impl.java.model.TestJavaModel", modelDef.getDescriptor()
                .getQualifiedName());
        assertEquals("<suite-level>",
                ((ModelDef) modelDef).newInstance().getValue(new PropertyReferenceImpl("secret", null)).toString());
    }
}
