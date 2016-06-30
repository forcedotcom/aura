({
    // Only run on Firefox for now until we are able to upgrade Chrome to a compatible version in autobuilds
    browsers: ["FIREFOX"],

    testBootstrapScriptsOrdering_default: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
                var scriptOrder = ["appJs", "bootstrap", "inline", "framework", "libraries"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    testBootstrapScriptsOrdering_librariesFirst: {
        test: [
            function(cmp) {
                this.loadIframe(cmp);
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded; });
            },
            function(cmp) {
                var scriptOrder = ["libraries", "appJs", "bootstrap", "inline", "framework"];
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
                var scriptOrder = ["framework", "appJs", "bootstrap", "inline", "libraries"];
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
            	var scriptOrder = ["appJs", "inline", "framework", "libraries", "bootstrap"];
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
                var scriptOrder = ["bootstrap", "inline", "framework", "libraries", "appJs"];
                var frame = document.getElementById("myFrame");
                var scripts = this.getScripts(cmp);
                this.addScriptsToIframe(frame, scripts, scriptOrder);

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return frame.contentWindow.$A && frame.contentWindow.$A.finishedInit;
                }, "iframe failed to fully boot Aura");
            }
        ]
    },

    addScriptsToIframe: function(frame, scripts, scriptOrder) {
        for (var i = 0; i < scriptOrder.length; i++) {
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
            // Ignore the TestFilter script, not part of bootstrap
            if (script.src.indexOf("aura.jstestrun") > -1) {
                continue;
            } else if (script.src.indexOf("bootstrap.js") > -1) {
                scriptMap["bootstrap"] = script;
            } else if (script.src.indexOf("inline.js") > -1) {
                scriptMap["inline"] = script;
            } else if (script.src.indexOf("app.js") > -1) {
                scriptMap["appJs"] = script;
            } else if (script.src.indexOf("aura_") > -1) {
                scriptMap["framework"] = script;
            } else if (script.src.indexOf("libs_") > -1) {
                scriptMap["libraries"] = script;
            } else {
                throw new Error("Unexpected script found on page, has a new script been added to the bootstrap sequence?");
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