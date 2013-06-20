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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.ComponentDefRegistryTest = function() {
	Mocks.GetMock(Object.Global(), "window", {})(function() {
		// #import aura.component.ComponentDefRegistry
	});

	[Fixture]
    function AuraType() {
	[Fact]
	function HasCorrectAuraType() {
	    // Arrange
	    var expected = "ComponentDefRegistry";
	    
	    // Act
	    var target = new ComponentDefRegistry();
	    var actual = target.auraType;

	    // Assert
	    Assert.Equal(expected, actual);
	}

	[Fact]
	function HasCorrectCacheName() {
	    // Arrange
	    var expected = "componetDefRegistry.catalog";
	    
	    // Act
	    var target = new ComponentDefRegistry();
	    var actual = target.cacheName;

	    // Assert
	    Assert.Equal(expected, actual);
	}
    }

    [Fixture]
    function isLocalStorageAvailable() {
	function MockLocalStorageSetRemove(during) {
	    return Mocks.GetMock(Object.Global(), "window", {
		localStorage : {
		    setItem : function() {
		    },
		    removeItem : function() {
		    }
		}
	    })(function() {
		// Since the actual file was already imported once, only specify
		// the dependency
		Import("aura.component.ComponentDefRegistry")
		during();
	    });
	}
	[Fact]
	function ShouldReturnTrueIfLocalStorageSupported() {
	    // Arrange
	    var target;
	    
	    // Act
	    MockLocalStorageSetRemove(function() {
		target = new ComponentDefRegistry();
	    });
	    var actual = target.isLocalStorageAvailable;

	    // Assert
	    Assert.True(actual);
	}

	function MockErrorOnTestWrite(during) {
	    return Mocks.GetMock(Object.Global(), "window", {
		localStorage : {
		    setItem : function() {
			throw new Error()
		    },
		    removeItem : function() {
		    }
		}
	    })(function() {
		// Since the actual file was already imported once, only specify
		// the dependency
		[ Import("aura.component.ComponentDefRegistry") ]
		during();
	    });
	}
	[Fact]
	function ShouldReturnFalseIfTestWriteToCacheFails() {
	    // Arrange
	    var actual;

	    // Act
	    MockErrorOnTestWrite(function() {
		var target = new ComponentDefRegistry();
		actual = target.isLocalStorageAvailable;
	    });

	    // Assert
	    Assert.False(actual);
	}

	[Fact]
	function ShouldReturnFalseIfLocalStorageIsNotSupportedByWindow() {
	    // Arrange
	    var actual;

	    // Act
	    var target = new ComponentDefRegistry();
	    actual = target.isLocalStorageAvailable;

	    // Assert
	    Assert.False(actual);
	}
    }

    [Fixture]
    function GetDef() {
	var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
	    util : {
		isString : function() {
		    return true;
		},
		isUndefinedOrNull : function(obj) {
		    return obj === undefined || obj === null;
		}
	    },
	    assert : function(condition, message){
		    if(!condition){
			var error = new Error(message);
			throw error;
		    }
	    },
	    mark : function() {
	    },
	    endMark : function() {
	    }
	});
	[Fact]
	function ThrowsIfConfigParamUndefined() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    var expected = "ComponentDef Config required for registration";
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = Record.Exception(function() {
		    target.getDef(undefined);
		})
	    });

	    // Assert
	    Assert.Equal(expected, actual);

	}

	[Fact]
	function ReturnsDefIfFound() {
	    // Arrange
	    var expected = "ComponentDef";
	    var target = new ComponentDefRegistry();
	    var descriptor = "markup://foo:bar";
	    target.componentDefs[descriptor] = expected;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.getDef(descriptor);
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

	[Fact]
	function SupportsShortHandFormatOfDescriptor() {
	    // Arrange
	    var expected = "ComponentDef";
	    var target = new ComponentDefRegistry();
	    var descriptor = "markup://foo:bar";
	    target.componentDefs[descriptor] = expected;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.getDef("foo:bar");
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

	[Fact]
	function SupportsDescriptorInMapFormat() {
	    // Arrange
	    var expected = "ComponentDef";
	    var target = new ComponentDefRegistry();
	    var descriptor = "markup://foo:bar";
	    target.componentDefs[descriptor] = expected;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.getDef({
		    "descriptor" : "foo:bar"
		});
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

	var mockComponentDef = Mocks.GetMock(Object.Global(), "ComponentDef",
		function(config) {
		    var def = {};
		    def["config"] = config;
		    var toString = function() {
			return config["descriptor"]
		    };
		    def["getDescriptor"] = function() {
			return {
			    "toString" : toString
			};
		    }
		    return def;
		});
	[Fact]
	function RegistersConfigAsNewDefIfDoesntExist() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var newConfig = {
		"descriptor" : "markup://foo:bar",
		"rendererDef" : {}
	    };
	    var registeredDef;
	    var actualDef;

	    // Act
	    // Should register the given config
	    mockAuraUtil(function() {
		mockComponentDef(function() {
		    registeredDef = target.getDef(newConfig);
		})
	    });
	    var registeredConfig = registeredDef["config"];
	    
	    // Assert
	    Assert.Equal(newConfig, registeredConfig);
	}
	
	[Fact]
	function GetDefFromCacheIfExist() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var newConfig = {
		"descriptor" : "markup://foo:bar",
		"rendererDef" : {}
	    };
	    var registeredDef;
	    var actualDef;

	    // Act
	    // Should register the given config
	    mockAuraUtil(function() {
		mockComponentDef(function() {
		    registeredDef = target.getDef(newConfig);
		})
	    });
	    // Re-fetch def
	    mockAuraUtil(function() {
		actualDef = target.getDef("markup://foo:bar");
	    });

	    // Assert
	    Assert.Equal(registeredDef, actualDef);
	}
	
	[Fact]
	function WritesConfigToLocalStorageIfNotCached() {
	    //Arrange
	    var target = new ComponentDefRegistry();
	    var descriptor = "layout://foo:bar";
	    target.isLocalStorageAvailable = true;
	    target.useLocalCache = function() {
		return true;
	    };
	    target.getConfigFromLocalCache = function() {
		return null;
	    };
	    var actual;
	    target.writeToCache = function(desc, config) {
		actual = {"descriptor" : desc, "config":config};
	    }
	    var newConfig = {
		"descriptor" : descriptor,
		"rendererDef" : {}
	    };
	    var expected = {
		"descriptor" : descriptor,
		"config" : newConfig
	    }
	    // Act
	    mockAuraUtil(function() {
		mockComponentDef(function() {
		    target.getDef(newConfig);
		})
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

	[Fact]
	function FetchConfigFromLocalStorageIfCached() {
	    //Arrange
	    var cachedConfig = {
			"descriptor" : "layout://foo:bar",
			"rendererDef" : {"Xylo":"Olyx"},
			"controllerDef" : {"Manf":"M**indra"}
		    };
	    var target = new ComponentDefRegistry();
	    var actual;
	    target.isLocalStorageAvailable = true;
	    target.useLocalCache = function() {
		return true;
	    };
	    target.getConfigFromLocalCache = function() {
		return cachedConfig;
	    };
	    target.writeToCache = function(descriptor, config) {
		actual = undefined;
	    }
	    var newConfig = {
		"descriptor" : "layout://foo:bar",
		"rendererDef" : {}
	    };

	    // Act
	    mockAuraUtil(function() {
		mockComponentDef(function() {
		    actualDef = target.getDef(newConfig);
		})
	    });

	    // Assert
	    Assert.Equal(cachedConfig, actualDef["config"]);
	}
    }

    [Fixture]
    function UseLocalCache() {
	var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
	    util : {
		isUndefinedOrNull : function(obj) {
		    return obj === undefined || obj === null;
		}
	    }
	});
	[Fact]
	function ShouldReturnFalseIfLocalStorageNotSupported() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var actual;

	    // Act
	    actual = target.useLocalCache("layout://foo:bar");

	    // Assert
	    Assert.False(actual);
	}

	[Fact]
	function ShouldReturnTrueIfLocalStorageAvailableAndLayoutDescriptor() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.useLocalCache("layout://foo:bar");
	    });

	    // Assert
	    Assert.True(actual);
	}

	[Fact]
	function ShouldReturnFalseIfLocalStorageAvailableAndNonLayoutDescriptor() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.useLocalCache("markup://foo:bar");
	    });

	    // Assert
	    Assert.False(actual);
	}

	[Fact]
	function ShouldReturnFalseOnEmptyArgument() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		actual = target.useLocalCache();
	    });

	    // Assert
	    Assert.False(actual);
	}
    }

    [Fixture]
    function GetLocalCacheCatalog() {
	[Fact]
	function ReturnsNullIfLocalStorageNotSupported() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var actual;

	    // Act
	    actual = target.getLocalCacheCatalog();

	    // Assert
	    Assert.Null(actual);
	}

	[Fact]
	function ReturnsNewEmptyObjectIfLocalStorageEmpty() {
	    // Arrange
	    var mockLocalStorage = Mocks.GetMock(Object.Global(),
		    "localStorage", {
			getItem : function() {
			    return null;
			}
		    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true
	    var actual;
	    
	    // Act
	    mockLocalStorage(function() {
		actual = target.getLocalCacheCatalog();
	    });

	    // Assert
	    Assert.Empty(actual);
	}

	[Fact]
	function ReturnsJsonDecodedCatalogIfLocalStoragePrimed() {
	    // Arrange
	    var expected = "Stored Catalog";
	    var mockLocalStorage = Mocks
		    .GetMock(
			    Object.Global(),
			    "localStorage",
			    {
				getItem : function(obj) {
				    // Return a good answer only if cache name
				    // is correct
				    return (!!obj && obj === "componetDefRegistry.catalog") ? expected
					    : null;
				}
			    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		util : {
		    json : {
			decode : function(s) {
			    return s;
			}
		    }
		}
	    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		mockLocalStorage(function() {
		    actual = target.getLocalCacheCatalog();
		});
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

    }

    [Fixture]
    function GetConfigFromLocalCache() {
	[Fact]
	function ReturnsNullIfLocalStorageNotSupported() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var actual;

	    // Act
	    actual = target.getConfigFromLocalCache();

	    // Assert
	    Assert.Null(actual);
	}

	[Fact]
	function ReturnsNullIfDefNotInLocalStorageEmpty() {
	    // Arrange
	    var mockLocalStorage = Mocks.GetMock(Object.Global(),
		    "localStorage", {
			getItem : function() {
			    return null;
			}
		    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true
	    var actual;

	    // Act
	    mockLocalStorage(function() {
		actual = target.getConfigFromLocalCache();
	    });

	    // Assert
	    Assert.Null(actual);
	}

	[Fact]
	function ReturnsJsonDecodedDefIfLocalStoragePrimed() {
	    // Arrange
	    var expected = "Stored def";
	    var descriptor = "layout://foo:bar";
	    var mockLocalStorage = Mocks
		    .GetMock(
			    Object.Global(),
			    "localStorage",
			    {
				getItem : function(obj) {
				    // Return a good answer only if descriptor
				    // is correct
				    return (!!obj && obj === ("componetDefRegistry.catalog"
					    + "." + descriptor)) ? expected
					    : null;
				}
			    });
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		util : {
		    json : {
			decode : function(s) {
			    return s;
			}
		    }
		}
	    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		mockLocalStorage(function() {
		    actual = target.getConfigFromLocalCache(descriptor);
		});
	    });

	    // Assert
	    Assert.Equal(expected, actual);
	}

    }

    [Fixture]
    function WriteToCache() {
	[Fact]
	function NoOpIfLocalStorageIsNotSupported() {
	    // Arrange
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = false;
	    var actual;

	    // Act
	    var actual = Record.Exception(function(){
		target.writeToCache("layout://", {});
	    }); 

	    // Assert
	    Assert.Null(actual);
	}

	[Fact]
	function UpdatesLocalStorageWithJsonEncodedDefIfAvailable() {
	    // Arrange
	    var storage = {};
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		util : {
		    json : {
			encode : function(s) {
			    return s;
			}
		    }
		},
		endMark : function() {
		}
	    });
	    var mockLocalStorage = Mocks.GetMock(Object.Global(),
		    "localStorage", {
			setItem : function(key, value) {
			    storage[key] = value;
			}
		    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    target.cacheName = "componetDefRegistry.catalog"
	    target.getLocalCacheCatalog = function() {
		return {};
	    }
	    var descriptor = "layout://foo:bar";
	    var config = {
		"descriptor" : descriptor,
		"model" : {}
	    };
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		mockLocalStorage(function() {
		    target.writeToCache(descriptor, config);
		});
	    });

	    // Assert
	    Assert.Equal(config, storage[target.cacheName + "." + descriptor]);
	}
	
	[Fact]
	function UpdatesLocalStorageWithCatalogIfAvailable() {
	    // Arrange
	    var storage = {};
	    var mockAuraUtil = Mocks.GetMock(Object.Global(), "$A", {
		util : {
		    json : {
			encode : function(s) {
			    return s;
			}
		    }
		},
		endMark : function() {
		}
	    });
	    var mockLocalStorage = Mocks.GetMock(Object.Global(),
		    "localStorage", {
			setItem : function(key, value) {
			    storage[key] = value;
			}
		    });
	    var target = new ComponentDefRegistry();
	    target.isLocalStorageAvailable = true;
	    target.cacheName = "componetDefRegistry.catalog"
	    target.getLocalCacheCatalog = function() {
		return {};
	    }
	    var descriptor = "layout://foo:bar";
	    var config = {};
	    var actual;

	    // Act
	    mockAuraUtil(function() {
		mockLocalStorage(function() {
		    target.writeToCache(descriptor, config);
		});
	    });
	    var expected = storage[target.cacheName][descriptor];
	    
	    // Assert
	    Assert.True(expected);
	}
    }
}