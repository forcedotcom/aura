function PerfRunner(COQL, Memory) {
    var TIMESTAMP = (console && console.timeStamp) ? console.timeStamp.bind(console) : function () {};

    return (function () {
        var CONFIG = {},
            classFinishTest = 'testFinish',
            componentReady  = false,
            setupComplete   = false,
            runInProgress   = false,
            callbackComponentLoaded,
            callbackSetupComplete;
        
        return {
            COQL    : COQL,
            Memory  : Memory,
            results : { commonMetrics: {}, customMetrics: {} },

            setCommonMetric: function (key, value) {
                this.results.commonMetrics[key] = value;
            },
            setCustomMetrics: function (key, value) {
                this.results.customMetrics[key] = value;
            },
            setContainer: function (container) {
                var valid = container instanceof HTMLElement || $A.util.isComponent(container);
                $A.assert(valid, 'Container needs to be an Aura Component or an HTML Element');
                if ($A.util.isComponent(container)) {
                    this.containerComponent = container;
                } else {
                    this.containerDOM = container;    
                }

                return this;
            },
            getContainerDOM: function () {
                return this.containerDOM || this.containerComponent && this.containerComponent.getElement();
            },
            setConfig: function (config) {
                $A.assert(config.componentConfig, 'Setup: componentConfig is required');
                this.componentConfig = config.componentConfig;
                this.options = config.options || {};
                return this;
            },
            clearRun: function () {
                componentReady = false;
                setupComplete  = false;
                runInProgress  = false;
                var dom = this.getContainerDOM();
                if (dom) {
                    $A.util.removeClass(dom, classFinishTest);
                }
                this.results = { commonMetrics: {}, customMetrics : {} };
                return this;
            },
            loadComponent: function () {
                var self        = this,
                    cmpDef      = this.componentConfig.componentDef,
                    resolvedDef = $A.componentService.getDef(cmpDef, true);

                $A.assert(cmpDef, 'No def has been found, call setup first');
                if (resolvedDef) {
                    return setTimeout(function(){
                        componentReady = true;
                        self._onComponentReady();
                    }, 0);
                } else {
                    var action = $A.get("c.aura://ComponentController.getComponentDef");
                    action.setParams({
                        name: cmpDef
                    });

                    action.setCallback(this, function (action) {
                        $A.assert(action.getState() === 'SUCCESS', 'Def not found...');
                        componentReady = true;
                        self._onComponentReady();
                    });

                    $A.enqueueAction(action);
                }
                return this;
            },
            _onComponentReady: function () {
                if (callbackComponentLoaded) {
                    callbackComponentLoaded.call(this);
                }
            },
            onComponentLoaded: function (callback) {
                if (componentReady) {
                    callback.call(this);
                } else {
                    callbackComponentLoaded = callback;
                }
            },
            setup: function () {
                $A.assert(componentReady, 'You need to load the component first');
                var asyncSetup = false,
                    cmpConfig  = this.componentConfig,
                    cmpDef     = $A.componentService.getDef(cmpConfig.componentDef),
                    perfIntf   = cmpDef.isInstanceOf('performance:test'),
                    setupDone  = (function () {
                        setupComplete = true; 
                        this._onSetupComplete();
                    }).bind(this);

                
                if (perfIntf) {
                    // Create and render the wrapper
                    $A.newCmpAsync(this, function (component) {
                        this.component = component;
                        $A.render(component, this.getContainerDOM()); 

                        if (component.setup) {
                            component.setup({
                                async: function () {
                                    asyncSetup = true;
                                    return function done() {
                                        setupDone();
                                    };
                                }
                            });
                        }

                        if (!asyncSetup) {
                            setupDone();
                        }
                    }, cmpConfig, this.containerComponent);
                } else {
                    setupDone();
                }

                return this;
            },
            _onSetupComplete: function () {
                if (callbackSetupComplete) {
                    callbackSetupComplete.call(this);
                }
            },
            onSetupComplete: function (callback) {
                if (setupComplete) {
                    callback.call(this);
                } else {
                    callbackSetupComplete = callback;
                }
            },
            startMetricsCollection: function () {
                this.setCommonMetric('initialComponentCount', $A.componentService.countComponents());
                $A.metricsService.transactionStart('PERFRUNNER', 'run');
                COQL.snapshot('start');
                TIMESTAMP('perfRunner:start');
            },
            stopMetricsCollection: function () {
                TIMESTAMP('perfRunner:end');
                var transaction;
                COQL.snapshot('end');
                $A.metricsService.transactionEnd('PERFRUNNER', 'run', function (t) {
                    transaction = t;
                }); // sync

                this.setCommonMetric('finalComponentCount', $A.componentService.countComponents());
                if (COQL.enabled) {
                    this.results.coql = COQL.getResults('end', 'start');
                }

                this.results.transaction = transaction;
            },
            _runComponentTest: function (cmpConfig, done) {
                this.component = $A.newCmp(cmpConfig, this.containerComponent);
                $A.render(this.component, this.getContainerDOM());
                done.immediate();
            },
            run: function (sandboxRun) {
                var asyncRun     = false,
                    immediateRun = false,
                    wrapperTest  = this.component,
                    finishRun    = (function () {this._finish();}).bind(this),
                    doneObject   = {
                        async: function () {
                            asyncRun = true;
                            return function done() {
                                finishRun();
                            };
                        },
                        immediate: function () {
                            immediateRun = true;
                        }
                    }, runner;

                // The runner is the wrapper.run or the provided sandbox call or the fallback is a simple component
                runner = (wrapperTest && wrapperTest.run) || sandboxRun || this._runComponentTest.bind(this, this.componentConfig)

                // Set Internal state for running
                runInProgress = true; 

                this.startMetricsCollection();
                runner(doneObject);

                // After this check if the run is async or manual (inmediate)
                if (immediateRun && !asyncRun) {
                    finishRun();
                }
            },
            _finish: function () {
                runInProgress = false;
                this.stopMetricsCollection();
                this.postProcessing();

                var dom = this.getContainerDOM();
                if (dom) {
                    $A.util.addClass(dom, classFinishTest);
                }
            },
            postProcessing: function () {
                var wrapperTest = this.component;
                if (wrapperTest && wrapperTest.postProcessing) {
                    wrapperTest.postProcessing(this.results);
                }
            },
            finish: function () {
                $A.assert(runInProgress, 'No run in progress');
                this._finish();
            },
            getResults: function () {
                $A.assert(!runInProgress, 'A run hasn\'t finish yet');
                return this.results;
            }
        };
    }());
}