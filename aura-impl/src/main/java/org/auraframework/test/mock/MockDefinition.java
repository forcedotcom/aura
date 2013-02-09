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
package org.auraframework.test.mock;

import java.io.IOException;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;
import org.auraframework.util.text.Hash;

/**
 * A simple Definition.
 */
@Serialization(referenceType = ReferenceType.IDENTITY)
public abstract class MockDefinition<D extends Definition> implements
		Definition {
	private static final long serialVersionUID = 9040467312474951787L;
	private final DefDescriptor<D> descriptor;
	protected Location location = null;

	public MockDefinition(DefDescriptor<D> descriptor) {
		this.descriptor = descriptor;
	}

	@Override
	public DefDescriptor<D> getDescriptor() {
		return descriptor;
	}

	@Override
	public String getDescription() {
		return "";
	}

	@Override
	public String getName() {
		return descriptor.getName();
	}

	@Override
	public Location getLocation() {
		return location;
	}

	@Override
	public void serialize(Json json) throws IOException {
	}

	@Override
	public boolean isValid() {
		return true;
	}

	@Override
	public void markValid() {
	}

	@Override
	public void appendDependencies(Set<DefDescriptor<?>> dependencies)
			throws QuickFixException {
	}

	@Override
	public void retrieveLabels() throws QuickFixException {
	}

	@Override
	public void validateDefinition() throws QuickFixException {
	}

	@Override
	public void validateReferences() throws QuickFixException {
	}

	@Override
	public <S extends Definition> S getSubDefinition(
			SubDefDescriptor<S, ?> descriptor) {
		return null;
	}

	@Override
	public Hash getOwnHash() {
		return null;
	}
}
