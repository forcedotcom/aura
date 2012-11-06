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
package org.auraframework.impl.java.model;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.components.ui.InputOption;
import org.auraframework.service.testdata.LocalizationServiceTestData;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.date.DateOnly;

/**
 * Used by /expressionTest/expressionFunction.cmp which expects the current return values.
 *
 *
 *
 */
@Model
public class TestModelLocalization {
    static ArrayList<InputOption> inputOptions = new ArrayList<InputOption>();
    static ArrayList<InputOption> moreInputOptions = new ArrayList<InputOption>();
    static HashMap<String, ArrayList<InputOption>> optionMap = new LinkedHashMap<String, ArrayList<InputOption>>();

    static{
        inputOptions.add(new InputOption("Option1", "Opt1", false, "option1"));
        inputOptions.add(new InputOption("Option2", "Opt2", true, "option2"));
        inputOptions.add(new InputOption("Option3", "Opt3", false, "option3"));

        moreInputOptions.add(new InputOption("Option4", "Opt4", false, "val4"));
        moreInputOptions.add(new InputOption("Option5", "Opt5", false, "val5"));
        moreInputOptions.add(new InputOption("Option6", "Opt6", false, "val6"));

        for(InputOption i : inputOptions){
            optionMap.put(i.getValue(), getSubCategory(i.getValue()));
        }
    }

    private static ArrayList<InputOption> getSubCategory(String option){
        ArrayList<InputOption> categoryOption = new ArrayList<InputOption>();
        if (option.equals("option1")){
            categoryOption.add(new InputOption("", "", false, "opt1-sub1"));
            categoryOption.add(new InputOption("", "", false, "opt1-sub2"));
            categoryOption.add(new InputOption("", "", false, "opt1-sub3"));
        }
        else if(option.equals("option2")){
            categoryOption.add(new InputOption("", "", false, "opt2-sub1"));
        }
        else if(option.equals("option3")){
            categoryOption.add(new InputOption("", "", false, "opt3-sub1"));
            categoryOption.add(new InputOption("", "", false, "opt3-sub2"));
        }
        return categoryOption;
    }

    @AuraEnabled
    public Calendar getCalendar(){
        Calendar c = Calendar.getInstance() ;
        c.set(2004, 9, 23, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarLater(){
        Calendar c = Calendar.getInstance() ;
        c.set(2005, 9, 23, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarWithTimeZone(){
        Calendar c = Calendar.getInstance() ;
        c.set(2005, 6, 4, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.setTimeZone(TimeZone.getTimeZone("GMT"));
        return c;
    }

    @AuraEnabled
    public Calendar getCalendarWithTimeZoneLater(){
        Calendar c = Calendar.getInstance() ;
        c.set(2006, 6, 4, 16, 30, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.setTimeZone(TimeZone.getTimeZone("GMT"));
        return c;
    }

    @AuraEnabled
    public Date getDate(){
        Date d = new Date(1095957000000L);
        return d;
    }

    @AuraEnabled
    public Date getDateLater(){
        Date d = new Date(1095957000001L);
        return d;
    }

    @AuraEnabled
    public Calendar getTime(){
        Calendar c = Calendar.getInstance();
        c.setTime(new Date(1095957000000L));
        return c;
    }

    @AuraEnabled
    public String getString(){
        return "Model";
    }

    @AuraEnabled
    public String getStringNull(){
        return null;
    }

    @AuraEnabled
    public String getStringEmpty(){
        return "";
    }

    @AuraEnabled
    //TODO W-967767 can't return array because of this bug
    public Object getStringArray(){
        return new String[]{"red", "green", "blue"};
    }

    @AuraEnabled
    public List<String> getStringList(){
        ArrayList<String> sl = new ArrayList<String>();
        sl.add("one");
        sl.add("two");
        sl.add("three");
        return sl;
    }

    @AuraEnabled
    public List<String> getStringListNull(){
        return null;
    }

    @AuraEnabled
    public List<List<String>> getListOfList(){
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
    public Integer getInteger(){
        return 411;
    }

    @AuraEnabled
    public Integer getIntegerNull(){
        return null;
    }

    @AuraEnabled
    //TODO W-967767 can't return array because of this bug
    public Object getIntegerArray(){
        return new Integer[]{ 123, 999, 666};
    }

    @AuraEnabled
    public Object getIntegerList(){
        ArrayList<Integer> il = new ArrayList<Integer>();
        il.add(123);
        il.add(999);
        il.add(666);
        return il;
    }

    @AuraEnabled
    public List<Integer> getIntegerListNull(){
        return null;
    }

    @AuraEnabled
    public String getIntegerString(){
        return "511";
    }

    @AuraEnabled
    public Object getObjectNull(){
        return null;
    }

    @AuraEnabled
    public Boolean getBooleanFalse(){
        return false;
    }

    @AuraEnabled
    public Boolean getBooleanTrue(){
        return true;
    }

    @AuraEnabled
    public ArrayList<Boolean> getBooleanList(){
        ArrayList<Boolean> bl = new ArrayList<Boolean>();
        bl.add(true);
        bl.add(false);
        bl.add(true);
        return bl;
    }

    @AuraEnabled
    public List<Boolean> getBooleanListNull(){
        return null;
    }

    @AuraEnabled
    public String getDoubleNull(){
        return null;
    }

    @AuraEnabled
    public Double getDouble(){
        return 4.1;
    }

    @AuraEnabled
    public String getDoubleString(){
        return "5.1";
    }

    @AuraEnabled
    public List<Double> getDoubleListNull(){
        return null;
    }

    @AuraEnabled
    public Number getInfinity(){
        return Double.POSITIVE_INFINITY;
    }

    @AuraEnabled
    public Number getNegativeInfinity(){
        return Double.NEGATIVE_INFINITY;
    }

    @AuraEnabled
    public Number getNaN(){
        return Double.NaN;
    }

    @AuraEnabled
    public Object getEmptyArray(){
        return new Object[0];
    }

    @AuraEnabled
    public Object getEmptyList(){
        return Collections.emptyList();
    }

    @AuraEnabled
    public Object getStringMultiArray(){
        return new String[][][] { { { "one" }, { "two", "three" } }, {}, { { "a", "b" }, {} } };
    }

    @AuraEnabled
    public DateOnly getDateOnly(){
        // Sep 23, 2004
        DateOnly d = new DateOnly(1095957000000L);
        return d;
    }

    @AuraEnabled
    public Date getDateTime(){
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
    public BigDecimal getNumberBigDecimal() {
        BigDecimal number = new BigDecimal("123456789123456789123456789");
        return number;
    }

    @AuraEnabled
    public Object getDates() {
        List<Date> dates = new ArrayList<Date>();
        dates.add(new Date());
        dates.add(new Date(1000L));
        dates.add(new Date(1333322872649L));
        return dates;
    }

    @AuraEnabled
    public Object getTimes() {
        List<Calendar> times = new ArrayList<Calendar>();
        Date[] dates = {
            new Date(), // now
            new Date(1000L), // early in 1970
            new Date(1333322872649L), // April 1, 2012
            new Date(0) // January 1, 1970 00:00:00.000 GMT
        };

        for (int i=0; i<dates.length; i++) {
            Calendar c = Calendar.getInstance();
            c.setTime(LocalizationServiceTestData.DATES[i]);
            times.add(c);
        }

        return times;
    }

    @AuraEnabled
    public Object getCurrencies() {
        List<BigDecimal> currencies = new ArrayList<BigDecimal>();
        currencies.add(new BigDecimal("0"));
        currencies.add(new BigDecimal("10.99"));
        currencies.add(new BigDecimal("123456789123456789123456789.12"));
        currencies.add(new BigDecimal("-12345.67891234"));
        return currencies;
    }


    @AuraEnabled
    public Object getNumbers() {
        List<BigDecimal> numbers = new ArrayList<BigDecimal>();
        numbers.add(new BigDecimal("0"));
        numbers.add(new BigDecimal("123456789123456789"));
        numbers.add(new BigDecimal("100000000000.123456789"));
        numbers.add(new BigDecimal("-1234567.123456789"));
        return numbers;
    }


    @AuraEnabled
    public Object getPercentages() {
        List<Double> percentages = new ArrayList<Double>();
        percentages.add(1.01);
        percentages.add(0.75);
        percentages.add(0.99);
        percentages.add(2.50);
        percentages.add(0.00d);
        percentages.add(0.999d);
        percentages.add(123456789.12345d);
        percentages.add(-987654321987654321987654321.2987654321d);
        return percentages;
    }


    @AuraEnabled
    public Object getStrings() {
        List<String> Strings = new ArrayList<String>();
        Strings.add("salesforce.com");
        Strings.add("1 Landmark, San Francisco");
        return Strings;
    }


    @AuraEnabled
    public Object getLocaleData() {
        List<String> localeData = new LinkedList<String>();
        AuraLocale ll = Aura.getLocalizationAdapter().getAuraLocale();
        localeData.add("Currency locale:"+ll.getCurrencyLocale().getDisplayName());
        localeData.add("Date locale:"+ll.getDateLocale().getDisplayName());
        localeData.add("Default locale:"+ll.getDefaultLocale().getDisplayName());
        localeData.add("Language locale:"+ll.getLanguageLocale().getDisplayName());
        localeData.add("Number locale:"+ll.getNumberLocale().getDisplayName());
        localeData.add("System locale:"+ll.getSystemLocale().getDisplayName());

        return localeData;
    }

}
