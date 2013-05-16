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
package org.auraframework.util.perfomance;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.auraframework.util.IOUtil;

/**
 * Original: CadenceGoogleChart Handles building a url request to the Google
 * Charts API.
 */
public class PTestGoogleChart {
    private static final String BASE_URL = "http://chart.apis.google.com/chart";
    private static final String[] SERIES_COLORS = { "3072F3", "FF9900", "555555", "49188F", "80C65A", "224499",
            "990066", "76A4FB", "008000", "A4653A" };

    private final String title;
    private final List<ChartAxisPoints> axisPoints;
    private long maxYDataPointForChart;
    private long maxXDataPointForChart;

    /**
     * Data structure for a point on the x-axis of the line graph. It stores the
     * x-axis label, and the data point values for each series at that axis
     * point. Conceptually, this correlates with one line from the test results
     * file, or a single test run.
     */
    public static final class ChartAxisPoints {
        private final String axisPointLabel;
        private final List<ChartPoint> seriesDataPoints;

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

    public static class ChartPoint {
        public String xValue;
        public long yValue;

        public ChartPoint(String x, long y) {
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
                for (ChartPoint point : dataPoint.seriesDataPoints) {
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
                for (ChartPoint point : dataPoint.seriesDataPoints) {
                    dataPoints.add(Long.valueOf(point.xValue));
                }
            }
            maxXDataPointForChart = Collections.max(dataPoints);
        }
        return maxXDataPointForChart;
    }

    /**
     * Creates a Map of the params necessary to make a request to the Google
     * Charts API. See http://code.google.com/apis/chart/docs/making_charts.html
     * to try and make sense of the param names.
     * 
     * @returns A Map of request parameters and their values.
     */
    public Map<String, String> buildRequestParams() {
        Map<String, String> data = new HashMap<String, String>(22);

        data.put("cht", "lxy"); // chart type (lc = line chart)
        data.put("chtt", title); // chart title
        data.put("chs", "1000x300"); // chart size
        data.put("chma", "0,5,50,0"); // chart margins

        data.put("chdlp", "t"); // chart legend position
        data.put("chdl", buildSeriesLegend()); // set the chart legend items

        data.put("chxt", "x,y,x,y"); // set the visible axes. (one extra axis
                                     // defined to provide the "ms" label)

        // set the y-axis range
        data.put("chxr", String.format("0,1,%s|1,0,%s", getMaxXDataPointForChart(), getMaxYDataPointForChart()));
        data.put("chg", "10,10,1,5"); // Grid lines
        data.put("chxl", buildAxisLabels()); // add labels for the data points
                                             // on the x-axis

        // specify colors for our data series. If there are more series than
        // colors provided, Google Charts will cycle
        // through the provided colors again as necessary. Not ideal, but with
        // that many metrics the graph would be
        // hard to read either way.
        data.put("chco", StringUtils.join(SERIES_COLORS, ","));
        data.put("chd", buildDataPoints()); // set datapoint values
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
     * Encodes a list of values into the Google Charts API "extended encoding",
     * scaling to the supplied max value.
     * http://code.google.com/apis/chart/docs/data_formats.html#extended
     * 
     * Try and dig into their data formats sometime. They're pretty annoying.
     */
    public String buildDataPoints() {

        StringBuilder data = new StringBuilder();
        data.append("t:");
        int i = 0;
        for (ChartAxisPoints axisPoint : axisPoints) {
            List<String> xValues = new ArrayList<String>();
            List<String> yValues = new ArrayList<String>();
            for (ChartPoint point : axisPoint.seriesDataPoints) {
                xValues.add("" + scaleXValue(Long.valueOf(point.xValue)));
                yValues.add("" + scaleYValue(point.yValue));
            }
            if (i != 0) {
                data.append("|");
            }
            i++;
            data.append(StringUtils.join(xValues.iterator(), ",") + "|" + StringUtils.join(yValues.iterator(), ","));
        }
        return data.toString();
    }

    public long scaleYValue(long y) {
        if (getMaxYDataPointForChart() != 0) {
            return (100 * y) / getMaxYDataPointForChart();
        }
        return 0;
    }

    public long scaleXValue(long x) {
        if (getMaxXDataPointForChart() != 0) {
            return (100 * x) / getMaxXDataPointForChart();
        }
        return 0;
    }

    /**
     * Write the chart to the specified file. If the file already exists, it
     * will be replaced.
     * 
     * @param file Write to this file.
     * @return Whether the file was successfully created.
     */
    public boolean writeToFile(File file) throws IOException {

        HttpParams httpParams = new BasicHttpParams();
        HttpConnectionParams.setConnectionTimeout(httpParams, 24000);
        HttpConnectionParams.setSoTimeout(httpParams, 24000);

        DefaultHttpClient http = new DefaultHttpClient(httpParams);

        HttpPost post = new HttpPost(BASE_URL);

        List <NameValuePair> nvps = new ArrayList<NameValuePair>();

        Map<String, String> params = buildRequestParams();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }
        post.setEntity(new UrlEncodedFormEntity(nvps));

        post.setHeader(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded; charset=UTF-8");

        HttpResponse response = http.execute(post);

        InputStream in = null;
        FileOutputStream fw = null;
        ByteArrayOutputStream baos = null;

        boolean successful = false;
        int responseCode = response.getStatusLine().getStatusCode();
        try {
            if (responseCode == 200) {
                if (file.exists()) {
                    file.delete();
                }
                file.createNewFile();

                in = new BufferedInputStream(response.getEntity().getContent());
                baos = new ByteArrayOutputStream();
                fw = new FileOutputStream(file);

                IOUtil.copyStream(in, baos);
                byte[] bytes = baos.toByteArray();
                fw.write(bytes);
                successful = true;
            } else {
                System.out.println(response.getEntity().getContent());
                throw new RuntimeException("Callout to Google Charts API failed.");
            }
        } finally {
            post.releaseConnection();
            if (in != null) {
                in.close();
            }
            if (fw != null) {
                fw.close();
            }
            if (baos != null) {
                baos.close();
            }
        }

        return successful;
    }

}
