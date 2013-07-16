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
package org.auraframework.impl.java.model;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.components.ui.InputOption;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.date.*;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Maps;

/**
 * Used by /expressionTest/expressionFunction.cmp which expects the current
 * return values.
 */
@Model
public class TestJavaModel {
    static ArrayList<InputOption> inputOptions = new ArrayList<InputOption>();
    static ArrayList<InputOption> moreInputOptions = new ArrayList<InputOption>();
    static HashMap<String, ArrayList<InputOption>> optionMap = new LinkedHashMap<String, ArrayList<InputOption>>();
    static List<Item> items;
    static List<Item> itemsEmpty = new ArrayList<Item>();
    static List<Item> itemsLarge;
    
    static {
        inputOptions.add(new InputOption("Option1", "Opt1", false, "option1"));
        inputOptions.add(new InputOption("Option2", "Opt2", true, "option2"));
        inputOptions.add(new InputOption("Option3", "Opt3", false, "option3"));
        inputOptions.add(new InputOption("Option4", "Opt4", false, "option4", true));
        
        moreInputOptions.add(new InputOption("Option4", "Opt4", false, "val4"));
        moreInputOptions.add(new InputOption("Option5", "Opt5", false, "val5"));
        moreInputOptions.add(new InputOption("Option6", "Opt6", false, "val6"));

        for (InputOption i : inputOptions) {
            optionMap.put(i.getValue(), getSubCategory(i.getValue()));
        }
    }

    private static ArrayList<InputOption> getSubCategory(String option) {
        ArrayList<InputOption> categoryOption = new ArrayList<InputOption>();
        if (option.equals("option1")) {
            categoryOption.add(new InputOption("", "", false, "opt1-sub1"));
            categoryOption.add(new InputOption("", "", false, "opt1-sub2"));
            categoryOption.add(new InputOption("", "", false, "opt1-sub3"));
        } else if (option.equals("option2")) {
            categoryOption.add(new InputOption("", "", false, "opt2-sub1"));
        } else if (option.equals("option3")) {
            categoryOption.add(new InputOption("", "", false, "opt3-sub1"));
            categoryOption.add(new InputOption("", "", false, "opt3-sub2"));
        }
        return categoryOption;
    }
    
    static {
    	items = new ArrayList<Item>(10);
    	for (int i = 1; i <= 10; i++) {
            items.add(new Item("hello world" + i, "id" + i));
        }
    	itemsLarge = new ArrayList<Item>(50);
    	for (int i = 1; i <= 50; i++) {
    		itemsLarge.add(new Item("some one " + i, "id" + i));
        }
    }
    
    public static class Item implements JsonSerializable {
        private String label;
        private String value;
        
        public Item(String label, String value) {
            this.label = label;
            this.value = value;
        }
        
        public String getLabel() {
            return this.label;
        }
        
        public String getValue() {
            return this.value;
        }
        
        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("label", this.label);
            json.writeMapEntry("value", this.value);
            json.writeMapEnd();
        }
    }
    
    @AuraEnabled
    public String getDateTimeISOString() {
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("GMT"), Locale.US);
        c.set(2004, 9, 23, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        DateService dateService = DateServiceImpl.get();
        return dateService.getDateTimeISO8601Converter().format(c.getTime());
    }
    
    @AuraEnabled
    public Long getTimestamp() {
        Date d = new Date(1095957000000L);
        return d.getTime();
    }

    @AuraEnabled
    public Calendar getCalendar() {
        Calendar c = Calendar.getInstance();
        c.set(2004, 9, 23, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarLater() {
        Calendar c = Calendar.getInstance();
        c.set(2005, 9, 23, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarWithTimeZone() {
        Calendar c = Calendar.getInstance();
        c.set(2005, 6, 4, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.setTimeZone(TimeZone.getTimeZone("GMT"));
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarWithTimeZoneLater() {
        Calendar c = Calendar.getInstance();
        c.set(2006, 6, 4, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.setTimeZone(TimeZone.getTimeZone("GMT"));
        return c;
    }

    @AuraEnabled
    public Date getDate() {
        Date d = new Date(1095957000000L);
        return d;
    }

    @AuraEnabled
    public Date getDateLater() {
        Date d = new Date(1095957000001L);
        return d;
    }

    @AuraEnabled
    public String getString() {
        return "Model";
    }

    @AuraEnabled
    public String getStringNull() {
        return null;
    }

    @AuraEnabled
    public String getStringEmpty() {
        return "";
    }

    @AuraEnabled
    // TODO W-967767 can't return array because of this bug
    public Object getStringArray() {
        return new String[] { "red", "green", "blue" };
    }

    @AuraEnabled
    public List<String> getStringList() {
        ArrayList<String> sl = new ArrayList<String>();
        sl.add("one");
        sl.add("two");
        sl.add("three");
        return sl;
    }

    @AuraEnabled
    public List<String> getStringListNull() {
        return null;
    }

    @AuraEnabled
    public List<List<String>> getListOfList() {
        List<List<String>> listofList = new ArrayList<List<String>>();
        ArrayList<String> l1 = new ArrayList<String>();
        l1.add("one");
        l1.add("two");
        l1.add("three");
        ArrayList<String> l2 = new ArrayList<String>();
        l2.add("un");
        l2.add("do");
        l2.add("tres");
        ArrayList<String> l3 = new ArrayList<String>();
        l3.add("ek");
        l3.add("do");
        l3.add("theen");
        listofList.add(l1);
        listofList.add(l2);
        listofList.add(l3);
        return listofList;
    }

    @AuraEnabled
    public Integer getInteger() {
        return 411;
    }

    @AuraEnabled
    public Integer getIntegerNull() {
        return null;
    }

    @AuraEnabled
    // TODO W-967767 can't return array because of this bug
    public Object getIntegerArray() {
        return new Integer[] { 123, 999, 666 };
    }

    @AuraEnabled
    public Object getIntegerList() {
        ArrayList<Integer> il = new ArrayList<Integer>();
        il.add(123);
        il.add(999);
        il.add(666);
        return il;
    }

    @AuraEnabled
    public List<Integer> getIntegerListNull() {
        return null;
    }

    @AuraEnabled
    public String getIntegerString() {
        return "511";
    }

    @AuraEnabled
    public Object getObjectNull() {
        return null;
    }

    @AuraEnabled
    public Boolean getBooleanFalse() {
        return false;
    }

    @AuraEnabled
    public Boolean getBooleanTrue() {
        return true;
    }

    @AuraEnabled
    public ArrayList<Boolean> getBooleanList() {
        ArrayList<Boolean> bl = new ArrayList<Boolean>();
        bl.add(true);
        bl.add(false);
        bl.add(true);
        return bl;
    }

    @AuraEnabled
    public List<Boolean> getBooleanListNull() {
        return null;
    }

    @AuraEnabled
    public String getDoubleNull() {
        return null;
    }

    @AuraEnabled
    public Double getDouble() {
        return 4.1;
    }

    @AuraEnabled
    public String getDoubleString() {
        return "5.1";
    }

    @AuraEnabled
    public List<Double> getDoubleListNull() {
        return null;
    }

    @AuraEnabled
    public Number getInfinity() {
        return Double.POSITIVE_INFINITY;
    }

    @AuraEnabled
    public Number getNegativeInfinity() {
        return Double.NEGATIVE_INFINITY;
    }

    @AuraEnabled
    public Number getNaN() {
        return Double.NaN;
    }

    @AuraEnabled
    public Object getEmptyArray() {
        return new Object[0];
    }

    @AuraEnabled
    public Object getEmptyList() {
        return Collections.emptyList();
    }

    @AuraEnabled
    public Object getStringMultiArray() {
        return new String[][][] { { { "one" }, { "two", "three" } }, {}, { { "a", "b" }, {} } };
    }

    @AuraEnabled
    public DateOnly getDateOnly() {
        // Sep 23, 2004
        DateOnly d = new DateOnly(1095957000000L);
        return d;
    }

    @AuraEnabled
    public Date getDateTime() {
        // May 10, 2012, 10:45 PM GMT
        Date d = new Date(1336689900000L);
        return d;
    }

    @AuraEnabled
    public Boolean getTrue() {
        return true;
    }

    @AuraEnabled
    public Boolean getFalse() {
        return false;
    }

    @AuraEnabled
    public Boolean getChecked() {
        return getTrue();
    }

    @AuraEnabled
    public double getCurrency() {
        return getDecimal();
    }

    @AuraEnabled
    public String getDateString() throws ParseException {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        return dateFormat.format(dateFormat.parse("1999-5-30"));
    }

    @AuraEnabled
    public double getDecimal() {
        return 123456.789;
    }

    @AuraEnabled
    public String getEmail() {
        return "aura@salesforce.com";
    }

    @AuraEnabled
    public Long getNumber() {
        return new Long("123456789123456789");
    }

    @AuraEnabled
    public String getNumberAsString() {
        return getNumber().toString();
    }

    @AuraEnabled
    public Boolean getOption() {
        return getTrue();
    }

    @AuraEnabled
    public double getPercent() {
        return 12.345;
    }

    @AuraEnabled
    public String getPhone() {
        return "(415) 555-3131 ext. 123";
    }

    @AuraEnabled
    public String getSearch() {
        return getString();
    }

    @AuraEnabled
    public String getSecret() {
        return "password";
    }

    @AuraEnabled
    public ArrayList<InputOption> getSelect() {
        return inputOptions;
    }

    @AuraEnabled
    public boolean getSelectOption() {
        return true;
    }

    @AuraEnabled
    public ArrayList<InputOption> getSelectOptions() {
        return inputOptions;
    }

    @AuraEnabled
    public ArrayList<InputOption> getMoreSelectOption() {
        return moreInputOptions;
    }

    @AuraEnabled
    public String getText() {
        return getString();
    }

    @AuraEnabled
    public String getTextAreaText() {
        return "Some text from server\nspecially created to fit in....\n\n\na textarea!";
    }

    @AuraEnabled
    public String getUrl() {
        return "http://www.salesforce.com";
    }
    
    @AuraEnabled
    public String getSelectValue() {
        return "option1";
    }
    
    @AuraEnabled
    public Map<String,String> getMap(){
        Map<String,String> items= Maps.newHashMap();
        items.put("fruit", "apple");
        items.put("animal", "bear");
        return items;
    }
    
    @AuraEnabled
    public List<Item> getItems() throws QuickFixException {
    	String dataType = (String)Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes().getValue("dataType");
    	if (dataType == null) {
    		return items;
    	} else if (dataType.equals("largeList")) {
    		return itemsLarge;
    	} else if (dataType.equals("emptyList")) {
    		return itemsEmpty;
    	}
        return items;
    }
}
