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
package org.auraframework.integration.test.components.ui.draggable;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.FIREFOX, BrowserType.IE11 })
public class DraggableUITest extends WebDriverTestCase{

    private static final String DRAGANDDROPTEST_APP = "/uitest/dragAndDrop_Test.cmp";
    private WebDriver driver;

    /**
     * Tests successful drag and drop draggable and dropzone have matching type.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    @Test
    public void testDragAndDropWithMatchingTypes() throws Exception {
        helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: Move 1", "Dropzone Type: Move");
        verifyDragAndDropResults("Dropzone Type: Move", "Draggable Type: Move 1", true);
    }

    /**
     * Tests unsuccessful drag and drop draggable and dropzone types are not matching.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    @Test
    public void testDragAndDropWithNonMatchingTypes() throws Exception {
        helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: Move 1", "Dropzone Type: Copy");
        verifyDragAndDropResults("Dropzone Type: Copy", "Draggable Type: Move 1", false);
    }

    /**
     * Tests unsuccessful drag and drop draggable and dropzone types are null.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
     public void testDragAndDropWithNullTypes() throws Exception {
         helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: None 1", "Dropzone Type: None");
         verifyDragAndDropResults("Dropzone Type: None", "Draggable Type: None 1", false);
     }

    /**
     * Tests unsuccessful drag and drop to dropzone that has null type.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
     public void testDragAndDropToDropzoneWithNullTypes() throws Exception {
         helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: Move2 1", "Dropzone Type: None");
         verifyDragAndDropResults("Dropzone Type: None", "Draggable Type: Move2 1", false);
     }

    /**
     * Tests unsuccessful drag and drop with draggable that has null type.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    @Test
    public void testDragAndDropWithDraggableWithNullType() throws Exception {
        helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: None 1", "Dropzone Type: Move");
        verifyDragAndDropResults("Dropzone Type: Move", "Draggable Type: None 1", false);
    }

    /**
     * Tests no-op drag and drop to original dropzone.
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
     public void testDragAndDropToDropzoneOrigin() throws Exception {
         helpTestDragAndDrop(DRAGANDDROPTEST_APP, "Draggable Type: Move2 1", "Dropzone Type: Move2");
         verifyDragAndDropResults("Dropzone Type: Move2", "Draggable Type: Move2 1", true);
     }

    /**
     * Verifies drag and drop results.
     * @param dropzoneText - dropzone to verify results
     * @param draggableText - draggable in drag and drop context
     * @param shouldTransfer - true if draggable is expected to be moved to dropzone
     */
    private void verifyDragAndDropResults(String dropzoneText, String draggableText, boolean shouldTransfer) {
        WebElement dropzone = driver.findElement(By.xpath("//h1[contains(text(), '" + dropzoneText + "')]/following-sibling::div"));
        List<WebElement> draggableItems = dropzone.findElements(By.className("uiDraggable"));
        boolean found = false;
        for(WebElement draggableItem : draggableItems) {
            if(draggableItem.getText().equals(draggableText))
                found = true;
        }
        if(shouldTransfer)
            assertTrue("[\"" + draggableText + "\"] not found in dropzone: [" + dropzone.getText() + "]", found);
        else
            assertFalse("[\"" + draggableText + "\"] incorrectly found in dropzone: [" + dropzone.getText() + "]", found);
    }

    /**
     * Execute drag and drop.
     * @param url - page to run test
     * @param draggableText - draggable used in test
     * @param dropzoneText - dropzone used in test
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    private void helpTestDragAndDrop(String url, String draggableText, String dropzoneText) throws Exception {
        driver = getDriver();
        open(DRAGANDDROPTEST_APP);
        WebElement draggableItem = driver.findElement(By.xpath("//p[contains(text(), '" + draggableText + "')]/parent::div"));
        WebElement dropzone = driver.findElement(By.xpath("//h1[contains(text(), '" + dropzoneText + "')]/following-sibling::div"));

        simulateDragAndDrop_HTML5(draggableItem, dropzone);
    }

    /**
     * Simulates drag and drop operation by executing javascript
     * @param dragFrom - draggable used in test
     * @param dragTo - dropzone used in test
     */
    private void simulateDragAndDrop_HTML5(WebElement dragFrom, WebElement dragTo) {
        ((org.openqa.selenium.JavascriptExecutor)driver).executeScript(simulateHTML5DragAndDrop, dragFrom, dragTo);
    }

    /**
     * Javascript to simulate drag and drop operation.
     */
    private static final String simulateHTML5DragAndDrop =
            "var dataTransfer = {\r\n" +
                    "    data: {\r\n" +
                    "    },\r\n" +
                    "    types: [],\r\n" +
                    "    setData: function(type, val){\r\n" +
                    "            this.data[type] = val;\r\n" +
                    "            this.types.push(type);\r\n" +
                    "    },\r\n" +
                    "    getData: function(type){\r\n" +
                    "            return this.data[type];\r\n" +
                    "    },\r\n" +
                    "    effectAllowed: null,\r\n" +
                    "    dropEffect: null\r\n" +
                    "};\r\n" +
                    "function fireDragAndDropEvent(element, dataTransfer, eventType) {\r\n" +
                    "    var event = document.createEvent(\"HTMLEvents\");\r\n" +
                    "    event.initEvent(eventType, true, true);\r\n" +
                    "    event.dataTransfer = dataTransfer;\r\n" +
                    "    element.dispatchEvent(event);\r\n" +
                    "}\r\n" +
                    "function simulateHTML5DragAndDrop(dragFrom, dragTo, dataTransfer) {\r\n" +
                    "    fireDragAndDropEvent(dragFrom, dataTransfer, \"dragstart\");\r\n" +
                    "    fireDragAndDropEvent(dragTo, dataTransfer, \"dragenter\");\r\n" +
                    "    fireDragAndDropEvent(dragTo, dataTransfer, \"dragover\");\r\n" +
                    "    fireDragAndDropEvent(dragTo, dataTransfer, \"drop\");\r\n" +
                    "    fireDragAndDropEvent(dragFrom, dataTransfer, \"dragend\"); \r\n" +
                    "}\r\n" +
                    "simulateHTML5DragAndDrop(arguments[0], arguments[1], dataTransfer);\r\n";

}

