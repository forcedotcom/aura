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
package org.auraframework.components.aura.iteration;

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

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
        buttons.get(0).click(); // button class=.button6
        WebElement e = findDomElement(By.cssSelector(".outputText"));
        assertEquals("action run by button6", e.getText());
        buttons.get(3).click(); // button class=.button9
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

        // Should we maybe just disable this test for ie8?
        // For ie8 className does not have quotes so get rid of them everywhere.
        clientHtml = clientHtml.replaceAll(" class=\"([^>\"]+)\"", " class=$1");
        serverHtml = serverHtml.replaceAll(" class=\"([^>\"]+)\"", " class=$1");

        serverHtml = serverHtml.replaceAll("\\s+", " "); // replace whitespace with a single space
        serverHtml = serverHtml.replaceAll(" id=\"[^\"]+\"", ""); // server renders aura:id as id
        // fix for ie7 and ie8,
        // as id of div does not have quotes
        serverHtml = serverHtml.replaceAll(" id=[^>]+", "");
        // remove default button type in ie8
        clientHtml = clientHtml.replaceAll(" type=submit", "");
        serverHtml = serverHtml.replaceAll(" type=submit", "");
        // needs an extra space
        serverHtml = serverHtml.replaceAll("(?i)</DIV>from", "</DIV> from");
        serverHtml = serverHtml.replaceAll("(?i)<BR>from", "<BR> from");
        // space between div tags
        clientHtml = clientHtml.replaceAll("> <", "><");
        serverHtml = serverHtml.replaceAll("> <", "><");
        // uppercased tags
        clientHtml = clientHtml.replaceAll("DIV", "div");
        clientHtml = clientHtml.replaceAll("BUTTON", "button");
        clientHtml = clientHtml.replaceAll("BR", "br");
        serverHtml = serverHtml.replaceAll("DIV", "div");
        serverHtml = serverHtml.replaceAll("BUTTON", "button");
        serverHtml = serverHtml.replaceAll("BR", "br");

        System.out.println("CLIENT:"+clientHtml);
        System.out.println("SERVER:"+serverHtml);
        assertEquals(clientHtml, serverHtml);
        goldFileText(clientHtml);
    }

    /**
     * nestedIteration.cmp uses nested iteration, model list of maps, shadowed var/indexVar scoping Compare
     * client-rendered and server-rendered versions, and gold file diff.
     */
    public void testNestedIteration() throws Exception {
        open("/iterationTest/nestedIteration.cmp");
        WebElement root = findDomElement(By.cssSelector(".testRoot"));
        String clientHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        openNoAura("/iterationTest/nestedIterationServer.cmp");
        root = findDomElement(By.cssSelector(".testRoot"));
        String serverHtml = (String) auraUITestingUtil.getEval("return arguments[0].innerHTML;", root);

        clientHtml = clientHtml.replaceAll("<!---->", ""); // remove comments
        clientHtml = clientHtml.replaceAll("\\s+", " "); // replace whitespace
                                                         // with a single space
        clientHtml = clientHtml.replaceAll(";\"", "\""); // replace semicolon
                                                         // and doubleQuotes
                                                         // with a doubleQuotes
        clientHtml = clientHtml.replaceAll(" data-aura-rendered-by=\"[^\"]+\"", ""); // remove
                                                                                     // client
                                                                                     // data
                                                                                     // tags
        serverHtml = serverHtml.replaceAll("\\s+", " "); // replace whitespace
                                                         // with a single space
        serverHtml = serverHtml.replaceAll(";\"", "\""); // replace semicolon
                                                         // and doubleQuotes
                                                         // with a doubleQuotes
        // for ie7 and 8, servers adds extra tbody with space
        serverHtml = serverHtml.replaceAll("<(?i)/?tbody> ", ""); // server has extra
        serverHtml = serverHtml.replaceAll("</DIV>but indexVar", "</DIV> but indexVar");

        serverHtml = serverHtml.replaceAll("<(?i)/?tbody>", ""); // server has extra
                                                                 // tbody?

        assertEquals(clientHtml, serverHtml);

        // in ie 8 clientHtml has:
        clientHtml = clientHtml.toLowerCase() // tags are in caps
                .replaceAll("scope=row", "scope=\"row\"") // does not have extra quotes
                .replaceAll("> <", "><"); // has extra spaces between tags

        goldFileText(clientHtml);
    }
}
