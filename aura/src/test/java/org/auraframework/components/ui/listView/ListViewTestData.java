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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ListViewTestData {

    public final static List<Map<String, String>> GENERATED_LIST_DATA;
    public final static List<Map<String, String>> SPECIFIED_LIST_DATA;
    public final static List<Map<String, String>> NESTED_COLUMNS_LIST_DATA;
    public final static List<Map<String, String>> NESTED_COLUMNS_BAD_LIST_DATA;

    public final static int NUM_ROWS_GENERATED_DATA = 2;
    public final static int NUM_COLS_GENERATED_DATA = 3;
    public final static int NUM_ROWS_SPECIFIED_DATA = 4;

    public final static String[] SPECIFIED_COLUMN_TITLES = { "Type:Empty String", "Type:Undefined", "Type:Text",
            "Type:Email", "Type:Checkbox", "Type:Link", "Type:Index", "Type:Html" };

    public final static int NUM_COLS_SPECIFIED_DATA = SPECIFIED_COLUMN_TITLES.length;

    static {
        GENERATED_LIST_DATA = new ArrayList<Map<String, String>>();
        for (int i = 0; i < NUM_ROWS_GENERATED_DATA; ++i) {
            Map<String, String> map = new HashMap<String, String>();
            for (int j = 0; j < NUM_COLS_GENERATED_DATA; ++j) {
                map.put("Column " + j, "value at (" + i + ", " + j + ")");
            }
            GENERATED_LIST_DATA.add(map);
        }

        SPECIFIED_LIST_DATA = new ArrayList<Map<String, String>>();
        for (int i = 0; i < NUM_ROWS_SPECIFIED_DATA; ++i) {
            Map<String, String> row = new HashMap<String, String>();
            row.put("type:empty string", "1st text value " + i);
            row.put("type:undefined", "2nd text value " + i);
            row.put("type:text", "3rd text value " + i);
            row.put("type:email", "test " + i + "@email.com");
            row.put("type:checkbox", "");
            row.put("type:link", "http://na" + i + ".salesforce.com");
            row.put("type:html", "<div style='background-color:blue'>i'm in a blue div " + i + "</div>");
            SPECIFIED_LIST_DATA.add(row);
        }

        NESTED_COLUMNS_LIST_DATA = new ArrayList<Map<String, String>>();
        for (int i = 0; i < NUM_ROWS_SPECIFIED_DATA; ++i) {
            Map<String, String> row = new HashMap<String, String>();

            // Keys in this map correspond to hard-wired fieldName attributes of
            // columns in a list in
            // listViewTest.app. That list has nested columns, and only those
            // columns that are leaf-node
            // level columns are keyed from here.
            row.put("third row 0, leaf 0", "row " + i + ", value 0");
            row.put("third row 1, leaf 1", "row " + i + ", value 1");
            row.put("third row 2, leaf 2", "row " + i + ", value 2");
            row.put("second row 2, leaf 3", "row " + i + ", value 3");
            row.put("first row 1, leaf 4", "row " + i + ", value 4");

            NESTED_COLUMNS_LIST_DATA.add(row);
        }

        NESTED_COLUMNS_BAD_LIST_DATA = new ArrayList<Map<String, String>>();
        for (int i = 0; i < NUM_ROWS_SPECIFIED_DATA; ++i) {
            Map<String, String> row = new HashMap<String, String>();
            // Keys in this map correspond to hard-wired fieldName attributes of
            // columns in a list in
            // listViewTest.app. That list has nested columns, and only those
            // columns that are non-leaf-node
            // level columns are keyed from here. Non-leaf-node columns
            // shouldn't be map-able to fields in the
            // list. So none of these fields would actually appear in the list.
            row.put("first row 0", "This should not appear in list");
            row.put("second row 0", "This should not appear in list");
            row.put("second row 1", "This should not appear in list");
            NESTED_COLUMNS_BAD_LIST_DATA.add(row);
        }
    }

}
