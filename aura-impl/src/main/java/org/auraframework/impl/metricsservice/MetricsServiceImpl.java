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
package org.auraframework.impl.metricsservice;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.LoggingService;
import org.auraframework.service.MetricsService;
import org.auraframework.util.json.Json;

import javax.inject.Inject;
import java.io.IOException;

/**
 * ResourceDef handler.
 */
@ServiceComponent
public class MetricsServiceImpl implements MetricsService {

    private LoggingService loggingService;

    /**
     *
     */
    private static final long serialVersionUID = 2207073608997955461L;

    @Override
    public void serializeMetrics(Json json) {
        try {
            json.writeMapKey("perf");

            // actions
            json.writeMapBegin();
            json.writeMapKey("actions");
            json.writeArrayBegin();
            this.loggingService.serializeActions(json);
            json.writeArrayEnd();
            json.writeMapEnd();

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Inject
    public void setLoggingService(LoggingService service) {
        this.loggingService = service;
    }

    @Override
    public void serializeMetricsSummary(Json json) {
        try {
            json.writeMapKey("perfSummary");
            // actions
            json.writeMapBegin();
            json.writeMapEntry("version", "aura");
            json.writeMapKey("actions");
            json.writeArrayBegin();
            this.loggingService.serializeActions(json);
            json.writeArrayEnd();
            json.writeMapEnd();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
