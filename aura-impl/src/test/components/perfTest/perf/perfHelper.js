({
    /* 
    * =====================================
    * MOCKS 
    * =====================================
    */
    attributeMockValueProvider: {
        'Aura.Component': function(attrDef) {
            var cmp,
                componentDef = "perfTest:registeredComponentsDataProvider";
            // TODO: This returns a mock data provider component,
            // It covers most of list component such ui:list, ui:autocompleteList, ui:infiniteList, ui:autocomplete
            // We may need to provide different mock Component as we expand our test.

            var payload = {
                componentDef : componentDef,
                attributes   : {
                    values : this.getComponentMockValues(componentDef)
                }
            };

            $A.newCmpAsync(this, function(newCmp) {
                // relies on the fact, this component is created synchronously.
                cmp = newCmp;
            }, payload, null, false, true, false);

            return cmp;
        },
        'Aura.ComponentDefRef': function(attrDef) {
            // This mock ComponentDefRef is geared toward for list/autocomplete mock components.
            // see comment in Aura.Component mock provider above
            return {
                componentDef: "ui:menuItem",
                attributes: {
                    values: {
                        label: this.attributeMockValueProvider.String(attrDef)
                    }
                }
            };
        },
        Boolean: function(attrDef) {
            return "true";
        },
        Date: function(attrDef) {
            return "2014-04-01";
        },
        DateTime: function(attrDef) {
            return "2014-04-01 12:00:00";
        },
        Decimal: function(attrDef) {
            return "3.14";
        },
        Double: function(attrDef) {
            return "3.14";
        },
        Integer: function(attrDef) {
            return "100";
        },
        Long: function(attrDef) {
            return "1000";
        },
        Object: function(attrDef) {
            return {
                name: attrDef.getDescriptor().getName()
            };
        },
        String: function(attrDef) {
            return "Mock value for '" + attrDef.getDescriptor().getName() + "' attribute";
        }
    },
    predefinedAttributeMocks: {
        blacklist: {
            'ui:carousel': ['priv_snap'],
            'ui:carouselDeprecated': ['priv_snap'],
            'ui:scroller': ['snap', 'plugins'],
            'ui:scrollerDeprecated': ['snap']
        },

        whitelist: {
            // We wouldn't need this output* whitelist attribute if
            // Components that inherit from ui:output abstract cmp should have overridden
            // value attribute to the right concrete type.
            // Eg. ui:outputLabel, value attr type should be a String instead of Object.
            'ui:outputEmail': {
                value: "outputEmail@mock.value"
            },
            'ui:outputLabel': {
                value: "Mock value for 'outputLabel.value' attribute"
            },
            'ui:outputTextArea': {
                value: "Mock value for 'outputTextArea.value' attribute"
            },
            'ui:outputRichText': {
                value: "Mock value for 'outputRichText.value' attribute"
            },
            'ui:outputSelect': {
                value: "Mock value for 'outputSelect.value' attribute"
            },
            'ui:dataGridSummaryCell': {
                type: "MAX"
            }
        }
    },
    fetchServerSideDependencies: function (cmp, rawCmp, callback) {
        var cmpDef = rawCmp.def,
            resolvedDef, action;

        resolvedDef = $A.componentService.getDef(cmpDef, true);
        if (resolvedDef) {
            return callback(resolvedDef);
        } else {
            action = $A.get("c.aura://ComponentController.getComponentDef");
            action.setParams({
                name: cmpDef
            });

            action.setCallback(this, function (a) {
                 callback(a);
            });

            $A.enqueueAction(action);
        }
    },
    getAttributeMockValue: function(componentDef, attributeDef) {
        var cmpName          = this.getComponentDescriptorFullName(componentDef),
            attrName         = attributeDef.getDescriptor().getName(),
            whitelistedAttrs = this.predefinedAttributeMocks.whitelist[cmpName],
            retValue;

        if (whitelistedAttrs && (retValue = whitelistedAttrs[attrName]) != undefined) {
            return retValue;
        }

        // If attribute value is not predefined in whitelisted components list
        // use the attribute descriptor type to generate a random value.
        var type = attributeDef.getTypeDefDescriptor().substring(7); //trim prefix 'aura://'
            isArrayType = this.isArrayType(type);

        if(isArrayType) { // Eg. String[]
            type = type.substring(0, type.length - 2);
        }
        var valueProvider = this.attributeMockValueProvider[type];

        if(!valueProvider) {
            return $A.error("[perf.app:perfHelper.js]: Value provider for type:'" + type + "' is not defined");
        }

        retValue = valueProvider.call(this, attributeDef);
        return isArrayType ? [retValue] : retValue;
    },
    getComponentDescriptorFullName: function(componentDef) {
        var qualifiedName = componentDef.getDescriptor().getQualifiedName();
        return qualifiedName.substring(9);//trim prefix 'markup://'
    },
    getComponentMockValues: function(cmpName) {
        var componentDef = $A.componentService.getDef(cmpName);

        if(!componentDef) {
            return $A.error("Unknown component descriptor name: " + cmpName);
        }

        var attrValues = {};
        componentDef.getAttributeDefs().each(function(attrDef) {
            if(this.needsAttrMocking(componentDef, attrDef)) {
                attrValues[attrDef.getDescriptor().getName()] = this.getAttributeMockValue(componentDef, attrDef);
            }
        }.bind(this));

        return attrValues;
    },

    parseObjectFromUrl: function () {
        var hash = window.location.hash;

        if (hash.length) {
            return JSON.parse(decodeURIComponent(hash.substring(1)));
        }
        return {};
    },

    isArrayType: function(type) {
        if(type && type.indexOf('[]') === type.length - 2) {
            return true;
        }
        return false;
    },

    isStatsMode: function() {
        return $A.getContext().getMode() == 'STATS';
    },

    isAttributeBlacklisted: function(componentDef, attrDef) {
        var cmpName = this.getComponentDescriptorFullName(componentDef);
        var attrName = attrDef.getDescriptor().getName();
        var blacklistedAttrs = this.predefinedAttributeMocks.blacklist[cmpName];

        return blacklistedAttrs && blacklistedAttrs.indexOf(attrName) != -1;
    },

    needsAttrMocking: function(componentDef, attrDef) {
        if(this.isAttributeBlacklisted(componentDef, attrDef)) {
            return false;
        }
        if(attrDef.getTypeDefDescriptor() == "aura://String"
            && !attrDef.getDefault()) {
                return true;
        }
        if(attrDef.isRequired()) {
            return true;
        }
        return false;
    },
    /* 
    * =====================================
    * PERF CORE
    * =====================================
    */
    _rafPolyfill: function () {
        if (!Date.now) Date.now = function() { return new Date().getTime(); };

        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
            window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
        }

        if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function(callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function() { callback(lastTime = nextTime); },
                                  nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    },
    bootstrapPerfFramework: function (component) {
        var helper = this;

        helper._rafPolyfill();

        component.perf = $A.PERFCORE = (function () {
            var WAIT_TIME = 100,
                timestamp = !!console.timeStamp,
                resultSets = {},
                trimPerfMarkerSuffix = function(name) {
                    var suffixes = [':start', ':end'];
                    for(var i = 0; i < suffixes.length; i++) {
                        if(name.length >= suffixes[i].length && name.substr(name.length - suffixes[i].length) ===  suffixes[i]) {
                            return name.substr(0, name.length - suffixes[i].length);
                        }
                    }
                    return name;
                };
            return {
                raf : function (callback) {
                    return window.requestAnimationFrame(callback);
                },
                time: function () { /* TODO */},
                timeEnd: function () {/* TODO */},
                mark: function (name) {
                    return timestamp && console.timeStamp(name);
                    // TODO: Aura timestamp as well
                },
                later: function (time, callback) {
                    var RAF = this.raf;
                    setTimeout(function () {
                        RAF(callback);
                    }, time);
                },
                profileStart: function(name) {
                    timestamp && console.timeStamp(name);
                    $A.PERFCORE.stats.start(trimPerfMarkerSuffix(name));
                },
                profileEnd: function(name) {
                    timestamp && console.timeStamp(name);
                    $A.PERFCORE.stats.end(trimPerfMarkerSuffix(name));
                },
                setConfig: function (cfg) {
                    var perf = (cfg && cfg.perfConfig) || {};
                        cfg  = {
                            startDelay: perf.startDelay || 100,
                            waitTime  : perf.waitTime   || 300
                        };

                    this.config = cfg;
                    return cfg;
                },
                /**
                 * Api to record and retrieve aura stats.
                 * It only works in aura.mode='STATS', no-op or return empty date otherwise.
                 */
                stats: {
                    /**
                     * Take a snapshot of Aura stats.
                     * @param {!string} name
                     */
                    start: function(name) {
                        if(!helper.isStatsMode()) {
                            return;
                        }
                        $A.assert(name, "Aura stat tracking name can't be empty");
                        $A.assert(!resultSets[name], "Duplicate Aura stat tracking name: " + name);

                        resultSets[name] = {};
                        for(var view in helper.queries) {
                            resultSets[name][view] = helper.queries[view]();
                        }
                    },

                    /**
                     * Take a snapshot of Aura stats diffs since the beginning of the capture with the same name.
                     *
                     * @param {!string} name
                     */
                    end: function(name) {
                        if(!helper.isStatsMode()) {
                            return;
                        }
                        $A.assert(name, "Aura stat tracking name can't be empty");
                        $A.assert(resultSets[name], "Should start stat first");

                        for(var view in helper.queries) {
                            resultSets[name][view] = helper.queries[view]().diff(resultSets[name][view]);
                        }
                    },

                    /**
                     * Get all Aura stats measurements added or removed since the beginning of page load.
                     *
                     * @returns {Object}
                     * {'my snapshot name':
                     *  {"component":{"added":[{"descriptor":"markup://ui:button"}],"removed":[]},
                     *  {"event":{"added":[{"descriptor":"markup://aura:doneRendering","startTime":1399684437957,"endTime":1399684437957}],"removed":[]},
                     *  {"afterRender":{"added":[],"removed":[]},
                     *  {"rerender":{"added":[{"descriptor":"markup://ui:button {0:c}","startTime":1399684437956,"endTime":1399684437957}],"removed":[]},
                     *  {"unrender":{"added":[],"removed":[]},
                     *  {"render":{"added":[],"removed":[]}}
                     * }
                     */
                    get: function() {
                        if(!helper.isStatsMode()) {
                            return {};
                        }

                        var stat,
                            data = {}

                        for(var name in resultSets) {
                            data[name] = {};
                            for(var view in resultSets[name]) {
                                stat = resultSets[name][view];
                                if(stat.added && stat.removed) {
                                    data[name][view] = {
                                        added: stat.added.rows,
                                        removed: stat.removed.rows
                                    };
                                }
                            }
                        }
                        return data;
                    }
                }
            };
        }());
    },
    getCmpDef: function (obj) {
        return {
            def  : obj.componentDef,
            attr : obj.attributes && obj.attributes.values
        };
    },
    /* 
    * =====================================
    * PERF HELPERS
    * =====================================
    */
    perfCreateComponent: function (appCmp, cmp, callback) {
        var self = this;
        // Hook for executing perf stuff before
        this.beforeCreateComponent(appCmp);

        // Start cmp creation (measures start/end inside)
        this.createComponent(cmp.def, cmp.attr, function (newCmp) {
            // Hook for executing after creating perf stuff
            self.afterCreateComponent(appCmp);
            callback(newCmp);
        });
    },
    
    beforeCreateComponent: function (cmp) {
        $A.PERFCORE.stats.start('CreateComponent');
    },
    afterCreateComponent: function (cmp) {
        $A.PERFCORE.stats.end('CreateComponent');
    },

    createComponent: function (componentDef, attributeValues, callback) {
        var payload;

        if (!componentDef || !callback) {
            return;
        }

        if (!attributeValues) {
            //TODO: need a better way to inject more sensible attribute values not just required attributes.
            attributeValues = this.getComponentMockValues(componentDef);
            $A.log("No values provided for '" + componentDef + "', using mock values for required attributes");
        }
        payload = {
            componentDef : componentDef,
            attributes   : {
                values : attributeValues
            }
        };

        // Wait 300ms for stabilization
        $A.PERFCORE.later(300, function () {
            // Contextualize Aura
            $A.run(function () {
                // Create the component
                $A.PERFCORE.mark('START:cmpCreate');
                $A.newCmpAsync(this, function () {
                    // Finish up
                    $A.PERFCORE.mark('END:cmpCreate');
                    callback.apply(this, arguments);
                }, payload);        
            });
        });
    },

    perfRenderComponent: function (appCmp, newCmp, callback) {
        var self = this;
        // Wait some window of time(ms) to stabilize the browser
        $A.PERFCORE.later(50, function (t) {
            // Create the context for Aura
            $A.run(function () {
                var container = appCmp.find('container');

                // Before render (possibly execute some coql for some tests)
                self.beforeRenderComponent(appCmp, newCmp);
                // Render
                self.renderComponent(container, newCmp);

                // After render code to possibly mark some changes
                self.afterRenderComponent(appCmp);

                callback();
            });
        });
    },
    beforeRenderComponent: function (cmp) {
        $A.PERFCORE.stats.start('RenderComponent');
    },
    afterRenderComponent: function (cmp) {
        $A.PERFCORE.stats.end('RenderComponent');
    },

    renderComponent: function (container, newCmp) {
        /* 
        * NOTE: The mark [END:cmpRender] does not mark the JS time 
        * for rendering the component neither the browser time to paint
        * This is just so we can isolate times for perf postprocessing
        */
        $A.PERFCORE.mark('START:cmpRender'); 
        $A.render(newCmp, container && container.getElement());
        $A.afterRender(newCmp);
        $A.PERFCORE.mark('END:cmpRender');
    },

    perfAfterRender: function (appCmp, newCmp, callback) {
        var self = this;
         // Use RAF to wait till the browser updates and paints
        $A.PERFCORE.later(500, function (t) {                    
            $A.PERFCORE.mark('PERF:end'); //mark so we can
            // After render code to possibly mark some changes
            self.afterRender(appCmp, newCmp);
            // Mark the DOM to tell webdriver we are done
            callback();
        });
    },
    afterRender: function (appCmp, newCmp) {/* TODO */},

    /*
    * =====================================
    * Aura stats mode COQL queries
    * =====================================
    */
    /**
     * COQL queries to get various aura stats.
     * Use $A.PERFCORE.stat to record perf profiling and reading recorded stats.
     */
    queries: {
        component: function() {
            // [{descriptor: "markup://aura:expression"}]
            return $A.getQueryStatement()
                .field("descriptor", function(resultSet){return resultSet.getDef().getDescriptor().toString();})
                .from('component')
                .query();
        },

        event: function() {
            // [{startTime: 1399596806222, endTime: 1399596806228, descriptor: "markup://ui:press"}]
            return $A.getQueryStatement()
                .field("descriptor", function(resultSet){return resultSet.event.getDef().getDescriptor().toString();})
                .fields("startTime,endTime")
                .from('event')
                .query();
        },

        afterRender: function() {
            // [{"startTime":1399675188180,"endTime":1399675188181,"descriptor":"markup://aura:text {0:c}"}]
            return $A.getQueryStatement()
                .field("descriptor",function(resultSet){return resultSet.component.toString();})
                .fields("startTime,endTime,type")
                .from("renderings")
                .where("type=='afterRender'")
                .query();
        },

        render: function() {
            // [{"startTime":1399675188180,"endTime":1399675188181,"descriptor":"markup://aura:text {0:c}"}]
            return $A.getQueryStatement()
                .field("descriptor",function(resultSet){return resultSet.component.toString();})
                .fields("startTime,endTime,type")
                .from("renderings")
                .where("type=='render'")
                .query();
        },

        rerender: function() {
            // [{"startTime":1399675188180,"endTime":1399675188181,"descriptor":"markup://aura:text {0:c}"}]
            return $A.getQueryStatement()
                .field("descriptor",function(resultSet){return resultSet.component.toString();})
                .fields("startTime,endTime,type")
                .from("renderings")
                .where("type=='rerender'")
                .query();
        },

        unrender: function() {
            // [{"startTime":1399675188180,"endTime":1399675188181,"descriptor":"markup://aura:text {0:c}"}]
            return $A.getQueryStatement()
                .field("descriptor",function(resultSet){return resultSet.component.toString();})
                .fields("startTime,endTime,type")
                .from("renderings")
                .where("type=='unrender'")
                .query();
        }
    }
    
})