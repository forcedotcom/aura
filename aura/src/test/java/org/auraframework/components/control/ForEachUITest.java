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
package org.auraframework.components.control;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Test components using ForEach loops. This is a web driver test case to check
 * for foreach rendering.
 */
@ThreadHostileTest
public class ForEachUITest extends WebDriverTestCase {

    public ForEachUITest(String name) {
        super(name);
    }

    private static String FOREACH_COMPONENT = "<aura:component model=\"java://org.auraframework.impl.java.model.TestJavaModel\">"
            + "Result:"
            + "<div id=\"list_content\">"
            + "<aura:foreach items=\"{!m.%s}\" var=\"i\">{!i}</aura:foreach>"
            + "</div>\n" + "</aura:component>";

    private static String FOREACH_APP = "<aura:application render=\"client\" model=\"java://org.auraframework.impl.java.model.TestJavaModel\">"
            + "Result:"
            + "<div id=\"list_content\">"
            + "<aura:foreach items=\"{!m.%s}\" var=\"i\">{!i}</aura:foreach>"
            + "</div>" + "</aura:application>";

    private static String FOREACH_APP_SERVER = "<aura:application render=\"server\" model=\"java://org.auraframework.impl.java.model.TestJavaModel\">"
            + "Result:"
            + "<div id=\"list_content\">"
            + "<aura:foreach items=\"{!m.%s}\" var=\"i\">{!i}</aura:foreach>"
            + "</div>" + "</aura:application>";

    /**
     * Get the content of the 'list_content' div.
     */
    private String getListContent() {
        WebDriver d = getDriver();
        WebElement content = d.findElement(By.id("list_content"));
        return content.getText();
    }

    /**
     * Test ForEach iteration over a list of Strings.
     * 
     * @throws Exception
     */
    public void testForEachStringList() throws Exception {
        String componentText = String.format(FOREACH_COMPONENT, "stringList");

        loadComponent("foreachstringlist_client", componentText, true);
        assertEquals("foreach content text didn't match (Client)", "onetwothree", getListContent());
        loadComponent("foreachstringlist_server", componentText, false);
        assertEquals("foreach content text didn't match (Server)", "onetwothree", getListContent());
    }

    /**
     * Test ForEach iteration over empty list.
     * 
     * @throws Exception
     */
    public void testForEachEmpty() throws Exception {
        String componentText = String.format(FOREACH_COMPONENT, "emptyList");

        loadComponent("foreachemptylist_client", componentText, true);
        assertEquals("foreach content text didn't match (Client)", "", getListContent());
        loadComponent("foreachemptylist_server", componentText, false);
        assertEquals("foreach content text didn't match (Server)", "", getListContent());
    }

    public void testForEachNull() throws Exception {
        String componentText = String.format(FOREACH_COMPONENT, "stringListNull");

        loadComponent("foreachnulllist_client", componentText, true);
        assertEquals("foreach content text didn't match (Client)", "", getListContent());
        loadComponent("foreachnulllist_server", componentText, false);
        assertEquals("foreach content text didn't match (Server)", "", getListContent());
    }

    public void testForEachApp() throws Exception {
        String appText = String.format(FOREACH_APP, "stringList");
        loadApplication("stringlist_client", appText, true);
        assertEquals("foreach content text", "onetwothree", getListContent());
    }

    public void testForEachAppServer() throws Exception {
        String appText = String.format(FOREACH_APP_SERVER, "stringList");
        loadApplication("stringlist_server", appText, false);
        assertEquals("foreach content text", "onetwothree", getListContent());
    }
}
