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
Function.RegisterNamespace("Test.Aura.Iteration");

[ Fixture ]
Test.Aura.Iteration.HelperTest = function() {
	var targetHelper;

	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura.iteration.iterationHelper", function(path, result) {
		targetHelper = result;
	});
}
