({
    // Only run on Firefox for now until we are able to upgrade Chrome to a compatible version in autobuilds
    browsers: ["FIREFOX"],
    
    BOOTSTRAP_KEY: "$AuraClientService.bootstrap$",

    testBootstrapScriptsOrdering_default: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
                var scriptOrder = ["appJs", "bootstrap", "inline", "framework"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    testBootstrapScriptsOrdering_frameworkBeforeInline: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
                var scriptOrder = ["framework", "appJs", "bootstrap", "inline"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    testBootstrapScriptsOrdering_bootstrapLast: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
            	var scriptOrder = ["appJs", "inline", "framework", "bootstrap"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    testBootstrapScriptsOrdering_appJsLast: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
                var scriptOrder = ["bootstrap", "inline", "framework", "appJs"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    _testBootstrapMd5DiffFiresApplicationRefresh: {
        test: [
            function loadIframe(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function changeStoredBootstrapMd5(cmp) {
                // update md5 in storage to guarantee value is different from value returned from server.
                var that = this;
                var completed = false;
                var storage = $A.storageService.getStorage("actions");
                storage.get(this.BOOTSTRAP_KEY)
                    .then(function(item) {
                        item.md5 = "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ";
                        return storage.set(that.BOOTSTRAP_KEY, item);
                    })
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(e) { $A.test.fail("Error modifying bootstrap entry in storage: " + e)});
                $A.test.addWaitFor(true, function(){ return completed });
            },
            function loadScriptsSansBootstrap(cmp) {
                // bootstrap.js will be cached in persistent storage from initial load so we are able to load the app
                // without the bootstrap script. 
                var scriptOrder = ["inline", "framework", "appJs"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to load Aura when bootstrap.js is from cache");
            },
            function loadBootstrapScript(cmp) {
                // now load bootstrap script which will go to the server and return with the original md5. When the
                // client processes bootstrap.js it will detect the new md5 and fire the applicationRefreshed event.
                var scriptOrder = ["bootstrap"];
                var frame = document.getElementById("myFrame");
                frame.contentWindow.$A.getRoot()._applicationRefreshedCalled = false;
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    // _applicationRefreshedCalled flag is set in components aura:applicationRefreshed event handler
                    return frame.contentWindow.$A.getRoot()._applicationRefreshedCalled;
                }, "applicationRefreshed event not fired after bootstrap.js fetched from server");
            }
        ]
    },

    addScriptsToIframe: function(frame, scripts, scriptOrder) {
        for (var i = 0; i < scriptOrder.length; i++) {
            if (!scripts[scriptOrder[i]]) {
                throw new Error("Did not find script for: " + scriptOrder[i]);
            }
            var scriptToAdd = document.createElement("script");
            scriptToAdd.async = false;
            scriptToAdd.src = scripts[scriptOrder[i]].src;
            frame.contentWindow.document.body.appendChild(scriptToAdd);
        }
    },

    getScripts: function(cmp) {
        var scriptMap = {};
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length-1; i >= 0; i--) {
            var script = scripts[i];
            var src = script.src;
            if (!src && script.dataset.src) {
                // Ignore lazy scripts
                continue;
            } else if (src.indexOf("aura.jstestrun") > -1) {
                // Ignore the TestFilter script, not part of bootstrap
                continue;
            } else if (src.indexOf("bootstrap.js") > -1) {
                scriptMap["bootstrap"] = script;
            } else if (src.indexOf("inline.js") > -1) {
                scriptMap["inline"] = script;
            } else if (src.indexOf("app.js") > -1) {
                scriptMap["appJs"] = script;
            } else if (src.indexOf("aura_") > -1) {
                scriptMap["framework"] = script;
            } else {
                throw new Error("Unexpected script found on page, has a new script been added to the bootstrap sequence? => " + script.outerHTML);
            }
        }
        return scriptMap;
    },

    loadIframe: function(cmp) {
        cmp._frameLoaded = false;
        var frame = document.createElement("iframe");
        frame.scrolling = "auto";
        frame.id = "myFrame";
        frame.width = "100%";
        frame.height = "600";
        $A.util.on(frame, "load", function () {
        	cmp._frameLoaded = true;
        });
        frame.src = '';
        var content = cmp.find("iframeContainer");
        $A.util.insertFirst(frame, content.getElement());
    }
})