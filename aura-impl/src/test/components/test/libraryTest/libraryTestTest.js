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
({
	/**
	 * The imported Include is loaded correctly and hung off of the helper with
	 * property name given in the cmp.
	 */
	testBasicInclude : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.basicFirst);
			$A.test.assertEquals("1st", helper.imported.basicFirst());
		}
	},

	/**
	 * The imported Include is properly injected into the defined Include.
	 */
	testImportsOne : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.expectsImport);
			$A.test.assertEquals("TEST:1st", helper.imported.expectsImport());
		}
	},

	/**
	 * An Include may be imported into multiple Includes.
	 */
	testImportsReused : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.reusesImport);
			$A.test.assertEquals("REUSED:1st", helper.imported.reusesImport());
		}
	},

	/**
	 * Multiple Includes are properly injected into the defined Include.
	 */
	//
	_testImportsMultiple : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.externallyImported);
			$A.test
					.assertDefined(helper.externallyImported.handlesMultipleImports);
			$A.test.assertEquals("MULTIPLE:1st|2nd|", helper.externallyImported
					.handlesMultipleImports());
		}
	},

	/**
	 * The imported Include, which has an import of its own, is properly
	 * injected into the defined Include.
	 */
	testImportsNested : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.expectsImportAlso);
			$A.test.assertEquals("ALSO:TEST:1st", helper.imported
					.expectsImportAlso());
		}
	},

	/**
	 * The exported object is properly wrapped and shimmed.
	 */
	testExport : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.hasVars);
			$A.test.assertEquals("I was exported. I imported: undefined",
					helper.imported.hasVars());
		}
	},

	/**
	 * The exported object can accept an imported Include.
	 */
	testImportsAndExport : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.importsAndExport);
			$A.test.assertEquals("EXPORTED IMPORT:1st|", helper.imported
					.importsAndExport());
		}
	},

	/**
	 * External Includes can be imported.
	 */
	testImportsExternal : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.externallyImported);
			$A.test.assertDefined(helper.externallyImported.expectsImport);
			$A.test.assertEquals("EXTERNALLY:1st", helper.externallyImported
					.expectsImport());
		}
	},

	/**
	 * The imported Include, which is external and has an import of its own, is
	 * properly injected into the defined Include.
	 */
	testImportsExternalNested : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.externallyImported);
			$A.test.assertDefined(helper.externallyImported.expectsImportAlso);
			$A.test.assertEquals("EXTERIORALLY:TEST:1st",
					helper.externallyImported.expectsImportAlso());
		}
	},

	/**
	 * The exported object can accept multiple external imported Includes.
	 */
	testImportsExternalAndExport : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.externallyImported);
			$A.test.assertDefined(helper.externallyImported.importsAndExport);
			$A.test.assertEquals("EXPORTED EXTERNAL IMPORT:1st|2nd|",
					helper.externallyImported.importsAndExport());
		}
	},

	/**
	 * Multiple external Includes can be imported.
	 */
	testImportsMultipleExternal : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			$A.test.assertDefined(helper.externallyImported);
			$A.test
					.assertDefined(helper.externallyImported.handlesMultipleImports);
			$A.test.assertEquals("EXTERNAL:1st|2nd|TEST:1st|",
					helper.externallyImported.handlesMultipleImports());
		}
	},

	/**
	 * Library Include instances are persistent.
	 */
	testLibraryInstancePersistent : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();
			helper.imported.basicFirst();
			$A.test.assertEquals(1, helper.imported.basicFirst.getCounter());
			helper.imported.basicFirst();
			$A.test.assertEquals(2, helper.imported.basicFirst.getCounter());
		}
	},

	/**
	 * Library Include instances are reused amongst imports.
	 */
	testLibraryInstanceReused : {
		test : function(cmp) {
			var helper = cmp.getDef().getHelper();

			helper.imported.basicFirst();
			$A.test.assertEquals(1, helper.imported.basicFirst.getCounter());
			helper.imported.reusesImport();
			$A.test.assertEquals(2, helper.imported.basicFirst.getCounter());
			helper.imported.expectsImport();
			$A.test.assertEquals(3, helper.imported.basicFirst.getCounter());
			helper.imported.expectsImportAlso();
			$A.test.assertEquals(4, helper.imported.basicFirst.getCounter());

			// external imports also
			helper.externallyImported.expectsImport();
			$A.test.assertEquals(5, helper.imported.basicFirst.getCounter());
			helper.externallyImported.expectsImportAlso()
			$A.test.assertEquals(6, helper.imported.basicFirst.getCounter());
		}
	}
})