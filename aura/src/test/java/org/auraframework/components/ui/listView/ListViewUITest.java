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
package org.auraframework.components.ui.listView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import org.auraframework.test.WebDriverTestCase;

public class ListViewUITest extends WebDriverTestCase {

    private final static String EMPTY_LIST_MESSAGE = "No records to display.";

    public ListViewUITest(String name) {
        super(name);
    }

    public void testEmptyListGeneratedColumns() throws Exception {
        open("/uitest/listViewTest.app");
        WebDriver driver = this.getDriver();

        WebElement tableElement = driver.findElement(By.id("ui:listView:test-empty-list-generated-columns"));
        WebElement tHeadElement = tableElement.findElement(By.tagName("thead"));
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        WebElement tFootElement = tableElement.findElement(By.tagName("tfoot"));

        // Header
        assertTrue("The thead in an empty list with single-level generated columns thead should contain one row",
                getNumRows(tHeadElement) == 1);
        System.out.println(getCellsInRow(tHeadElement, "th"));
        assertTrue("Empty list with generated columns should not contain any header cells",
                getCellsInRow(tHeadElement, "th").size() == 0);

        // Body
        assertTrue("Empty list tbody should contain one row",
                tBodyElement.findElements(By.tagName("tr")).size() == 1);
        List<WebElement> bodyCellElements = getCellsInRow(getRowAt(tableElement, "tbody", 0), "td");
        assertTrue("Empty list tbody's single row should contain one cell",
                bodyCellElements.size() == 1);
        assertEquals("Empty list message was not present or was not what was expected",
                getEmptyLisViewMessage(tableElement), EMPTY_LIST_MESSAGE);

        // Footer
        assertTrue("tfoot element should contain no rows",
                tFootElement.findElements(By.tagName("tr")).size() == 0);
    }

    public void testEmptyListSpecifiedColumns() throws Exception {
        open("/uitest/listViewTest.app");
        WebDriver driver = this.getDriver();

        WebElement tableElement = driver.findElement(By.id("ui:listView:test-empty-list-specified-columns"));
        WebElement tHeadElement = tableElement.findElement(By.tagName("thead"));
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        WebElement tFootElement = tableElement.findElement(By.tagName("tfoot"));

        // Header
        assertTrue("The thead in an empty list with single-level specified columns thead should contain one row",
                getNumRows(tHeadElement) == 1);
        List<WebElement> headerCellElements = getCellsInRow(getRowAt(tableElement, "thead", 0), "th");
        assertEquals("Empty list with specified columns should contain one header cell for each column",
                ListViewTestData.SPECIFIED_COLUMN_TITLES.length, headerCellElements.size());
        assertEquals("Actual header cell titles did not match expected",
                Arrays.asList(ListViewTestData.SPECIFIED_COLUMN_TITLES), getTextFromElements(headerCellElements));

        // Body
        assertTrue("Empty list tbody should contain one row",
                tBodyElement.findElements(By.tagName("tr")).size() == 1);
        List<WebElement> bodyCellElements = getCellsInRow(getRowAt(tableElement, "tbody", 0), "td");
        assertTrue("Empty list tbody's single row should contain one cell",
                bodyCellElements.size() == 1);
        assertEquals("Empty list message was not present or was not what was expected",
                getEmptyLisViewMessage(tableElement), EMPTY_LIST_MESSAGE);

        // Footer
        assertTrue("tfoot element should contain no rows",
                tFootElement.findElements(By.tagName("tr")).size() == 0);
    }

    public void testListGeneratedColumns() throws Exception {
        open("/uitest/listViewTest.app");
        WebDriver driver = this.getDriver();

        List<Map<String, String>> expectedData = ListViewTestData.GENERATED_LIST_DATA;

        WebElement tableElement = driver.findElement(By.id("ui:listView:test-list-generated-columns"));
        WebElement tHeadElement = tableElement.findElement(By.tagName("thead"));
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        WebElement tFootElement = tableElement.findElement(By.tagName("tfoot"));

        // Header
        assertTrue("The thead should contain one row",
                getNumRows(tHeadElement) == 1);
        List<WebElement> headerCellElements = getCellsInRow(getRowAt(tableElement, "thead", 0), "th");
        assertEquals("List should contain one header cell for each column",
                expectedData.get(0).size(), headerCellElements.size());
        List<String> headerCells = getTextFromElements(headerCellElements);
        for (String headerCell : headerCells) {
            assertTrue("Actual header cell title did not match expected",
                    expectedData.get(0).containsKey(headerCell));
        }

        // Body
        assertTrue("list tbody did not contain expected number of rows",
                tBodyElement.findElements(By.tagName("tr")).size() == expectedData.size());
        for (int i = 0; i < expectedData.size(); ++i) {
            List<WebElement> rowCellElements = getCellsInRow(getRowAt(tableElement, "tbody", i), "td");
            Map<String, String> row = expectedData.get(i);
            assertEquals("Expected number of cells in row did not match actual",
                    row.size(), rowCellElements.size());
            for (int j = 0; j < rowCellElements.size(); ++j) {
                assertEquals("Expected cell value did not match actual",
                        row.get(headerCells.get(j)), rowCellElements.get(j).getText());
            }
        }

        // Footer
        assertTrue("tfoot element should contain no rows",
                tFootElement.findElements(By.tagName("tr")).size() == 0);
    }

    public void testListSpecifiedColumns() throws Exception {
        open("/uitest/listViewTest.app");
        WebDriver driver = this.getDriver();

        List<Map<String, String>> expectedData = ListViewTestData.SPECIFIED_LIST_DATA;

        WebElement tableElement = driver.findElement(By.id("ui:listView:test-list-specified-columns"));
        WebElement tHeadElement = tableElement.findElement(By.tagName("thead"));
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        WebElement tFootElement = tableElement.findElement(By.tagName("tfoot"));

        // Header
        assertTrue("The thead in an empty list with single-level specified columns thead should contain one row",
                getNumRows(tHeadElement) == 1);
        List<WebElement> headerCellElements = getCellsInRow(getRowAt(tableElement, "thead", 0), "th");
        assertEquals("List should contain one header cell for each column",
                ListViewTestData.NUM_COLS_SPECIFIED_DATA, headerCellElements.size());
        List<String> headerCells = getTextFromElements(headerCellElements);
        for (int i = 0 ; i < ListViewTestData.NUM_COLS_SPECIFIED_DATA; ++i) {
            assertTrue("Actual header cell title did not match expected",
                    ListViewTestData.SPECIFIED_COLUMN_TITLES[i].equals(headerCells.get(i)));
        }

        // Body
        assertTrue("list tbody did not contain expected number of rows",
                tBodyElement.findElements(By.tagName("tr")).size() == expectedData.size());
        for (int i = 0; i < ListViewTestData.NUM_ROWS_SPECIFIED_DATA; ++i) {
            List<WebElement> rowCellElements = getCellsInRow(getRowAt(tableElement, "tbody", i), "td");
            Map<String, String> row = expectedData.get(i);
            assertEquals("Expected number of cells in row did not match actual",
                    ListViewTestData.NUM_COLS_SPECIFIED_DATA, rowCellElements.size());
            // First three columns will be of type text.
            for (int j = 0; j < 3; ++j) {
                assertEquals("Expected type:text cell value did not match actual",
                        row.get(headerCells.get(j).toLowerCase()), rowCellElements.get(j).getText());
            }
            // Fourth column will be Type:Email
            assertTrue("Email 'mailto' link was not present or did not contain correct text",
                    isElementPresentInElementWithText("a", rowCellElements.get(3),
                            "mailto:" + row.get(headerCells.get(3).toLowerCase())));

            // Fifth column will be Type:Checkbox
            List<WebElement> inputFields = rowCellElements.get(4).findElements(By.cssSelector("input[type='checkbox']"));
            assertTrue("Cell did not contain, or contained more than one, checkbox", inputFields.size() == 1);

            // Sixth column will be Type:Link
            assertTrue("Link was not present or did not contain correct text",
                    isElementPresentInElementWithText("a", rowCellElements.get(5), row.get(headerCells.get(5).toLowerCase())));

            // Seventh column will be Type:Index, whose value should be equal to the row index + 1
            String expectedIndexValue = new Integer(i + 1).toString();
            assertEquals("Index cell did not contain expected value",
                    expectedIndexValue, rowCellElements.get(6).getText());

            // Eighth column will be Type:Html, which should contain a div with some text.
            // First, we need to get rid of the html tags that enclose the expected string.
            String rawHtml = row.get(headerCells.get(7).toLowerCase());
            String expectedHtmlCellText = rawHtml.substring(rawHtml.indexOf('>') + 1);
            expectedHtmlCellText = expectedHtmlCellText.substring(0, expectedHtmlCellText.indexOf('<'));
            assertTrue("Html cell did not contain expected markup",
                    isElementPresentInElementWithText("div", rowCellElements.get(7), expectedHtmlCellText));
        }

        // Footer
        assertTrue("tfoot element should contain no rows",
                tFootElement.findElements(By.tagName("tr")).size() == 0);
    }

    public void testCellClickEvent() throws Exception {
        open("/uitest/listViewTest.app");

        WebDriver driver = this.getDriver();
        WebElement tableElement = driver.findElement(By.id("ui:listView:test-list-events-webdriver-test"));
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        tBodyElement.findElement(By.tagName("tr")).findElement(By.tagName("td")).click();

        assertTrue("Test component's cell click handler was not invoked after click event",
                isGlobalVariableDefinedInWindow("cellClickFired"));
    }

    public void testHeaderClickEvent() throws Exception {
        open("/uitest/listViewTest.app");

        WebDriver driver = this.getDriver();
        WebElement tableElement = driver.findElement(By.id("ui:listView:test-list-events-webdriver-test"));
        WebElement tHeadElement = tableElement.findElement(By.tagName("thead"));
        tHeadElement.findElement(By.tagName("tr")).findElement(By.tagName("th")).click();

        assertTrue("Test component's header click handler was not invoked after click event",
                isGlobalVariableDefinedInWindow("headerClickFired"));
    }

    /**
     * Check whether a variable is defined in a currently open browser window
     * @param variableName name of the variable we're looking for
     * @return true if the variable is present, false otherwise
     */
    private boolean isGlobalVariableDefinedInWindow(String variableName) {
        JavascriptExecutor js = (JavascriptExecutor) this.getDriver();
        return (Boolean) js.executeScript("if(typeof " + variableName + " === 'undefined'){return false;}else{return true;}");
    }

    /**
     * Check whether an html element with some particular text is a child of another element
     * @param tagName tag of element we are looking for
     * @param parentElement parent of the element we are looking for
     * @param text the text we'd like to check for
     * @return true if element is present and text matches, false otherwise
     */
    private boolean isElementPresentInElementWithText(String tagName, WebElement parentElement, String text) {
        List<WebElement> linkElements = parentElement.findElements(By.tagName(tagName));
        if (linkElements.size() != 1) {
            return false;
        }
        if (linkElements.get(0).getText().equals(text)) {
            return true;
        }
        return false;
    }

    /**
     * Given a list of WebElements, get a new list containing the text from each element
     * @param elements list of WebElements
     * @return list containing text from each element
     */
    private List<String> getTextFromElements(List<WebElement> elements) {
        List<String> result= new ArrayList<String>();
        for (WebElement element : elements) {
            result.add(element.getText());
        }
        return result;
    }

    /**
     * Get a presumably empty listview's empty message
     * @param tableElement main element of listview
     * @return the text that appears in the canonical empty listview message location
     */
    private String getEmptyLisViewMessage(WebElement tableElement) {
        WebElement tBodyElement = tableElement.findElement(By.tagName("tbody"));
        List<WebElement> bodyRowElements = tBodyElement.findElements(By.tagName("tr"));
        return bodyRowElements.get(0).findElement(By.tagName("td")).getText();
    }

    /**
     * Get a particular row element
     * @param tableElement main element of listview
     * @param parentContainerTagName tagname of the row's parent container
     * @param location of the row we want to retrieve
     * @return the row element
     */
    private WebElement getRowAt(WebElement tableElement, String parentContainerTagName, int index) {
        WebElement parentContainerElement = tableElement.findElement(By.tagName(parentContainerTagName));
        List<WebElement> rowElements = parentContainerElement.findElements(By.tagName("tr"));
        return rowElements.get(index);
    }

    /**
     * Given an element corresponding to a row, return a list of the header or cell elements in the order in which they
     * appear
     * @param rowElement a thead, tbody, or tfoot row element
     * @param cellTagName tag name of the cell type ('td' or 'th')
     * @return list of cell elements contained in rowElement
     */
    private List<WebElement> getCellsInRow(WebElement rowElement, String cellTagName) {
        List<WebElement> cellElements = rowElement.findElements(By.tagName(cellTagName));
        return cellElements;
    }

    /**
     * Get the number of rows that an element contains
     * @param parentContainerElement
     * @return the number of rows contained in parentContainerElement
     */
    private int getNumRows(WebElement parentContainerElement) {
        List<WebElement> rowElements = parentContainerElement.findElements(By.tagName("tr"));
        return rowElements.size();
    }
}
