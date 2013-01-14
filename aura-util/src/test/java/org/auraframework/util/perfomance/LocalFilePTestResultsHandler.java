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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Scanner;

import junit.framework.Test;

import org.auraframework.util.perfomance.PTestGoogleChart.ChartAxisPoints;
import org.auraframework.util.perfomance.PTestGoogleChart.ChartPoint;

/**
 * This test util is based on JTroup's AbstractCadenceTest framework. This class
 * mirrors LocalFileResultsHandler.
 * 
 * 
 * @since 0.0.178
 */
public class LocalFilePTestResultsHandler extends PTestResultsHandler {
    private final File resultsDir;

    public LocalFilePTestResultsHandler(Test test, File resultsDir) {
        super(test);
        this.resultsDir = resultsDir;
    }

    @Override
    public void handleResults(String testName, List<ChartPoint> dataPoints) throws Exception {
        File refFile = new File(resultsDir, testName);

        if (refFile.exists()) {
            appendToReferenceFile(refFile, dataPoints);
        } else {
            createNewReferenceFile(refFile, dataPoints);
        }
        generateGraphFromReferenceFile(testName, refFile);
    }

    public void generateGraphFromReferenceFile(String chartTitle, File refFile) throws Exception {
        List<ChartAxisPoints> axisPoints = getTestRuns(refFile);
        PTestGoogleChart chart = new PTestGoogleChart(chartTitle, axisPoints);

        // write the chart to a file
        File chartFile = new File(refFile.getParentFile(), refFile.getName() + "_chart.png");
        if (!chartFile.exists()) {
            chartFile.createNewFile();
        }
        chart.writeToFile(chartFile);
    }

    /**
     * Appends this run's average load time to an existing reference file.
     */
    private final void appendToReferenceFile(File refFile, List<ChartPoint> dataPoints) throws Exception {
        OutputStreamWriter fw = new OutputStreamWriter(new FileOutputStream(refFile, true), "UTF-8");
        writeResultsTo(fw, dataPoints);
        fw.append("\n");
        fw.close();
    }

    /**
     * Creates a new reference file containing this run's average load time.
     */
    private final void createNewReferenceFile(File refFile, List<ChartPoint> dataPoints) throws Exception {
        refFile.createNewFile();
        appendToReferenceFile(refFile, dataPoints);
    }

    /**
     * Writes the results of this run to the supplied Appendable
     */
    private final void writeResultsTo(Appendable out, List<ChartPoint> dataPoints) throws IOException {
        // write the current date and time
        Format formatter = new SimpleDateFormat("MM/dd HH:mm");
        String timestamp = formatter.format(new Date());
        out.append(String.format("(%s)", timestamp));

        // write out the metrics and their values
        for (ChartPoint entry : dataPoints.toArray(new ChartPoint[0])) {
            // replace colons and spaces with underscores so that we can
            // correctly identify metric names later.
            String formattedMetricName = entry.xValue.replaceAll("[:\\s]", "_");
            out.append(String.format(" %s:%d", formattedMetricName, entry.yValue));
        }
    }

    /**
     * Get the chart data for each test run stored in the file.
     */
    private final List<ChartAxisPoints> getTestRuns(File refFile) throws IOException {
        List<ChartAxisPoints> axisPoints = new ArrayList<ChartAxisPoints>();

        Scanner scanner = new Scanner(refFile);

        // read each line in the file one by one, finding the timestamp and
        // metrics
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();

            // find the axis point label (the timestamp)
            int endOfTimestampIndex = line.indexOf(")");

            String axisPointLabel = line.substring(1, endOfTimestampIndex);

            // find the data points (metric values)
            List<ChartPoint> metrics = parseMetrics(line.substring(endOfTimestampIndex + 1));

            axisPoints.add(new ChartAxisPoints(axisPointLabel, metrics));
        }

        scanner.close();

        return axisPoints;
    }

    /**
     * Find all the metric name/value pairs in a string.
     */
    private final List<ChartPoint> parseMetrics(String text) {
        List<ChartPoint> metricsMap = new ArrayList<ChartPoint>();

        String[] metrics = text.trim().split("\\s");
        for (String metric : metrics) {
            String[] pieces = metric.split(":");
            String metricName = pieces[0];
            Long metricValue = Long.valueOf(pieces[1]);
            metricsMap.add(new ChartPoint(metricName, metricValue));
        }

        return metricsMap;
    }
}
