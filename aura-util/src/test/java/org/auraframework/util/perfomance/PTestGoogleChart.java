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
package org.auraframework.util.perfomance;

import java.io.*;
import java.util.*;
import java.util.Map.Entry;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.lang.StringUtils;

import org.auraframework.util.IOUtil;


/**
 * Original: CadenceGoogleChart
 * Handles building a url request to the Google Charts API.
 */
public class PTestGoogleChart {
    private static final String BASE_URL = "http://chart.apis.google.com/chart";
    private static final String[] SERIES_COLORS = { "3072F3","FF9900","555555","49188F","80C65A","224499","990066","76A4FB","008000","A4653A" };

    private String title;
    private List<ChartAxisPoints> axisPoints;
    private long maxYDataPointForChart;
    private long maxXDataPointForChart;
    /**
     * Data structure for a point on the x-axis of the line graph. It stores the x-axis label,
     * and the data point values for each series at that axis point. Conceptually, this correlates
     * with one line from the test results file, or a single test run.
     */
    public static final class ChartAxisPoints {
        private String axisPointLabel;
        private List<ChartPoint> seriesDataPoints;

        public ChartAxisPoints(String axisPointLabel, List<ChartPoint> seriesDataPoints) {
            super();
            this.axisPointLabel = axisPointLabel;
            this.seriesDataPoints = seriesDataPoints;
        }

        public String getAxisPointLabel() {
            return this.axisPointLabel;
        }

        public List<ChartPoint> getSeriesDataPoints() {
            return this.seriesDataPoints;
        }
    }
    public static class ChartPoint{
        public String xValue;
        public long yValue;
        public ChartPoint(String x, long y){
            xValue = x;
            yValue = y;
        }
    }
    public PTestGoogleChart(String title, List<ChartAxisPoints> axisPoints) {
        this.title = title;
        this.axisPoints = axisPoints;
    }

    /**
     * Get the maximum Y data point to show in the chart.
     */
    public long getMaxYDataPointForChart() {

        if (maxYDataPointForChart == 0) {
            List<Long> dataPoints = new ArrayList<Long>();
            for (ChartAxisPoints dataPoint : axisPoints) {
                for(ChartPoint point: dataPoint.seriesDataPoints){
                    dataPoints.add(point.yValue);
                }
            }
            maxYDataPointForChart = Collections.max(dataPoints);
        }
        return maxYDataPointForChart;
    }
    /**
     * Get the maximum X data point to show in the chart.
     */
    public long getMaxXDataPointForChart() {

        if (maxXDataPointForChart == 0) {
            List<Long> dataPoints = new ArrayList<Long>();
            for (ChartAxisPoints dataPoint : axisPoints) {
                for(ChartPoint point: dataPoint.seriesDataPoints){
                    dataPoints.add(Long.valueOf(point.xValue));
                }
            }
            maxXDataPointForChart = Collections.max(dataPoints);
        }
        return maxXDataPointForChart;
    }
    /**
     * Creates a Map of the params necessary to make a request to the Google Charts API.
     * See http://code.google.com/apis/chart/docs/making_charts.html to try and make sense of the param names.
     *
     * @returns A Map of request parameters and their values.
     */
    public Map<String, String> buildRequestParams() {
        Map<String, String> data = new HashMap<String, String>(22);

        data.put("cht", "lxy"); // chart type (lc = line chart)
        data.put("chtt", title); // chart title
        data.put("chs", "1000x300"); // chart size
        data.put("chma", "0,5,50,0"); // chart margins

        data.put("chdlp", "t");  // chart legend position
        data.put("chdl", buildSeriesLegend()); // set the chart legend items

        data.put("chxt", "x,y,x,y"); // set the visible axes. (one extra axis defined to provide the "ms" label)

        // set the y-axis range
        data.put("chxr", String.format("0,1,%s|1,0,%s",getMaxXDataPointForChart(), getMaxYDataPointForChart()));
        data.put("chg", "10,10,1,5"); //Grid lines
        data.put("chxl", buildAxisLabels()); // add labels for the data points on the x-axis

        // specify colors for our data series. If there are more series than colors provided, Google Charts will cycle
        // through the provided colors again as necessary. Not ideal, but with that many metrics the graph would be
        // hard to read either way.
        data.put("chco", StringUtils.join(SERIES_COLORS, ","));
        data.put("chd", buildDataPoints()); //set datapoint values
        return data;
    }

    /**
     * Get a string representing the labels for the x-axis.
     */
    public String buildAxisLabels() {
        StringBuilder string = new StringBuilder();
        string.append("2:|Number of cmps >>|");
        string.append("3:|Time in μs^");
        return string.toString();
    }

    /**
     * Get a string representing the label for each series in this chart.
     */
    public String buildSeriesLegend() {
        List<String> seriesNames = new ArrayList<String>();
        for (ChartAxisPoints axisPoint : axisPoints) {
            seriesNames.add(axisPoint.axisPointLabel);
        }
        return StringUtils.join(seriesNames.iterator(), "|");
    }

    /**
     * Encodes a list of values into the Google Charts API "extended encoding", scaling to the supplied max value.
     * http://code.google.com/apis/chart/docs/data_formats.html#extended
     *
     * Try and dig into their data formats sometime.  They're pretty annoying.
     */
    public String buildDataPoints() {

        StringBuilder data = new StringBuilder();
        data.append("t:");
        int i =0 ;
        for (ChartAxisPoints axisPoint : axisPoints) {
             List<String> xValues = new ArrayList<String>();
             List<String> yValues = new ArrayList<String>();
             for(ChartPoint point : axisPoint.seriesDataPoints){
                 xValues.add(""+scaleXValue(Long.valueOf(point.xValue)));
                 yValues.add(""+scaleYValue(point.yValue));
             }
             if(i!=0){data.append("|");}i++;
             data.append(StringUtils.join(xValues.iterator(), ",") +"|" + StringUtils.join(yValues.iterator(), ","));
        }
        return data.toString();
    }

    public long scaleYValue(long y){
        if(getMaxYDataPointForChart()!=0)
            return (100*y)/getMaxYDataPointForChart();
        return 0;
    }
    public long scaleXValue(long x){
        if(getMaxXDataPointForChart()!=0)
            return (100*x)/getMaxXDataPointForChart();
        return 0;
    }
    /**
     * Write the chart to the specified file. If the file already exists, it will be replaced.
     * @param file Write to this file.
     * @return Whether the file was successfully created.
     */
    public boolean writeToFile(File file) throws IOException {
        HttpClient http = new HttpClient();
        http.getParams().setSoTimeout(24000); // don't wait forever

        PostMethod method = new PostMethod(BASE_URL);
        method.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

        Map<String, String> params = buildRequestParams();
        for (Entry<String, String> param : params.entrySet()) {
            method.addParameter(new NameValuePair(param.getKey(), param.getValue()));
        }

        InputStream in = null;
        FileOutputStream fw = null;
        ByteArrayOutputStream baos = null;

        boolean successful = false;
        int responseCode = http.executeMethod(method);
        try {
            if (responseCode == 200) {
                if (file.exists()) {
                    file.delete();
                }
                file.createNewFile();

                in = new BufferedInputStream(method.getResponseBodyAsStream());
                baos = new ByteArrayOutputStream();
                fw = new FileOutputStream(file);

                IOUtil.copyStream(in, baos);
                byte[] bytes = baos.toByteArray();
                fw.write(bytes);
                successful = true;
            } else {
                System.out.println(method.getResponseBodyAsString());
                throw new RuntimeException("Callout to Google Charts API failed.");
            }
        }
        finally {
            method.releaseConnection();
            if(in!=null) in.close();
            if(fw!=null) fw.close();
            if(baos!=null) baos.close();
        }

        return successful;
    }

}
