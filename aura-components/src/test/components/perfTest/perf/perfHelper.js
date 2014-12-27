({
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
                },
                setCreatedComponent: function (newCmp) {
                    this._createdComponent = newCmp;
                },
                getCreatedComponent: function () {
                    return this._createdComponent;
                },
                later: function (time, callback) {
                    var RAF = this.raf;
                    setTimeout(function () {
                        RAF(callback);
                    }, time);
                },
                profileStart: function(name) {
                    this.mark(name);
                    $A.PERFCORE.stats.start(trimPerfMarkerSuffix(name));
                },
                profileEnd: function(name) {
                    this.mark(name);
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

    parseObjectFromUrl: function () {
        var hash = window.location.hash;

        if (hash.length) {
            return JSON.parse(decodeURIComponent(hash.substring(1)));
        }
        return {};
    },

    isStatsMode: function() {
        return $A.getContext().getMode() == 'STATS';
    },

    perfCreateComponent: function (appCmp, cmp, callback) {
        var self = this;
        // Hook for executing perf stuff before
        this.beforeCreateComponent(appCmp);

        // Start cmp creation (measures start/end inside)
        this.createComponent(cmp.def, cmp.attr, function (newCmp) {
            // Hook for executing after creating perf stuff
            self.afterCreateComponent(appCmp);
            $A.PERFCORE.setCreatedComponent(newCmp);
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
            attributeValues = {};
            $A.log("No attribute values provided for '" + componentDef + "'");
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
    unrenderCmp: function (cmp) {
        $A.unrender(cmp);
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