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
package org.auraframework.components.test.java.model;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponentModelFactory;
import org.auraframework.ds.servicecomponent.ModelFactory;
import org.auraframework.ds.servicecomponent.ModelInitializationException;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;

@ServiceComponentModelFactory
public class TestModelToAttachEventsFactory  implements ModelFactory<TestModelToAttachEvents> {

	@Inject
	ContextService contextService;
	
	@Inject
	InstanceService instanceService;	
	
	@Override
	public TestModelToAttachEvents modelInstance() throws ModelInitializationException {
		try {
			return new TestModelToAttachEvents(contextService, instanceService);
		} catch (Exception e) {
			throw new ModelInitializationException(e.getMessage(), e);
		}
	}
}
