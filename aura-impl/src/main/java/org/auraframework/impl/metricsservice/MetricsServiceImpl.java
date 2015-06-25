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

import java.io.IOException;

import aQute.bnd.annotation.component.Component;
import org.auraframework.Aura;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.service.LoggingService;
import org.auraframework.service.MetricsService;
import org.auraframework.util.json.Json;

/**
 * ResourceDef handler.
 */
@Component(provide=AuraServiceProvider.class)
public class MetricsServiceImpl implements MetricsService  {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2207073608997955461L;

	public void serializeMetrics(Json json) {
		LoggingService loggingService = Aura.getLoggingService();
		
		try {
			json.writeMapKey("perf");
			
			// actions
			json.writeMapBegin();
			json.writeMapKey("actions");
            json.writeArrayBegin();
			loggingService.serializeActions(json);
			json.writeArrayEnd();
			json.writeMapEnd();
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void clearMetrics() {
		// TODO Auto-generated method stub 
	}


}
