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
package org.auraframework.docs;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponentModelFactory;
import org.auraframework.ds.servicecomponent.ModelFactory;
import org.auraframework.ds.servicecomponent.ModelInitializationException;

@ServiceComponentModelFactory
public class ApiContentsModelFactory  implements ModelFactory<ApiContentsModel> {
	
	@Inject
	ConfigAdapter configAdapter;
	
	@Override
	public ApiContentsModel modelInstance() throws ModelInitializationException {
		return new ApiContentsModel();
	}
	
	@PostConstruct
	public void init() {
		// This is messy, we should clean this up, but just converting it for the moment.
		ApiContentsModel.refreshSymbols(configAdapter.getResourceLoader());
	}
}
