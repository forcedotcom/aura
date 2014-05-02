({
    attributeMockValueProvider: {
        'Aura.Component': function(attrDef) {
            var cmp;
            // TODO: This returns a mock data provider component,
            // It covers most of list component such ui:list, ui:autocompleteList, ui:infiniteList, ui:autocomplete
            // We may need to provide different mock Component as we expand our test.
            this.createComponent("perfTest:registeredComponentsDataProvider", null, function(newCmp) {
                // relies on the fact, this component is created synchronously.
                cmp = newCmp;
            });
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
        this._rafPolyfill();
        component.perf = $A.PERFCORE = (function () {
            var WAIT_TIME = 100,
                timestamp = !!console.timeStamp;
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
                }
            };
        }());
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

    getAttributeMockValue: function(attributeDef) {
        var type = attributeDef.getTypeDefDescriptor().substring(7); //trim prefix 'aura://'
        var isArrayType = this.isArrayType(type);

        if(isArrayType) { // Eg. String[]
            type = type.substring(0, type.length - 2);
        }
        var valueProvider = this.attributeMockValueProvider[type];

        if(!valueProvider) {
            return $A.error("Value provider for type:'" + type + "' is not defined");
        }

        var value = valueProvider.call(this, attributeDef);
        return isArrayType ? [value] : value;
    },

    getComponentMockValues: function(cmpName) {
        var componentDef = $A.componentService.getDef(cmpName);

        if(!componentDef) {
            return $A.error("Unknown component descriptor name: " + cmpName);
        }

        var attrValues = {};
        componentDef.getAttributeDefs().each(function(attrDef) {
            if(attrDef.isRequired()) {
                attrValues[attrDef.getDescriptor().getName()] = this.getAttributeMockValue(attrDef);
            }
        }.bind(this));

        return attrValues;
    },

    getDescriptorFromUrl: function () {
        var hash = window.location.hash;

        if (hash.length) {
            return JSON.parse(decodeURIComponent(hash.substring(1)));
        }
        return null;
    },

    isArrayType: function(type) {
        if(type && type.indexOf('[]') === type.length - 2) {
            return true;
        }
        return false;
    },

    renderComponent: function (parentCmp, childCmp) {
        var body = parentCmp.getValue('v.body');
        body.destroy();
        body.setValue(childCmp);
    }
})