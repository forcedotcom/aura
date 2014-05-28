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
package org.auraframework.test.perf;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.test.perf.metrics.PerfMetrics;
import org.json.JSONException;

/**
 * Writes the files for the jenkins plots: https://wiki.jenkins-ci.org/display/JENKINS/Plot+Plugin
 */
public final class PlotUtil {

    private static final Logger LOG = Logger.getLogger(PlotUtil.class.getSimpleName());

    private static final File PLOTS_DIR = new File("target/plot").getAbsoluteFile();

    public static void plot(String metric, String yvalue) {
        File file = new File(PLOTS_DIR, metric + ".properties");
        file.getParentFile().mkdirs();
        Properties props = new Properties();
        props.put("YVALUE", yvalue);
        try {
            props.store(new FileOutputStream(file), null);
            LOG.info("wrote plot file: " + file);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "error writing " + file, e);
        }
    }

    public static void plot(PerfMetrics metrics) throws JSONException {
        LOG.info("plotting: " + metrics);
        for (String name : metrics.getAllMetricNames()) {
            plot(name, metrics.getMetric(name).get("value").toString());
        }
    }
}
