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
package org.auraframework.def;

import org.auraframework.impl.AuraImplTestCase;

/**
 * Unit test to verify the functioning of HtmlTag class. HtmlTag is an Enum of
 * all allowed HTML tags in aura component markup.
 * 
 * 
 * 
 * @since 0.0.156
 */
public class HtmlTagTest extends AuraImplTestCase {
    public HtmlTagTest(String name) {
        super(name);
    }

    /**
     * Test to verify the static method to check if a certain HTML tag is
     * allowed in aura.
     */
    public void testAllowedMethod() {
        assertFalse("Expected HtmlTag to disallow null tags.", HtmlTag.allowed(null));
        assertFalse("Enum does not handle non existing tags.", HtmlTag.allowed("Non existing Tag"));
    }

    /**
     * Gold file all allowed and disallowed HTML tags. This test will make sure
     * we know that somebody did not enable a HTML tag by mistake.
     * 
     * @throws Exception
     */
    public void testGoldFileAcceptanceOfHTMLTags() throws Exception {
        StringBuffer tags = new StringBuffer();
        for (HtmlTag tag : HtmlTag.values()) {
            tags.append("<" + tag.name() + "> : " + (tag.isAllowed() ? "allowed" : "disallowed") + "\n");
        }
        this.goldFileText(tags.toString());
    }
}
