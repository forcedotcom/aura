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

/**
 * Construct a new SimpleComponent.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            config - component configuration
 * @param {Boolean}
 *            [localCreation] - local creation
 * @export
 */
function SimpleComponent(config, localCreation) {
    var context = $A.getContext();

    // setup some basic things
    this.concreteComponentId = config["concreteComponentId"];
    this.containerComponentId = config["containerComponentId"];
    this.shouldAutoDestroy=true;
    this.rendered = false;
    this.inUnrender = false;
    this.localId = config["localId"];
    this.valueProviders = {};
    this.eventValueProvider = undefined;
    this.docLevelHandlers = undefined;
    this.references={};
    this.handlers = {};
    this.localIndex = {};
    this.destroyed=false;
    this.version = config["version"];
    this.owner = context.getCurrentAccess();
    this.name='';

    // allows components to skip creation path checks if it's doing something weird
    // such as wrapping server created components in client created one

    var act = config["skipCreationPath"] ? null : context.getCurrentAction();
    var forcedPath = false;

    if (act) {
        var currentPath = act.topPath();
        if (config["creationPath"]) {
            //
            // This is a server side config, so we need to sync ourselves with it.
            // The use case here is that the caller has gotten a returned array of
            // components, and is instantiating them independently. We can warn the
            // user when they do the wrong thing, but we'd actually like it to work
            // for most cases.
            //
            this.creationPath = act.forceCreationPath(config["creationPath"]);
            forcedPath = true;
        } else if (!context.containsComponentConfig(currentPath) && !!localCreation) {
            // skip creation path if the current top path is not in server returned
            // componentConfigs and localCreation

            this.creationPath = "client created";
        } else {
            this.creationPath = act.getCurrentPath();
        }
        //$A.log("l: [" + this.creationPath + "]");
    }

    // create the globally unique id for this component
    this.setupGlobalId(config["globalId"], localCreation);


    var partialConfig;
    if (this.creationPath && this.creationPath !== "client created") {
        partialConfig = context.getComponentConfig(this.creationPath);

        // Done with it in the context, it's now safe to remove so we don't process it again later.
        context.removeComponentConfig(this.creationPath);
    }

    if (partialConfig) {
        this.validatePartialConfig(config,partialConfig);
        this.partialConfig = partialConfig;
    }

    // get server rendering if there was one
    if (config["rendering"]) {
        this.rendering = config["rendering"];
    } else if (partialConfig && partialConfig["rendering"]) {
        this.rendering = this.partialConfig["rendering"];
    }

    // add this component to the global index
    $A.componentService.index(this);

    // sets this components definition, preferring partialconfig if it exists
    this.setupComponentDef(this.partialConfig || config);

    // Saves a flag to indicate whether the component implements the root marker interface.
    this.isRootComponent = true;

    // join attributes from partial config and config, preferring partial when overlapping
    var configAttributes = { "values": {} };

    if (config["attributes"]) {
        //$A.util.apply(configAttributes["values"], config["attributes"]["values"], true);
        for(var key in config["attributes"]["values"]) {
            configAttributes["values"][key] = config["attributes"]["values"][key];
        }
        configAttributes["valueProvider"] = config["attributes"]["valueProvider"] || config["valueProvider"];
    }

    if (partialConfig && partialConfig["attributes"]) {
        $A.util.apply(configAttributes["values"], partialConfig["attributes"]["values"], true);
        // NOTE: IT USED TO BE SOME LOGIC HERE TO OVERRIDE THE VALUE PROVIDER BECAUSE OF PARTIAL CONFIGS
        // IF WE RUN INTO ISSUES AT SOME POINT AFTER HALO, LOOK HERE FIRST!
    }

    if (!configAttributes["facetValueProvider"]) {
        configAttributes["facetValueProvider"] = this;
    }

    //JBUCH: HALO: FIXME: THIS IS A DIRTY FILTHY HACK AND I HAVE BROUGHT SHAME ON MY FAMILY
    this.attributeValueProvider = configAttributes["valueProvider"];
    this.facetValueProvider = configAttributes["facetValueProvider"];

    // initialize attributes
    this.setupAttributes(this, configAttributes);

    // create all value providers for this component m/v/c etc.
    this.setupValueProviders(config["valueProviders"]);

    // runs component provider and replaces this component with the provided one
    this.injectComponent(config, localCreation);

    // sets up component level events
    // Used in iteration
    this.setupComponentEvents(this, configAttributes);

    // index this component with its value provider (if it has a localid)
    this.doIndex(this);

    // starting watching all values for events
    // Used in iteration
    this.setupValueEventHandlers(this);

    // setup flavors
    this.setupFlavors(config, configAttributes);

    // clean up refs to partial config
    this.partialConfig = undefined;

    if (forcedPath && act && this.creationPath) {
        act.releaseCreationPath(this.creationPath);
    }

    this._destroying = false;

    // Will need to bring back something like this for if and iteration.
    if(this.getDef().hasInit()) {
        this.fire("init");
    }
}

SimpleComponent.prototype = Object.create(Component.prototype);

// Not returning anything in these since empty functions will not be called by the JS engine as an
SimpleComponent.prototype.superRender = function(){};
SimpleComponent.prototype.superAfterRender = function(){};
SimpleComponent.prototype.superRerender = function(){};
SimpleComponent.prototype.superUnrender = function(){};
SimpleComponent.prototype.getSuper = function(){};
SimpleComponent.prototype.getSuperest = function(){ return this; };

SimpleComponent.prototype.setupGlobalId = function(globalId, localCreation) {
    this.globalId = globalId || this.nextGlobalId(localCreation);
};

SimpleComponent.prototype.setupValueProviders = function(customValueProviders) {
    var vp=this.valueProviders;

    vp["v"]=this.attributeSet;
    vp["c"]=this.createActionValueProvider();
    vp["e"]=this.createEventValueProvider();
    vp["this"]=this;
    vp["globalid"]=this.globalId;
    vp["def"]=this.componentDef;
    vp["null"]=null;
    vp["version"] = this.version ? this.version : this.getVersionInternal();

    if(customValueProviders) {
        for (var key in customValueProviders) {
            this.addValueProvider(key,customValueProviders[key]);
        }
    }
};


Aura.Component.SimpleComponent = SimpleComponent;
