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

package org.auraframework.impl.root.parser.handler.genericxml;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.def.genericxml.GenericXmlValidator;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParserBase;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import javax.annotation.Nonnull;
import javax.xml.stream.XMLStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

/**
 * Tests for @GenericXmlDefHandler
 */
public class GenericXmlHandlerTest extends AuraImplTestCase {
    private final static String TAG = "aura:designTest";
    private final static String TAG2 = "aura:xmlTest";
    private final static List<String> nonPriviledgedAttr = Lists.newArrayList("testattr");
    private final static List<String> priviledgedAttr = Lists.newArrayList("priviledged", "testattr");

    private final Function<Boolean, List<String>> ATTRIBUTE_FUNC = priv -> priv ? priviledgedAttr : nonPriviledgedAttr;

    private static GenericXmlElementHandler createGenericXmlHandler(String xml, GenericXmlValidator validator) throws Exception {
        Reader stringReader = new StringReader(xml);
        XMLStreamReader reader = XMLParserBase.createXMLStreamReader(stringReader);
        reader.next();
        StringSource<?> source = new StringSource<>(
                null,
                xml,
                "myID", Parser.Format.XML);
        return new GenericXmlElementHandler(reader, source, true, validator);
    }

    @Test
    public void testGenericXmlValidator() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG, false);
        final String xml = "<aura:designtest> </aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        assertEquals("expected tag name to the the element name", def.getName(), TAG.toLowerCase());

        assertNull("expected text to be null as there is none", def.getText());

        assertNotNull("Expected children to be non null", def.getChildren());
        assertTrue("Expected children to be empty", def.getChildren().isEmpty());

        assertNotNull("Expected attributes to be non null", def.getAttributes());
        assertTrue("Expected attributes to be empty", def.getAttributes().isEmpty());
    }

    @Test
    public void testInvalidTag() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG, false);
        final String xml = "<random> </random>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        try {
            handler.createElement();
            fail("Tag should not have been allowed");
        } catch (Exception e) {
            assertTrue("Expected startTag", e.getMessage().contains(String.format("Expected start tag <%s>", TAG)));
        }
    }

    @Test
    public void testTextNotAllowed() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG, false);
        final String xml = "<aura:designtest> Cant be here</aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        try {
            handler.createElement();
            fail("Expected failure since text is not allowed");
        } catch (Exception e) {
            assertTrue("Expected error to mention text not allowed", e.getMessage().contains("can not contain text"));
        }
    }

    @Test
    public void testAttributeNotAllowed() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG, false);
        final String xml = "<aura:designtest notAvailable=\"true\"> </aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        try {
            handler.createElement();
            fail("Expected failure since attribute is not allowed");
        } catch (Exception e) {
            assertTrue("Expected error to mention attribute not allowed", e.getMessage().contains("notAvailable"));
        }
    }

    @Test
    public void testChildNotAllowed() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG, false);
        final String xml = "<aura:designtest> <badchild></aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        try {
            handler.createElement();
            fail("Expected failure since children are not allowed");
        } catch (Exception e) {
            assertTrue("Expected error to mention child element not allowed", e.getMessage().contains("badchild"));
        }
    }

    @Test
    public void testAllowTextNonPriviledged() throws Exception {
        final String text = "Some test text";
        GenericXmlValidator validator = new MockValidator(TAG, true);
        final String xml = String.format("<aura:designtest>%s</aura:designtest>", text);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        assertEquals("expected text to equal input", def.getText(), text);
    }

    @Test
    public void testAllowAttribute() throws Exception {
        final String attr = nonPriviledgedAttr.get(0);
        GenericXmlValidator validator = new MockValidator(TAG, false, ATTRIBUTE_FUNC);
        final String xml = String.format("<aura:designtest %s=\"test\"></aura:designtest>", attr);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        assertEquals("Expected attribute to equal \"test\"", def.getAttributes().get(attr), "test");
    }

    @Test
    public void testAllowChildren() throws Exception {
        final String childTag = "child";
        GenericXmlValidator child = new MockValidator(childTag, true);
        GenericXmlValidator validator = new MockValidator(TAG, false, ATTRIBUTE_FUNC, Sets.newHashSet(child));
        final String xml = String.format("<aura:designtest><%s>testText</%s></aura:designtest>", childTag, childTag);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        assertEquals("Expected child to exist", def.getChildren().stream().filter(ele -> ele.getName().equals(childTag)).count(), 1);
        assertEquals("expected child text to be \"testText\"",
                (def.getChildren().stream().filter(ele -> ele.getName().equals(childTag)).findFirst().get())
                        .getText(), "testText");
    }

    @Test
    public void testGetChildrenWithNonValidatorClass() throws Exception {
        final String childTag = "child";
        GenericXmlValidator child = new MockValidator(childTag, true);
        GenericXmlValidator validator = new MockValidator(TAG, false, ATTRIBUTE_FUNC, Sets.newHashSet(child));
        final String xml = String.format("<aura:designtest><%s>testText</%s></aura:designtest>", childTag, childTag);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        assertEquals("Should get no elements back", 0, def.getChildren(String.class).size());
    }

    @Test
    public void testAttributeCaseInsensitive() throws Exception {
        final String attrUppercase = nonPriviledgedAttr.get(0).toUpperCase();
        final String attrLowercase = nonPriviledgedAttr.get(0);
        GenericXmlValidator validator = new MockValidator(TAG, false, ATTRIBUTE_FUNC);
        final String xml = String.format("<aura:designtest %s=\"test\"></aura:designtest>", attrUppercase);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement def = handler.createElement();
        //Passing in lowerCase to attribute map should still find the attribute (case insensitivity)
        assertEquals("Expected attribute to equal \"test\"", "test", def.getAttributes().get(attrLowercase));
    }

    /**
     * Make sure a attribute can only be defined once regardless of case
     * @throws Exception
     */
    @Test
    public void testAttributeSingularity() throws Exception {
        final String attrUppercase = nonPriviledgedAttr.get(0).toUpperCase();
        final String attrLowercase = nonPriviledgedAttr.get(0);
        GenericXmlValidator validator = new MockValidator(TAG, false, ATTRIBUTE_FUNC);
        final String xml = String.format("<aura:designtest %s=\"test\" %s=\"replace\"></aura:designtest>", attrUppercase, attrLowercase);
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        QuickFixException exception = null;
        try {
            handler.createElement().validateDefinition();
        } catch (QuickFixException e) {
            exception = e;
        }
        assertNotNull("Expected to issue while validating definition", exception);
        String message = exception.getMessage();
        assertTrue("Expected error to be about duplicate attribute", message.toLowerCase().contains(attrLowercase));
    }

    @Test
    public void testHanderWithGenericXmlChildren() throws Exception {
        MockValidator2 childValidator = new MockValidator2();
        MockValidator3 childValidator2 = new MockValidator3();
        GenericXmlValidator validator = new MockValidator("root", false, (priv) -> Collections.emptyList(), Sets.newHashSet(childValidator, childValidator2));
        final String xml = "<root><mockValidator2/><mockValidator3/></root>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement element = handler.createElement();
        assertEquals("There should be two child elements",
                2, element.getChildren().size());
        assertEquals("There should only be one element with validator of mockValidator2",
                1, element.getChildren(MockValidator2.class).size());

    }

    @Test
    public void testHanderWith2LevelsOfDepth() throws Exception {
        MockValidator3 childValidator_1 = new MockValidator3();
        MockValidator2 childValidator2_1 = new MockValidator2();
        MockValidator2 childValidator_subRoot = new MockValidator2(Sets.newHashSet(childValidator2_1, childValidator_1));
        GenericXmlValidator validator = new MockValidator("root", false, (priv) -> Collections.emptyList(), Sets.newHashSet(childValidator_subRoot));
        final String xml = "<root>" +
                "               <mockValidator2>" +
                "                   <mockValidator2/>" +
                "                   <mockValidator3/>" +
                "               </mockValidator2>" +
                "           </root>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        GenericXmlElement root = handler.createElement();

        assertEquals("Should be one child element from the root", 1, root.getChildren().size());

        GenericXmlElement subRoot = new ArrayList<>(root.getChildren(MockValidator2.class)).get(0);
        assertEquals("Expect the tag to be mockValidator2", MockValidator2.TAG, subRoot.getName());

        Set<GenericXmlElement> subRootChild2 = subRoot.getChildren(MockValidator2.class);
        Set<GenericXmlElement> subRootChild3 = subRoot.getChildren(MockValidator3.class);
        assertEquals("Expect there to be two children under subRoot", 2, subRoot.getChildren().size());
        assertEquals("Expect there to be one element of type MockValidator2", 1, subRootChild2.size());
        assertEquals("Expect there to be one element of type MockValidator3", 1, subRootChild3.size());
    }

    @Test
    public void testHanderWithrecursiveTagFail() throws Exception {
        MockValidator2 childValidator_1 = new MockValidator2();
        MockValidator2 childValidator_subRoot = new MockValidator2(Sets.newHashSet(childValidator_1));
        GenericXmlValidator validator = new MockValidator("root", false, (priv) -> Collections.emptyList(), Sets.newHashSet(childValidator_subRoot));
        //Should allow recursive but our validator only specifies 2 levels, were trying 3
        final String xml = "<root>" +
                "               <mockValidator2>" +
                "                   <mockValidator2>" +
                "                       <mockValidator2/>" +
                "                   </mockValidator2>" +
                "               </mockValidator2>" +
                "           </root>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, validator);
        Exception exception = null;
        try {
            handler.createElement();
        } catch (AuraRuntimeException e) {
            exception = e;
        }
        assertExceptionMessageContains(exception, AuraRuntimeException.class, "Unexpected tag");

    }

    @Test
    public void testDuplicateElementsAttribute() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG2, false, ATTRIBUTE_FUNC);
        GenericXmlValidator rootValidator = new MockValidator(TAG, false,
                f -> Collections.emptyList(), Collections.singleton(validator));
        final String xml = "<aura:designtest> " +
                "<aura:xmlTest testattr=\"test\"/> " +
                "<aura:xmlTest testattr=\"test\"/>" +
                "</aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, rootValidator);
        Exception cause = null;
        try {
            handler.createElement().validateDefinition();
        } catch (Exception e) {
            cause = e;
        }

        assertExceptionMessageContains(cause, InvalidDefinitionException.class, "aura:xmlTest");
    }

    @Test
    public void testDuplicateElementsText() throws Exception {
        GenericXmlValidator validator = new MockValidator(TAG2, true, ATTRIBUTE_FUNC);
        GenericXmlValidator rootValidator = new MockValidator(TAG, false,
                f -> Collections.emptyList(), Collections.singleton(validator));
        final String xml = "<aura:designtest> " +
                "<aura:xmlTest>someText</aura:xmlTest>" +
                "<aura:xmlTest>someText</aura:xmlTest>" +
                "</aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, rootValidator);
        Exception cause = null;
        try {
            handler.createElement().validateDefinition();
        } catch (Exception e) {
            cause = e;
        }

        assertExceptionMessageContains(cause, InvalidDefinitionException.class, "aura:xmlTest");
    }

    @Test
    public void testDuplicateElementsIgnoreChild() throws Exception {
        GenericXmlValidator validator1 = new MockValidator(TAG2, false, ATTRIBUTE_FUNC);
        GenericXmlValidator validator = new MockValidator(TAG2, false, ATTRIBUTE_FUNC, Collections.singleton(validator1));
        GenericXmlValidator rootValidator = new MockValidator(TAG, false,
                f -> Collections.emptyList(), Collections.singleton(validator));
        final String xml = "<aura:designtest> " +
                "<aura:xmlTest testattr=\"test\"> <aura:xmlTest/> </aura:xmlTest>" +
                "<aura:xmlTest testattr=\"test\"/>" +
                "</aura:designtest>";
        GenericXmlElementHandler handler = createGenericXmlHandler(xml, rootValidator);
        Exception cause = null;
        try {
            handler.createElement().validateDefinition();
        } catch (Exception e) {
            cause = e;
        }

        assertExceptionMessageContains(cause, InvalidDefinitionException.class, "aura:xmlTest");
    }

    private static class MockValidator extends GenericXmlValidator {
        private boolean allowText, requiresInternalNs;
        private Function<Boolean, List<String>> allowedAttributes;

        public MockValidator(String tag, boolean allowText) {
            this(tag, allowText, e -> Collections.emptyList());
        }

        public MockValidator(String tag, boolean allowText, Function<Boolean, List<String>> allowedAttributes) {
            this(tag, allowText, allowedAttributes, Collections.emptySet());
        }

        public MockValidator(String tag, boolean allowText, Function<Boolean, List<String>> allowedAttributes, Set<GenericXmlValidator> children) {
            this(tag, allowText, allowedAttributes, children, false);
        }

        public MockValidator(String tag, boolean allowText, Function<Boolean, List<String>> allowedAttributes, Set<GenericXmlValidator> children, boolean requiresInternalNamespace) {
            super(tag, children);
            this.allowText = allowText;
            this.allowedAttributes = allowedAttributes;
            this.requiresInternalNs = requiresInternalNamespace;
        }

        @Override
        public boolean allowsTextLiteral() {
            return allowText;
        }

        @Override
        public boolean requiresInternalNamespace() {
            return requiresInternalNs;
        }

        @Nonnull
        @Override
        public Set<String> getAllowedAttributes(boolean isPriviledgedNs) {
            return Sets.newHashSet(allowedAttributes.apply(isPriviledgedNs));
        }
    }

    /**
     * GenericXmlHandler user validator class for tag equality over the tag name.
     * Creating multiple mock validators so the class differs.
     */
    private static class MockValidator2 extends MockValidator {
        private static final String TAG = "mockValidator2";
        public MockValidator2() {
            this(Collections.emptySet());
        }

        public MockValidator2(Set<GenericXmlValidator> childValidators) {
            super(TAG, false, (priv) -> Collections.emptyList(), childValidators);
        }
    }

    private static class MockValidator3 extends MockValidator {
        private static final String TAG = "mockValidator3";
        public MockValidator3() {
            super(TAG, false);
        }
    }
}
