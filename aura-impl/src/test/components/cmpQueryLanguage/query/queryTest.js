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
    // Checks if undefined variable message is correct. Message varies across browsers.
    checkUndefinedMsg : function(variable, msg) {
        var chromeMsg = variable + " is not defined";
        var ieMsg = "\'" + variable + "\' is undefined";       
        var ieOldMsg= "The value of the property \'" + variable + "\' is null or undefined, not a Function object"
        var iosMsg = "Can't find variable: " + variable;

        if (msg == chromeMsg || msg == ieMsg || msg == iosMsg || ieOldMsg) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Verify that $A.getQueryStatement().query() by default queries on components and selects
     * all fields on the component object.
     */
    testDefaultViewAndDefaultFields:{
        test:function(cmp){
            var result = $A.getQueryStatement().query();
            // Verify there are 2 components, 1 for the cmpQueryLanguage:query
            // component itself and 1 for aura:component
            this.verifyQueryResultCount(result, 2);

            var rows = result.rows;
            $A.test.assertTruthy(rows);
            $A.test.assertTrue($A.util.isArray(rows), "Query result set should be an array.");
            $A.test.assertEquals(2, rows.length, "Unexpected number of rows in result set.");

            // Verify that by default the query returned components
            $A.test.assertEquals("Component", rows[0].auraType, "Expected to see root component in the result set.");
            $A.test.assertEquals("Component", rows[1].auraType, "Expected to see super component in the result set.");

            // Verify that the components
            $A.test.assertEquals("markup://cmpQueryLanguage:query", rows[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected to see cmpQueryLanguage:query in the result set.");
            // Verify that "*" is chosen as default
            $A.test.assertEquals($A.getRoot(), rows[0], "Expected to see all fields by default in the result set.");
            $A.test.assertEquals($A.getRoot().getSuper(), rows[1], "Expected to see aura:component in the result set.");
            $A.test.assertEquals("markup://aura:component", rows[1].getDef().getDescriptor().getQualifiedName(),
                    "Expected to see aura:component in the result set.");
        }
    },
    /**
     * Verify that dynamically added components are considered by COQL.
     */
    testQueryDynamicallyAddedComponents:{
        test:function(cmp){
            var result = $A.getQueryStatement().query();
            this.verifyQueryResultCount(result, 2);
            $A.newCmpAsync(
                this,
                function(newCmp){
                    cmp.getValue("v.body").push(newCmp);
                },
                {
                    componentDef:"markup://aura:text",
                    localId:"txt_Id"
                },
                cmp
            );
            $A.eventService.finishFiring();

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                result = $A.getQueryStatement().query();
                this.verifyQueryResultCount(result, 3);
                $A.test.assertEquals(cmp.find("txt_Id"), result.rows[2], "Components created on client side are not retrieved by query.");
            });
        }
    },
    /**
     * Verify query on different view by specifying $A.getQueryStatement().from('<view name>')
     * The supported views are "component"(default view), "controllerDef",
     * "modelDef", "providerDef", "rendererDef", "helperDef"
     */
    testQueryOnCustomViews:{
        test:function(cmp){
            var result = $A.getQueryStatement().from("componentDef").query();
            this.verifyQueryResultCount(result, $A.componentService.getRegisteredComponentDescriptors().length);
            $A.test.assertEquals("ComponentDef" , result.rows[0].auraType);

            // Verify all supported views
            var views = {"controllerDef" : "ControllerDef",
                         "modelDef" :"ModelDef",
                         "providerDef" : "ProviderDef",
                         "rendererDef" : "RendererDef",
                         "helperDef" : "HelperDef"
                         }
            for(var view in views){
                result = $A.getQueryStatement().from(view).query();
                $A.test.assertTruthy(result);
                $A.test.assertTrue(result.rowCount>0, "from('"+view+"').query() returned no rows in result set.");
                $A.test.assertEquals(views[view] , result.rows[0].auraType);
            }

            // Verify that specifying invalid field or undefined field will
            // result in Javascript error.
            try{
                $A.getQueryStatement().from("foo").query();
                $A.test.fail("Should not have accepted invalid view:")
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Invalid view : foo : undefined",e.message);
            }

            // Verify that empty, undefined and null value for from() just
            // results in using default view.
            result = $A.getQueryStatement().query();
            this.verifyIdenticalResultSet(result , $A.getQueryStatement().from().query());
            this.verifyIdenticalResultSet(result , $A.getQueryStatement().from(undefined).query());
            this.verifyIdenticalResultSet(result , $A.getQueryStatement().from(null).query());
        }
    },
    /**
     * Verify specifying fields to select.
     *
     */
    testFields:{
        test:[function(cmp){
            aura.test.setTestTimeout(15000);
        // 1. Verify specifying empty field parameter
            var result = $A.getQueryStatement().from().query();
            this.verifyQueryResultCount(result, 2);
            // Verify that "*" is chosen as default
            $A.test.assertEquals($A.getRoot(), result.rows[0], "Expected to see all fields by default in the result set.");

        // 2. Verify specifying 1 valid field
            result = $A.getQueryStatement().field('globalId').query();
            this.verifyQueryResultCount(result, 2);
            var row = result.rows[0];
            $A.test.assertTruthy(row.globalId);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
            $A.test.assertEquals(1, $A.test.objectKeys(row).length, "Query with 1 field specification returned extra fields in result set.");

        // 3. Multiple fields (one for get function and one for is function)
        // with repetition
            result = $A.getQueryStatement().field('globalId').field('Concrete').field('auraType').field('globalId').query();
            this.verifyQueryResultCount(result, 2);
            var row = result.rows[0];
            $A.test.assertEquals(3, $A.test.objectKeys(row).length, "Query with 3 field specification returned extra fields in result set.");
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
            $A.test.assertEquals(cmp.isConcrete(), row.Concrete);
            $A.test.assertEquals(cmp.auraType, row.auraType);
        },
        // Boundary cases for individual fields
        function(cmp){
        // 1. Verify specifying a non existing field
            // TODO(W-1488665): Is this fine, we accept non existing fields in select query
            // and return a column with undefined as value
            var result = $A.getQueryStatement().field('foo').query();
            this.verifyQueryResultCount(result, 2);
            var row = result.rows[0];
            $A.test.assertEquals(1, $A.test.objectKeys(row).length, "Query with invalid field returned extra fields in result set.");
            // Verify that the result set has undefined as the value for a
            // invalid query field
            $A.test.assertTrue(row.foo === undefined, "Invalid fields should result in 'undefined' values in result set.");

        // 2. Verifying specifying empty, undefined and null will result in
        // using '*' as default for all fields
            result = $A.getQueryStatement().query();
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().field().query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().field('').query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().field(undefined).query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().field(null).query());

        // 3. Verify combination of valid fields and null/undefined
            result = $A.getQueryStatement().field('globalId').field(null).field(undefined).query();
            this.verifyQueryResultCount(result, 2);
            row = result.rows[0];
            $A.test.assertTruthy(row.globalId);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
            $A.test.assertEquals(3, $A.test.objectKeys(row).length, "Query returned extra fields in result set.");
            $A.test.assertTrue(row["null"] === undefined);
            $A.test.assertTrue(row.undefined === undefined);


        // 4. Verify specifying * as field
            result = $A.getQueryStatement().field('*').query();
            this.verifyQueryResultCount(result, 2);
            $A.test.assertEquals($A.getRoot(), result.rows[0], "Expected to see all fields in the result set.");
        }]
    },
    /**
     * Verify specifying derived fields to select.
     *
     */
    testDerivedFields:{
        test:[function(cmp){
            aura.test.setTestTimeout(15000);
        // 1. A derived field
            var result = $A.getQueryStatement().field('descriptor', 'getDef().getDescriptor().toString()').query();
            this.verifyQueryResultCount(result, 2);
            var row = result.rows[0];
            $A.test.assertEquals(1, $A.test.objectKeys(row).length, "Query returned extra fields in result set.");
            $A.test.assertEquals(cmp.getDef().getDescriptor().toString() , row.descriptor,
                    "Query failed to return correct result for derived field");

        // 2. Multiple derived fields
            result = $A.getQueryStatement().field('descriptor', 'getDef().getDescriptor().toString()').field('concrete', 'isConcrete()').field('globalId').query();
            this.verifyQueryResultCount(result, 2);
            row = result.rows[0];
            $A.test.assertEquals(3, $A.test.objectKeys(row).length, "Query with multiple derived fields returned extra fields in result set.");
            $A.test.assertEquals(cmp.getDef().getDescriptor().toString(), row.descriptor);
            $A.test.assertEquals(cmp.isConcrete(), row.concrete);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
        },
        // Boundary cases for Derived fields
        function(cmp){
            var result;
        // 1. Specifying a non function for field
            try{
                result = $A.getQueryStatement().field('getDef().getDescriptor().toString()', 'desc').query();
                $A.test.fail('should not accept literals as derived field');
            }catch(e){
                $A.test.assertTrue(this.checkUndefinedMsg('desc', e.message), "desc should not be defined");
            }

        // 2. Specify a invalid function as derived field
            try{
                result = $A.getQueryStatement().field('foo', 'bar()').query();
                $A.test.fail('Should not accept arbitraty functions as derived field')
            }catch(e){
                $A.test.assertTrue(this.checkUndefinedMsg('bar', e.message), "bar should not be defined");
            }

        // 3. Specify explicit function with return value
            // TODO(W-1488665): This works fine but ('foo','desc') is not valid. '123' should probably fail too
            result = $A.getQueryStatement().field('foo', '123').query();
            $A.log(result);

        // 4. undefined and null as derived fields
            result = $A.getQueryStatement().field('globalId', undefined).query();
            this.verifyQueryResultCount(result, 2);
            $A.test.assertEquals(cmp.getGlobalId(), result.rows[0].globalId);
            result = $A.getQueryStatement().field('globalId', null).query();
            this.verifyQueryResultCount(result, 2);
            $A.test.assertEquals(cmp.getGlobalId(), result.rows[0].globalId);
        }]
    },
    /**
     * Verify specifying multiple fields to select. Multiple fields as comma
     * separated values
     *
     */
    testMultipleFields:{
        test:[function(cmp){
            aura.test.setTestTimeout(15000);
        // 1. Specifying multiple fields as comma separated values
            var result = $A.getQueryStatement().fields('concrete, globalId').query();
            this.verifyQueryResultCount(result, 2);
            row = result.rows[0];
            $A.test.assertEquals(2, $A.test.objectKeys(row).length, "Query with multiple fields is CSV format returned extra fields in result set.");
            $A.test.assertEquals(cmp.isConcrete(), row.concrete);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);

        // 2. Specifying multiple fields as array
            // TODO: Will fail, although it appears like this can be supported
            // easily and AuraDevToolService.filterFields() uses an array to
            // store the fields anyway.
            /**
             * result = $A.getQueryStatement().fields(['concrete', 'globalId']).query();
             * this.verifyQueryResultCount(result, 2); row = result.rows[0];
             * $A.test.assertEquals(2, $A.test.objectKeys(row).length, "Query with
             * multiple fields in array format returned extra fields in result
             * set."); $A.test.assertEquals(cmp.isConcrete(), row.concrete);
             * $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
             */
        },
        // Boundary cases for multiple fields specification
        function(cmp){
            // 1. Specifying invalid field among multiple fields as comma
            // separated values
            var result = $A.getQueryStatement().fields('concrete, foo, globalId').query();
            this.verifyQueryResultCount(result, 2);
            row = result.rows[0];
            $A.test.assertEquals(3, $A.test.objectKeys(row).length, "Query with multiple derived fields returned extra fields in result set.");
            $A.test.assertEquals(cmp.isConcrete(), row.concrete);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
            $A.test.assertTrue( row.foo == undefined);

            // 2. Specifying derived fields
            var result = $A.getQueryStatement().fields('concrete, getDef().getDescriptor().toString(), globalId').query();
            this.verifyQueryResultCount(result, 2);
            row = result.rows[0];
            $A.test.assertEquals(3, $A.test.objectKeys(row).length, "Query with multiple derived fields returned extra fields in result set.");
            $A.test.assertEquals(cmp.isConcrete(), row.concrete);
            $A.test.assertEquals(cmp.getGlobalId(), row.globalId);
            $A.test.assertTrue(row["getDef().getDescriptor().toString()"] == undefined);
        }]
    },
    /**
     * Verify specifying where clause. query() accepts a function to perform
     * filtering. For example:
     * $A.getQueryStatement().from("component").where("isRendered()===true").query() Note: when
     * using where() clause with fields(), make sure the attributes used in
     * where() clause are also included in fields()
     */
    testWhere:{
        test:[function(cmp){
            aura.test.setTestTimeout(15000);
        // 1. Use a getZZZ function as where condition
            var result = $A.getQueryStatement().from("component").where("getDef().getDescriptor().toString()==='markup://cmpQueryLanguage:query'").query();
            this.verifyQueryResultCount(result, 1);
            $A.test.assertEquals(cmp,result.rows[0], "Using where clause returned the wrong result set.");

        // 2. Use a isZZZ function as where condition
            result = $A.getQueryStatement().from("component").where("isRendered() === false").query();
            this.verifyQueryResultCount(result, 1);
            $A.test.assertEquals(cmp.getSuper(),result.rows[0], "Using where clause returned the wrong result set.");

        // 3. Using multiple conditions
            result = $A.getQueryStatement().from("component")
                        .where("getDef().getDescriptor().toString()==='markup://cmpQueryLanguage:query' && isRendered() === true")
                        .query();
            this.verifyQueryResultCount(result, 1);
            $A.test.assertEquals(cmp,result.rows[0], "Using where clause with multiple conditins returned the wrong result set.");

        // 4. Empty result set
            result = $A.getQueryStatement().from("component")
                        .where("getDef().getDescriptor().toString()==='markup://cmpQueryLanguage:query' && isRendered() === false")
                        .query();
            this.verifyQueryResultCount(result, 0);

        // 5. Where clause on selected fields
            result = $A.getQueryStatement()
                        .from("component")
                        .where("desc==='markup://cmpQueryLanguage:query'")
                        .field("desc","getDef().getDescriptor().toString()")
                        .query();
            this.verifyQueryResultCount(result, 1);
            $A.test.assertEquals(1, $A.test.objectKeys(result.rows[0]).length, "Query returned extra fields in result set.");
            $A.test.assertEquals(cmp.getDef().getDescriptor().toString() , result.rows[0].desc);
            // Where clause on unselected fields
            try{
                $A.getQueryStatement()
                    .from("component")
                    .where("getDef().getDescriptor().toString() === 'markup://cmpQueryLanguage:query'")
                    .field("globalId")
                    .query();
                fail("Where clause on unselected fields should result in error.");
            }catch(e){}

        },
        // Boundary conditions
        function(cmp){
        // 1. Use literal as where condition
            try{
                result = $A.getQueryStatement().from("component").where("foo").query();
                $A.test.fail("Should not be able to use literals in where clause");
            }catch(e){
                $A.test.assertTrue(this.checkUndefinedMsg('foo', e.message), "foo should not be defined");
            }

        // 2. Verify that null, undefined and empty values for where clause
        // don't barf
            var result = $A.getQueryStatement().from("component").query();
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').where(undefined).query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').where(null).query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').where().query());
        }]
    },
    /**
     * Verify specifying groupBy clause in query.
     * Only 1 field is supported with groupBy caluse
     */
    testGroupBy:{
        test:[function(cmp){      	
            var whereClause = "nameSpace == 'aura'";
            var result = $A.getQueryStatement().from('componentDef').field('nameSpace','getDescriptor().getNamespace()').where(whereClause).groupBy('nameSpace').query()
                            
            $A.test.assertEquals(1, result.groupCount);
        },
        function(cmp){        	
        //1. null, undefined and blank as group by clause
            var result = $A.getQueryStatement().from("component").query();
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').groupBy().query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').groupBy(null).query());
            this.verifyIdenticalResultSet(result, $A.getQueryStatement().from('component').groupBy().query());
        //2. Groupby an unselected field
            result = $A.getQueryStatement().field('globalId').groupBy('rendered').query();
            this.verifyQueryResultCount(result, 2);
            $A.test.assertEquals(1, result.groupCount);

            result = $A.getQueryStatement().field('globalId').groupBy('globalId').query();
            this.verifyQueryResultCount(result, 2);
            $A.test.assertEquals(2, result.groupCount);
        //3. Specifying unknown attribute if groupBy() clause is the same as case 2, where we use an unselected field in where clause.
        }]
    },
    verifyQueryResultCount:function(result, expectedSize){
        $A.test.assertTruthy(result);
        $A.test.assertNotNull(result);
        // Make sure the result set has a rowCount property
        $A.test.assertTrue(result.rowCount !== undefined, "$A.getQueryStatement().query() returned a result set with out rowCount.");
        $A.test.assertEquals(expectedSize, result.rowCount, "query() returned unexpected number of rows in result set.");
    },

    verifyIdenticalResultSet:function(set1, set2){
        var diff = set1.diff(set2)
        $A.test.assertEquals(0, diff.added.rowCount, "Results sets are not identical.");
        $A.test.assertEquals(0, diff.removed.rowCount , "Result sets are not identical.");
        $A.test.assertEquals(set1.rowCount , diff.existing.rowCount, "Result sets are not identical.");
    }
})
