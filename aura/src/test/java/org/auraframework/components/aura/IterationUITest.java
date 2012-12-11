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
package org.auraframework.components.aura;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.auraframework.test.WebDriverTestCase;

/**
 * aura:interation UI tests.
 */
public class IterationUITest extends WebDriverTestCase {

    public IterationUITest(String name) {
        super(name);
    }

    public void testSimpleIteration() throws Exception {
        open("/iterationTest/simpleIteration.cmp");

        // check out some actions linked up since they don't show up in DOM
        List<WebElement> buttons = getDriver().findElements(By.cssSelector("button"));
        assertEquals(4, buttons.size());
        findDomElement(By.cssSelector(".button6")).click();
        WebElement e = findDomElement(By.cssSelector(".outputText"));
        assertEquals("action run by button6", e.getText());
        findDomElement(By.cssSelector(".button9")).click();
        assertEquals("action run by button9", e.getText());
        
        WebElement root = findDomElement(By.cssSelector(".testRoot"));
        String clientHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        openNoAura("/iterationTest/simpleIterationServer.cmp");

        root = findDomElement(By.cssSelector(".testRoot"));
        String serverHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        clientHtml = clientHtml.replaceAll("<!---->", ""); // remove comments
        clientHtml = clientHtml.replaceAll("</br>", ""); // remove expanded br
        clientHtml = clientHtml.replaceAll("\"\\s*\"", ""); // join separated text
        clientHtml = clientHtml.replaceAll("\\s+", " "); // replace whitespace with a single space
        clientHtml = clientHtml.replaceAll(" data-aura-rendered-by=\"[^\"]+\"", ""); // remove client data tags
        clientHtml = clientHtml.replaceAll(" class=\"[^\"]+\"", ""); // server doesn't render class?
        serverHtml = serverHtml.replaceAll("\\s+", " "); // replace whitespace with a single space
        serverHtml = serverHtml.replaceAll(" id=\"[^\"]+\"", ""); // server renders aura:id as id

        assertEquals(clientHtml, serverHtml);
        goldFileText(clientHtml);
    }

    /**
     * nestedIteration.cmp uses nested iteration, model list of maps, shadowed var/indexVar scoping
     * Compare client-rendered and server-rendered versions, and gold file diff.
     */
    public void testNestedIteration() throws Exception {
        open("/iterationTest/nestedIteration.cmp");
        WebElement root = findDomElement(By.cssSelector(".testRoot"));
        String clientHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        openNoAura("/iterationTest/nestedIterationServer.cmp");
        root = findDomElement(By.cssSelector(".testRoot"));
        String serverHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        clientHtml = clientHtml.replaceAll("<!---->", ""); // remove comments
        clientHtml = clientHtml.replaceAll("\\s+", " "); // replace whitespace with a single space
        clientHtml = clientHtml.replaceAll(";\"", "\""); // replace semicolon and doubleQuotes with a doubleQuotes
        clientHtml = clientHtml.replaceAll(" data-aura-rendered-by=\"[^\"]+\"", ""); // remove client data tags
        serverHtml = serverHtml.replaceAll("\\s+", " "); // replace whitespace with a single space
        serverHtml = serverHtml.replaceAll(";\"", "\""); // replace semicolon and doubleQuotes with a doubleQuotes
        serverHtml = serverHtml.replaceAll("</?tbody>", ""); // server has extra tbody?

        assertEquals(clientHtml, serverHtml);
        goldFileText(clientHtml);
    }
}
