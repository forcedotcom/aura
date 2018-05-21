"undefined"===typeof Aura&&(Aura={});Aura.bootstrap||(Aura.bootstrap={});Aura.frameworkJsReady||(Aura.ApplicationDefs={cmpExporter:{},libExporter:{}},$A={componentService:{addComponent:function(a,b){Aura.ApplicationDefs.cmpExporter[a]=b},addLibraryExporter:function(a,b){Aura.ApplicationDefs.libExporter[a]=b},initEventDefs:function(a){Aura.ApplicationDefs.eventDefs=a},initLibraryDefs:function(a){Aura.ApplicationDefs.libraryDefs=a},initControllerDefs:function(a){Aura.ApplicationDefs.controllerDefs=a},initModuleDefs:function(a){Aura.ApplicationDefs.moduleDefs=a}}});
$A.componentService.addLibraryExporter("js://ui.panelPositioningLib.positioningUtils", (function (){/*$A.componentService.addLibraryInclude("js://ui.panelPositioningLib.positioningUtils",[],function lib() {
  function getScrollableParent(elem, stopEl) {
    if(!elem || elem === stopEl || elem === document.body) {
      return null
    }
    try {
      var computedStyle = getComputedStyle(elem)
    }catch(e) {
      return null
    }
    if(!computedStyle) {
      return null
    }
    var overflow = computedStyle["overflow-y"];
    if(overflow === "auto" || overflow === "scroll") {
      return elem
    }
    return getScrollableParent(elem.parentNode)
  }
  function isWindow(elem) {
    return elem.toString() === "[object Window]"
  }
  return{getScrollableParent:getScrollableParent, isWindow:isWindow}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.panelPositioningLib.elementProxy", (function (){/*$A.componentService.addLibraryInclude("js://ui.panelPositioningLib.elementProxy",["js://ui.panelPositioningLib.positioningUtils"],function lib(utils, w) {
  function isInDom(el) {
    if(el === w) {
      return true
    }
    if(el.parentNode && el.parentNode.tagName && el.parentNode.tagName.toUpperCase() === "BODY") {
      return true
    }else {
      if(el.parentNode) {
        return isInDom(el.parentNode)
      }else {
        return false
      }
    }
  }
  function computeAbsPos(target) {
    var val2;
    var val = {top:target.offsetTop, left:target.offsetLeft};
    if(target.offsetParent) {
      val2 = computeAbsPos(target.offsetParent);
      val.top += val2.top;
      val.left += val2.left
    }
    return val
  }
  function ElementProxy(el, id) {
    this.id = id;
    this.width = 0;
    this.height = 0;
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
    this._dirty = false;
    this._node = null;
    this._releaseCb = null;
    if(!el) {
      throw new Error("Element missing");
    }
    if(utils.isWindow(el)) {
      el = w
    }
    this._node = el;
    if("MutationObserver" in w) {
      this._observer = new w.MutationObserver(this.refresh.bind(this));
      if(!utils.isWindow(this._node)) {
        this._observer.observe(this._node, {attributes:true, childList:true, characterData:true, subtree:true})
      }
    }
    this.refresh()
  }
  w || (w = window);
  ElementProxy.prototype.setReleaseCallback = function(cb, scope) {
    var scopeObj = scope || this;
    this._releaseCb = cb.bind(scopeObj)
  };
  ElementProxy.prototype.checkNodeIsInDom = function() {
    if(!isInDom(this._node)) {
      return false
    }else {
      return true
    }
  };
  ElementProxy.prototype.refresh = function() {
    if(!this.isDirty()) {
      if(!this.checkNodeIsInDom()) {
        return this.release()
      }
      var box;
      var x;
      var scrollTop;
      var scrollLeft;
      if(typeof w.pageYOffset !== "undefined") {
        scrollTop = w.pageYOffset;
        scrollLeft = w.pageXOffset
      }else {
        scrollTop = w.scrollY;
        scrollLeft = w.scrollX
      }
      if(!utils.isWindow(this._node)) {
        this._node.offsetHeight;
        box = this._node.getBoundingClientRect();
        for(x in box) {
          this[x] = Math.floor(box[x])
        }
        this.top = Math.floor(this.top + scrollTop);
        this.bottom = Math.floor(this.top + box.height);
        this.left = Math.floor(this.left + scrollLeft);
        this.right = Math.floor(this.left + box.width)
      }else {
        box = {};
        this.width = w.document.documentElement.clientWidth;
        this.height = w.document.documentElement.clientHeight;
        this.left = scrollLeft;
        this.top = scrollTop;
        this.right = w.document.documentElement.clientWidth + scrollLeft;
        this.bottom = w.document.documentElement.clientHeight
      }
      this._dirty = false
    }
  };
  ElementProxy.prototype.getNode = function() {
    return this._node
  };
  ElementProxy.prototype.isDirty = function() {
    return this._dirty
  };
  ElementProxy.prototype.bake = function() {
    var absPos = this._node.getBoundingClientRect();
    this._node.style.position = "absolute";
    var style = w.getComputedStyle(this._node);
    var originalLeft;
    var originalTop;
    var scrollTop;
    var scrollLeft;
    if(typeof w.pageYOffset !== "undefined") {
      scrollTop = w.pageYOffset;
      scrollLeft = w.pageXOffset
    }else {
      scrollTop = w.scrollY;
      scrollLeft = w.scrollX
    }
    if(style.left.match(/auto|fixed/)) {
      originalLeft = "0"
    }else {
      originalLeft = style.left
    }
    if(style.top.match(/auto|fixed/)) {
      originalTop = "0"
    }else {
      originalTop = style.top
    }
    originalLeft = parseInt(originalLeft.replace("px", ""), 10);
    originalTop = parseInt(originalTop.replace("px", ""), 10);
    var leftDif = this.left - (absPos.left + scrollLeft);
    var topDif = this.top - (absPos.top + scrollTop);
    this._node.style.left = originalLeft + leftDif + "px";
    this._node.style.top = originalTop + topDif + "px";
    this._dirty = false
  };
  ElementProxy.prototype.set = function(direction, val) {
    this[direction] = val;
    this._dirty = true
  };
  ElementProxy.prototype.release = function() {
    if(this._releaseCb) {
      this._releaseCb(this)
    }
  };
  return{ElementProxy:ElementProxy, isInDom:isInDom}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.panelPositioningLib.elementProxyFactory", (function (){/*$A.componentService.addLibraryInclude("js://ui.panelPositioningLib.elementProxyFactory",["js://ui.panelPositioningLib.elementProxy", "js://ui.panelPositioningLib.positioningUtils"],function lib(elementProxy, utils, win) {
  function releaseOrphanProxies() {
    for(var proxy in proxyCache) {
      if(!proxyCache[proxy].el.checkNodeIsInDom()) {
        proxyCache[proxy].el.release()
      }
    }
  }
  function bakeOff() {
    for(var proxy in proxyCache) {
      if(proxyCache[proxy].el.isDirty()) {
        proxyCache[proxy].el.bake()
      }
    }
  }
  function getReferenceCount(proxy) {
    var id = proxy.id;
    if(!id || !proxyCache[id]) {
      return 0
    }else {
      return proxyCache[id].refCount
    }
  }
  function release(prx) {
    var proxy = proxyCache[prx.id];
    if(proxy) {
      --proxy.refCount
    }
    if(proxy && proxy.refCount <= 0) {
      delete proxyCache[prx.id]
    }
  }
  function elementProxyFactory(el) {
    var key;
    var newProxy;
    if(utils.isWindow(el)) {
      key = "window"
    }else {
      $A.assert(el && el.nodeType && (el.nodeType !== 1 || el.nodeType !== 11), "Element Proxy requires an element");
      if(!el.id) {
        var cmp = w.$A.getComponent(el);
        el.id = cmp ? cmp.getGlobalId() : "window"
      }
      key = el.id
    }
    if(proxyCache[key]) {
      proxyCache[key].refCount++;
      return proxyCache[key].el
    }else {
      newProxy = new ElementProxy(el, key);
      newProxy.setReleaseCallback(release, newProxy);
      proxyCache[key] = {el:newProxy, refCount:1}
    }
    w.setTimeout(releaseOrphanProxies, 0);
    return proxyCache[key].el
  }
  function reset() {
    proxyCache = {}
  }
  var w = win || window;
  var ElementProxy = elementProxy.ElementProxy;
  var proxyCache = {};
  return{_proxyCache:proxyCache, getReferenceCount:getReferenceCount, getElement:elementProxyFactory, bakeOff:bakeOff, resetFactory:reset, release:release}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.panelPositioningLib.constraint", (function (){/*$A.componentService.addLibraryInclude("js://ui.panelPositioningLib.constraint",["js://ui.panelPositioningLib.elementProxyFactory"],function lib() {
  var transformFunctions = {center:function(inp, targetBox) {
    return Math.floor(inp + 0.5 * targetBox.width)
  }, right:function(inp, targetBox) {
    return inp + targetBox.width
  }, left:function(inp) {
    return inp
  }, bottom:function(inp, targetBox) {
    return inp + targetBox.height
  }};
  var Constraint = function(type, conf) {
    var targetAlign;
    this._el = conf.element;
    this._targetElement = conf.target;
    this._inputDirection = "top";
    this.destroyed = false;
    var pad = conf.pad || 0;
    var boxDirs = conf.boxDirections || {left:true, right:true};
    this._transformX = function(inp) {
      return inp
    };
    this._transformY = function(inp) {
      return inp
    };
    if(conf.targetAlign) {
      targetAlign = conf.targetAlign.split(/\s/);
      this._transformX = transformFunctions[targetAlign[0]];
      this._transformY = transformFunctions[targetAlign[1]] ? transformFunctions[targetAlign[1]] : this._transformY
    }
    var self = this;
    switch(type) {
      case "top":
        this._exp = function(targetBox, elementBox) {
          return{top:self._transformY(targetBox.top, targetBox, elementBox) + pad}
        };
        break;
      case "bottom":
        this._exp = function(targetBox, elementBox) {
          return{top:self._transformY(targetBox.top, targetBox, elementBox) - elementBox.height - pad}
        };
        break;
      case "center":
        this._exp = function(targetBox, elementBox) {
          return{left:Math.floor(self._transformX(targetBox.left, targetBox, elementBox) - 0.5 * elementBox.width)}
        };
        break;
      case "middle":
        this._exp = function(targetBox, elementBox) {
          return{top:Math.floor(0.5 * (2 * targetBox.top + targetBox.height - elementBox.height))}
        };
        break;
      case "left":
        this._exp = function(targetBox, elementBox) {
          return{left:self._transformX(targetBox.left, targetBox, elementBox) + pad}
        };
        break;
      case "right":
        this._exp = function(targetBox, elementBox) {
          return{left:self._transformX(targetBox.left, targetBox, elementBox) - elementBox.width - pad}
        };
        break;
      case "below":
        this._exp = function(targetBox, elementBox) {
          if(elementBox.top < targetBox.top + targetBox.height + pad) {
            return{top:targetBox.top + targetBox.height + pad}
          }
        };
        break;
      case "bounding box":
        this._exp = function(targetBox, elementBox) {
          var retBox = {};
          if(boxDirs.top && elementBox.top < targetBox.top + pad) {
            retBox.top = targetBox.top + pad
          }
          if(boxDirs.left && elementBox.left < targetBox.left + pad) {
            retBox.left = targetBox.left + pad
          }
          if(boxDirs.right && elementBox.left + elementBox.width > targetBox.left + targetBox.width - pad) {
            retBox.left = targetBox.left + targetBox.width - elementBox.width - pad
          }
          if(boxDirs.bottom && elementBox.top + elementBox.height > targetBox.top + targetBox.height - pad) {
            retBox.top = targetBox.top + targetBox.height - elementBox.height - pad
          }
          return retBox
        };
        break;
      case "inverse bounding box":
        this._exp = function(targetBox, elementBox) {
          var retBox = {};
          if(boxDirs.left && targetBox.left - pad < elementBox.left) {
            retBox.left = targetBox.left - pad
          }
          if(boxDirs.right && elementBox.left + elementBox.width < targetBox.left + targetBox.width + pad) {
            retBox.left = targetBox.width + pad - elementBox.width + targetBox.left
          }
          if(boxDirs.top && targetBox.top < elementBox.top + pad) {
            retBox.top = targetBox.top - pad
          }
          if(boxDirs.bottom && elementBox.top + elementBox.height < targetBox.top + targetBox.height + pad) {
            retBox.top = targetBox.height + pad - elementBox.height + targetBox.top
          }
          return retBox
        };
        break;
      default:
        console.error("no constraint expression for", type);
        this._exp = function() {
        }
    }
    if(conf && conf.enable === false) {
      this._disabled = true
    }
  };
  Constraint.prototype.detach = function() {
    this._disabled = true
  };
  Constraint.prototype.attach = function() {
    this._disabled = false
  };
  Constraint.prototype.updateValues = function() {
    if(!this._disabled) {
      this._targetElement.refresh();
      this._pendingBox = this._exp(this._targetElement, this._el)
    }
  };
  Constraint.prototype.reposition = function() {
    var el = this._el;
    if(!this._disabled) {
      for(var val in this._pendingBox) {
        el.set(val, this._pendingBox[val])
      }
    }
  };
  Constraint.prototype.destroy = function() {
    this._el.release();
    this._targetElement.release();
    this._disabled = true;
    this.destroyed = true
  };
  return{Constraint:Constraint}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.panelPositioningLib.panelPositioning", (function (){/*$A.componentService.addLibraryInclude("js://ui.panelPositioningLib.panelPositioning",["js://ui.panelPositioningLib.constraint", "js://ui.panelPositioningLib.elementProxyFactory", "js://ui.panelPositioningLib.positioningUtils"],function lib(constraint, elementProxyFactory, utils, win) {
  function isDomNode(obj) {
    return obj.nodeType && (obj.nodeType === 1 || obj.nodeType === 11)
  }
  function dispatchRepositionCallbacks() {
    for(;repositionCallbacks.length > 0;) {
      repositionCallbacks.shift()()
    }
  }
  function reposition(callback) {
    var toSplice = [];
    if(typeof callback === "function") {
      repositionCallbacks.push(callback)
    }
    clearTimeout(timeoutId);
    timeoutId = 0;
    if(!repositionScheduled) {
      w.requestAnimationFrame(function() {
        repositionScheduled = false;
        for(var i = 0;i < constraints.length;i++) {
          if(!constraints[i].destroyed) {
            constraints[i].updateValues();
            constraints[i].reposition()
          }else {
            toSplice.push(i)
          }
        }
        for(;toSplice.length > 0;) {
          constraints.splice(toSplice.pop(), 1)
        }
        elementProxyFactory.bakeOff();
        dispatchRepositionCallbacks()
      });
      repositionScheduled = true
    }
  }
  function handleRepositionEvents() {
    if(timeoutId === 0) {
      timeoutId = setTimeout(reposition, 10)
    }
  }
  function bindEvents() {
    w.addEventListener("resize", handleRepositionEvents);
    w.addEventListener("scroll", handleRepositionEvents);
    eventsBound = true
  }
  function detachEvents() {
    w.removeEventListener("resize", handleRepositionEvents);
    w.removeEventListener("scroll", handleRepositionEvents);
    eventsBound = false
  }
  function isScrolling(elem) {
    return elem.scrollHeight > elem.clientHeight
  }
  function containsScrollingElement(list) {
    var len = list.length;
    if(!len) {
      return false
    }
    for(var i = 0;i < len;i++) {
      if(isScrolling(list[i])) {
        return true
      }
    }
    return false
  }
  var ALIGN_REGEX = /^(left|right|center)\s(top|bottom|center)$/;
  var w = win || window;
  var Constraint = constraint.Constraint;
  var repositionScheduled = false;
  var eventsBound = false;
  var constraints = [];
  var timeoutId = 0;
  var repositionCallbacks = [];
  var directionMap = {vert:{top:"top", center:"middle", bottom:"bottom"}, horiz:{left:"left", right:"right", center:"center"}};
  return{createRelationship:function(config) {
    if(!eventsBound) {
      bindEvents()
    }
    var constraintList = [];
    var handleWheel;
    var observer;
    var proxyWheelEvents = true;
    var domHandle = config.element;
    var scrollableParent = utils.getScrollableParent(config.target.tagName === "TEXTAREA" ? config.target.parentNode : config.target, w);
    if(w.MutationObserver) {
      var scrollableChildren = domHandle.querySelectorAll('[data-scoped-scroll\x3d"true"]');
      observer = new MutationObserver(function() {
        scrollableChildren = domHandle.querySelectorAll('[data-scoped-scroll\x3d"true"]');
        proxyWheelEvents = !containsScrollingElement(scrollableChildren)
      });
      if(containsScrollingElement(scrollableChildren)) {
        proxyWheelEvents = false
      }
      observer.observe(domHandle, {attributes:true, subtree:true, childList:true})
    }
    if(scrollableParent) {
      scrollableParent.addEventListener("scroll", handleRepositionEvents);
      handleWheel = function(e) {
        if(proxyWheelEvents && scrollableParent && typeof scrollableParent.scrollTop !== "undefined") {
          scrollableParent.scrollTop += e.deltaY
        }
      };
      config.element.addEventListener("wheel", handleWheel)
    }
    $A.assert(config.element && isDomNode(config.element), "Element is undefined or missing");
    $A.assert(config.target && (utils.isWindow(config.target) || isDomNode(config.target)), "Target is undefined or missing");
    if(config.appendToBody) {
      document.body.appendChild(config.element)
    }
    if(config.align) {
      $A.assert(!!config.align.match(ALIGN_REGEX), "Invalid align string")
    }
    if(!config.type && config.targetAlign) {
      $A.assert(!!config.targetAlign.match(ALIGN_REGEX), "Invalid targetAlign string")
    }
    config.element = elementProxyFactory.getElement(config.element);
    config.target = elementProxyFactory.getElement(config.target);
    if(!config.type) {
      $A.assert(config.align, "Required align string missing");
      var constraintDirections = config.align.split(/\s/);
      var vertConfig = $A.util.copy(config);
      if(vertConfig.padTop !== undefined) {
        vertConfig.pad = vertConfig.padTop
      }
      constraintList.push(new Constraint(directionMap.horiz[constraintDirections[0]], config));
      constraintList.push(new Constraint(directionMap.vert[constraintDirections[1]], vertConfig))
    }else {
      constraintList.push(new Constraint(config.type, config))
    }
    if(config.scrollableParentBound && scrollableParent) {
      var boxConfig = {element:config.element, enabled:config.enabled, target:elementProxyFactory.getElement(scrollableParent), type:"bounding box", pad:3, boxDirections:{top:true, bottom:true, left:true, right:true}};
      constraintList.push(new Constraint(boxConfig.type, boxConfig))
    }
    constraints = constraints.concat(constraintList);
    reposition();
    return{disable:function() {
      constraintList.forEach(function(constraintToDisable) {
        constraintToDisable.detach()
      })
    }, enable:function() {
      constraintList.forEach(function(constraintToEnable) {
        constraintToEnable.attach()
      })
    }, destroy:function() {
      if(scrollableParent) {
        scrollableParent.removeEventListener("scroll", handleRepositionEvents)
      }
      for(;constraintList.length > 0;) {
        constraintList.pop().destroy()
      }
      if(config.appendToBody && config.element) {
        var nodeToRemove = document.getElementById(config.element.id);
        if(nodeToRemove) {
          nodeToRemove.parentNode.removeChild(nodeToRemove)
        }
      }
    }}
  }, reposition:reposition}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.eventLib.interactive", (function (){/*$A.componentService.addLibraryInclude("js://ui.eventLib.interactive",[],function lib() {
  var lib = {DATA_UID_KEY:"data-interactive-lib-uid", domEventMap:{}, interactiveUid:1, addDomEvents:function(component) {
    var events = lib.getHandledDOMEvents(component);
    var helper = component.getConcreteComponent().getDef().getHelper() || this;
    for(var event in events) {
      if(helper.addDomHandler) {
        helper.addDomHandler(component, event)
      }else {
        lib.addDomHandler(component, event)
      }
    }
  }, addDomHandler:function(component, event) {
    var el = component.getElement();
    this.attachDomHandlerToElement(component, el, event)
  }, attachDomHandlerToElement:function(component, element, event) {
    if(!element) {
      return
    }
    var handler = $A.getCallback(this.domEventHandler);
    var elementId = this.getUid(element) || this.newUid(element);
    $A.util.on(element, event, handler);
    if(!this.domEventMap[elementId]) {
      this.domEventMap[elementId] = {}
    }
    var existing = this.domEventMap[elementId][event];
    if(existing) {
      $A.util.removeOn(element, event, existing)
    }
    this.domEventMap[elementId][event] = handler
  }, getUid:function(element) {
    return element.getAttribute(this.DATA_UID_KEY)
  }, newUid:function(element) {
    var nextUid = ++this.interactiveUid;
    element.setAttribute(this.DATA_UID_KEY, nextUid);
    return nextUid
  }, removeDomEventsFromMap:function(component) {
    var element = component.getElement();
    if(!element) {
      return
    }
    var elementId = this.getUid(element);
    if(!elementId) {
      var inputElement = this.getInputElement(element);
      if(inputElement) {
        elementId = this.getUid(inputElement);
        element = inputElement
      }
    }
    if(elementId && this.domEventMap.hasOwnProperty(elementId)) {
      var eventHandlers = this.domEventMap[elementId];
      for(var event in eventHandlers) {
        var existing = eventHandlers[event];
        if(existing) {
          $A.util.removeOn(element, event, existing)
        }
      }
      delete this.domEventMap[elementId]
    }
  }, domEventHandler:function(event) {
    var element = event.target;
    var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
    if(!htmlCmp) {
      return
    }
    var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
    component = component.meta.name === "ui$inputSmartNumber" ? component.getComponentValueProvider().getConcreteComponent() : component;
    var helper = component.getDef().getHelper();
    if(component._recentlyClicked) {
      return
    }
    if(helper && helper.preEventFiring) {
      helper.preEventFiring(component, event)
    }
    lib._dispatchAction(undefined, event, htmlCmp, component, helper);
    if(event.type === "click" && component.isInstanceOf("ui:doubleClicks") && component.get("v.disableDoubleClicks")) {
      component._recentlyClicked = true;
      window.setTimeout(function() {
        component._recentlyClicked = false
      }, 350)
    }
  }, _dispatchAction:function(action, event, htmlCmp, component, helper) {
    if(helper && helper.fireEvent) {
      helper.fireEvent(component, event, helper)
    }else {
      lib.fireEvent(component, event, helper)
    }
  }, fireEvent:function(component, event) {
    if(component.isValid()) {
      var e = component.getEvent(event.type);
      if(!$A.util.isUndefinedOrNull(e) && e.getDef) {
        lib.setEventParams(e, event);
        e.fire()
      }
    }
  }, getDomEvents:function(component) {
    return component.getDef().getAllEvents()
  }, getHandledDOMEvents:function(component) {
    var ret = {};
    var handledEvents = component.getHandledEvents();
    var domEvents = lib.getDomEvents(component);
    if(domEvents) {
      var i = 0;
      for(var len = domEvents.length;i < len;i++) {
        var eventName = domEvents[i].toLowerCase();
        if(handledEvents[eventName]) {
          ret[eventName] = true
        }
      }
    }
    return ret
  }, setEventParams:function(e, DOMEvent) {
    var attributeDefs = e.getDef().getAttributeDefs().getNames();
    var params = {};
    var attribute;
    var c = 0;
    for(var length = attributeDefs.length;c < length;c++) {
      attribute = attributeDefs[c];
      if(attribute === "domEvent") {
        params[attribute] = DOMEvent
      }else {
        if(attribute === "keyCode") {
          params[attribute] = DOMEvent.which || DOMEvent.keyCode
        }else {
          params[attribute] = DOMEvent[attribute]
        }
      }
    }
    e.setParams(params)
  }, setDisabled:function(component, disabled, disabledCss) {
    component.set("v.disabled", disabled);
    if(disabledCss) {
      if(disabled) {
        $A.util.addClass(component.getElement(), disabledCss)
      }else {
        $A.util.removeClass(component.getElement(), disabledCss)
      }
    }
  }, getInputElement:function(element) {
    if(!element) {
      return element
    }
    return element.getElementsByTagName("input")[0] || element.getElementsByTagName("a")[0] || element.getElementsByTagName("select")[0] || element.getElementsByTagName("textarea")[0] || element
  }};
  return lib
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.dateTimeLib.dateTimeService", (function (){/*$A.componentService.addLibraryInclude("js://ui.dateTimeLib.dateTimeService",[],function lib() {
  var convertToTimezone = function(isoString, timezone, callback) {
    var date = $A.localizationService.parseDateTimeISO8601(isoString);
    if(!$A.util.isUndefinedOrNull(date)) {
      $A.localizationService.UTCToWallTime(date, timezone, callback)
    }
  };
  var convertFromTimezone = function(date, timezone, callback) {
    var localDate = new Date(date);
    $A.localizationService.WallTimeToUTC(localDate, timezone, callback)
  };
  return{getDisplayValue:function(value, config, callback) {
    if($A.util.isEmpty(value)) {
      callback({date:"", time:""});
      return
    }
    var splitValue = value.split("T");
    var dateValue = splitValue[0] || value;
    var timeValue = splitValue[1];
    var useStrictParsing = config.validateString === true;
    var date = config.langLocale ? $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", config.langLocale, useStrictParsing) : $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", useStrictParsing);
    if($A.util.isEmpty(date)) {
      callback({date:dateValue, time:timeValue || value});
      return
    }
    var hasTime = !$A.util.isEmpty(timeValue);
    if(!config.timeFormat && timeValue === "00:00:00.000Z") {
      hasTime = false
    }
    var displayValue = function(convertedDate) {
      if(!$A.util.getBooleanValue(config.ignoreThaiYearTranslation)) {
        convertedDate = $A.localizationService.translateToOtherCalendar(convertedDate)
      }
      var formattedDate = $A.localizationService.formatDateUTC(convertedDate, config.format, config.langLocale);
      var formattedTime;
      if(config.timeFormat) {
        formattedTime = $A.localizationService.formatTimeUTC(convertedDate, config.timeFormat, config.langLocale)
      }
      var isoFormattedDateTime = convertedDate.toISOString();
      callback({date:formattedDate, time:formattedTime, isoString:isoFormattedDateTime})
    };
    if(hasTime) {
      convertToTimezone(value, config.timezone, $A.getCallback(displayValue))
    }else {
      displayValue(date)
    }
  }, getISOValue:function(date, config, callback) {
    var hours = config.hours;
    var minutes = config.minutes;
    if(hours) {
      date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes)
    }
    var isoValue = function(convertedDate) {
      var translatedDate = $A.localizationService.translateFromOtherCalendar(convertedDate);
      var isoString = translatedDate.toISOString();
      callback(isoString)
    };
    convertFromTimezone(date, config.timezone, $A.getCallback(isoValue))
  }}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.inputNumberLibrary.number", (function (){/*$A.componentService.addLibraryInclude("js://ui.inputNumberLibrary.number",[],function lib() {
  function isNoZeroLeadingNumber(string) {
    var decimalSeparator = $A.get("$Locale.decimal");
    var reg = new RegExp("(^\\s*(\\+|\\-)?\\s*)\\" + decimalSeparator + "\\d{0,}(K|B|M|T)?$");
    return reg.test(string)
  }
  function injectZeroBeforeDecimalSeparator(string) {
    var decimalSeparator = $A.get("$Locale.decimal");
    var numberParts = string.split(decimalSeparator);
    return numberParts[0] + "0" + decimalSeparator + numberParts[1]
  }
  var exponentByPrefix = {"k":3, "m":6, "b":9, "t":12};
  return{formatNumber:function(number, formatter) {
    var numberFormat = this.getNumberFormat(formatter);
    if(!$A.util.isUndefinedOrNull(number) && !isNaN(number)) {
      return numberFormat.format(number)
    }
    return""
  }, getNumberFormat:function(formatter) {
    if(typeof formatter === "string") {
      try {
        return $A.localizationService.getNumberFormat(formatter)
      }catch(e) {
        return $A.localizationService.getDefaultNumberFormat()
      }
    }
    return $A.localizationService.getDefaultNumberFormat()
  }, unFormatNumber:function(string) {
    if(this.isNumber(string)) {
      return string
    }
    var decimalSeparator = $A.get("$Locale.decimal");
    var currencySymbol = $A.get("$Locale.currency");
    var stringOriginal = string;
    string = string.replace(currencySymbol, "");
    if(isNoZeroLeadingNumber(string)) {
      string = injectZeroBeforeDecimalSeparator(string)
    }
    if(decimalSeparator !== ".") {
      string = string.replace(/\./g, "").replace(decimalSeparator, ".")
    }
    var numberOnlyPart = string.replace(/[^0-9\.]+/g, "");
    var value = ((string.split("-").length + Math.min(string.split("(").length - 1, string.split(")").length - 1)) % 2 ? 1 : -1) * Number(numberOnlyPart);
    var exponentKey = Object.keys(exponentByPrefix).find(function(abbreviation) {
      var regExp = new RegExp("[^a-zA-Z]" + abbreviation + "(?:\\)|(\\" + currencySymbol + ")?(?:\\))?)?$", "i");
      return stringOriginal.match(regExp)
    });
    if(exponentKey) {
      var exponent = exponentByPrefix[exponentKey];
      var decimalSeparatorIndex = numberOnlyPart.indexOf(".");
      var fractionalDigitsNeeded = decimalSeparatorIndex >= 0 ? numberOnlyPart.length - (decimalSeparatorIndex + exponent + 1) : 0;
      if(fractionalDigitsNeeded < 0) {
        fractionalDigitsNeeded = 0
      }
      return parseFloat((value * Math.pow(10, exponent)).toFixed(fractionalDigitsNeeded))
    }else {
      return value
    }
  }, isNumber:function(number) {
    return $A.util.isNumber(number)
  }, isFormattedNumber:function(string) {
    var decimalSeparator = $A.get("$Locale.decimal");
    var groupingSeparator = $A.get("$Locale.grouping");
    var const1 = "(?!(K|B|M|T))";
    var regString = "^" + const1 + "((\\s*(\\+|\\-)?\\s*)" + const1 + ")?" + "(\\d*(\\" + groupingSeparator + "\\d*)*)*" + "(\\" + decimalSeparator + "\\d*)?" + "(K|B|M|T)?$";
    var reg = new RegExp(regString, "i");
    return reg.test(string)
  }}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.urlLib.linkify", (function (){/*$A.componentService.addLibraryInclude("js://ui.urlLib.linkify",[],function lib() {
  var linksMatchingRegex = "((?:(?:https?|ftp)://(?:[\\w\\-\\|\x3d%~#/+*@\\.,;:\\?!']|\x26(?!quot;|amp;|lt;|gt;|#39;)){0,2047}(?:[\\w\x3d/+#-]|\\([^\\s()]*\\)))|(?:\\b(?:[a-z0-9]" + "(?:[-a-z0-9]{0,62}[a-z0-9])?\\.)+(?:AC|AD|AE|AERO|AF|AG|AI|AL|AM|AN|AO|AQ|AR|ARPA|AS|ASIA|AT|AU|AW|AX|AZ|BA|BB|" + "BD|BE|BF|BG|BH|BI|BIZ|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CAT|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|COM|COOP|CR|CU|" + "CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EDU|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GOV|" + 
  "GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|INFO|INT|IO|IQ|IR|IS|IT|JE|JM|JO|JOBS|JP|KE|KG|KH|KI|" + "KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MIL|MK|ML|MM|MN|MO|MOBI|MP|MQ|MR|MS|MT|" + "MU|MUSEUM|MV|MW|MX|MY|MZ|NA|NAME|NC|NE|NET|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|ORG|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PRO|" + "PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|SZ|TC|TD|TEL|TF|TG|TH|TJ|" + "TK|TL|TM|TN|TO|TP|TR|TRAVEL|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|XN--0ZWM56D|XN--11B5BS3A9AJ6G|" + 
  "XN--80AKHBYKNJ4F|XN--9T4B11YI5A|XN--DEBA0AD|XN--FIQS8S|XN--FIQZ9S|XN--G6W251D|XN--HGBK6AJ7F53BBA|XN--HLCJ6AYA9ESC7A|" + "XN--J6W193G|XN--JXALPDLP|XN--KGBECHTV|XN--KPRW13D|XN--KPRY57D|XN--MGBAAM7A8H|XN--MGBERP4A5D4AR|XN--P1AI|XN--WGBH1C|" + "XN--ZCKZAH|YE|YT|ZA|ZM|ZW)(?!@(?:[a-z0-9](?:[-a-z0-9]{0,62}[a-z0-9])?\\.)+(?:AC|AD|AE|AERO|AF|AG|AI|AL|AM|AN|AO|" + "AQ|AR|ARPA|AS|ASIA|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BIZ|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CAT|CC|CD|CF|" + "CG|CH|CI|CK|CL|CM|CN|CO|COM|COOP|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EDU|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|" + 
  "GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GOV|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|INFO|INT|IO|IQ|IR|" + "IS|IT|JE|JM|JO|JOBS|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MIL|" + "MK|ML|MM|MN|MO|MOBI|MP|MQ|MR|MS|MT|MU|MUSEUM|MV|MW|MX|MY|MZ|NA|NAME|NC|NE|NET|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|ORG|" + "PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PRO|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|" + "SU|SV|SY|SZ|TC|TD|TEL|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TP|TR|TRAVEL|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|" + 
  "VU|WF|WS|XN--0ZWM56D|XN--11B5BS3A9AJ6G|XN--80AKHBYKNJ4F|XN--9T4B11YI5A|XN--DEBA0AD|XN--FIQS8S|XN--FIQZ9S|XN--G6W251D|" + "XN--HGBK6AJ7F53BBA|XN--HLCJ6AYA9ESC7A|XN--J6W193G|XN--JXALPDLP|XN--KGBECHTV|XN--KPRW13D|XN--KPRY57D|XN--MGBAAM7A8H|" + "XN--MGBERP4A5D4AR|XN--P1AI|XN--WGBH1C|XN--ZCKZAH|YE|YT|ZA|ZM|ZW))[\\w\\:\\\x3d\\\x26\\?\\#]{0,2048}(?:/[\\w\\-\x3d?/.\x26;:%~,+@#*]{0,2048}(?:[\\w\x3d/+#-]|" + "\\([^\\s()]*\\)))?(?:$|(?\x3d\\.$)|(?\x3d\\.\\s)|(?\x3d[^\\w\\.]))))|([\\w-\\.\\+_]{1,64}@(?:[\\w-]){1,255}(?:\\.[\\w-]{1,255}){1,10})";
  var whitelistedTagsMatchingRegex = "(\x3ca[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/a\x3e|\x3ca[\\s]+[^\x3e]+/\x3e|" + "\x3ci?frame[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/i?frame\x3e|\x3ci?frame[\\s]+[^\x3e]+/\x3e|" + "\x3carea[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/area\x3e|\x3carea[\\s]+[^\x3e]+/\x3e|" + "\x3clink[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/link\x3e|\x3clink[\\s]+[^\x3e]+/\x3e|" + "\x3cimg[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/img\x3e|\x3cimg[\\s]+[^\x3e]+\x3e|" + "\x3cform[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/form\x3e|\x3cform[\\s]+[^\x3e]+/\x3e|" + 
  "\x3cbody[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/body\x3e|\x3cbody[\\s]+[^\x3e]+/\x3e|" + "\x3chead[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/head\x3e|\x3chead[\\s]+[^\x3e]+/\x3e|" + "\x3cinput[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/input\x3e|\x3cinput[\\s]+[^\x3e]+/\x3e|" + "\x3cbutton[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/button\x3e|\x3cbutton[\\s]+[^\x3e]+/\x3e|" + "\x3cblockquote[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/blockquote\x3e|\x3cblockquote[\\s]+[^\x3e]+/\x3e|" + "\x3cq[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/q\x3e|\x3cq[\\s]+[^\x3e]+/\x3e|" + 
  "\x3cdel[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/del\x3e|\x3cdel[\\s]+[^\x3e]+/\x3e|" + "\x3cins[\\s]+[^\x3e]+[^/]\x3e[\\s\\S]*?\x3c/ins\x3e|\x3cins[\\s]+[^\x3e]+/\x3e)";
  var escapeCharacterMatchingRegex = "([\x3c\x3e\"']|\x26(?!quot;|amp;|lt;|gt;|#39;))";
  var createHttpLink = function(match) {
    var href = match;
    if(match.toLowerCase().lastIndexOf("http", 0) !== 0 && match.toLowerCase().lastIndexOf("ftp", 0) !== 0) {
      href = "http://" + href
    }
    return'\x3ca href\x3d"' + href + '" target\x3d"_blank"\x3e' + match + "\x3c/a\x3e"
  };
  var createEmailLink = function(match) {
    return'\x3ca href\x3d"mailto:' + match + '"\x3e' + match + "\x3c/a\x3e"
  };
  var escapeCharacter = function(match) {
    switch(match) {
      case "\x3c":
        return"\x26lt;";
      case "\x3e":
        return"\x26gt;";
      case "\x26":
        return"\x26amp;";
      case '"':
        return"\x26quot;";
      case "'":
        return"\x26#39;";
      default:
        return match
    }
  };
  return{linkifyText:function(text) {
    if($A.util.isEmpty(text)) {
      return text
    }else {
      if(typeof text !== "string") {
        text = text.toString()
      }
    }
    var regex = new RegExp(whitelistedTagsMatchingRegex + "|" + linksMatchingRegex, "gi");
    return text.replace(regex, function(match, tagMatch, hrefMatch, emailMatch) {
      if(tagMatch) {
        return tagMatch
      }else {
        if(hrefMatch) {
          return createHttpLink(hrefMatch)
        }else {
          if(emailMatch) {
            return createEmailLink(emailMatch)
          }
        }
      }
    })
  }, escapeAndLinkifyText:function(text) {
    if($A.util.isEmpty(text)) {
      return text
    }else {
      if(typeof text !== "string") {
        text = text.toString()
      }
    }
    var regex = new RegExp(linksMatchingRegex + "|" + escapeCharacterMatchingRegex, "gi");
    return text.replace(regex, function(match, hrefMatch, emailMatch, escapeMatch) {
      if(hrefMatch) {
        return createHttpLink(hrefMatch)
      }else {
        if(emailMatch) {
          return createEmailLink(emailMatch)
        }else {
          if(escapeMatch) {
            return escapeCharacter(escapeMatch)
          }
        }
      }
    })
  }}
}

);
*/}));$A.componentService.addLibraryExporter("js://ui.urlLib.urlUtil", (function (){/*$A.componentService.addLibraryInclude("js://ui.urlLib.urlUtil",[],function lib() {
  return{makeAbsolute:function(url) {
    var newUrl = url;
    if(!$A.util.isEmpty(url)) {
      var urlLower = url.toLowerCase();
      if(urlLower.indexOf("http://") !== 0 && urlLower.indexOf("https://") !== 0 && urlLower.indexOf("ftp://") !== 0 && url.indexOf("/") !== 0 && url.indexOf(".") !== 0) {
        newUrl = "http://" + url
      }
    }
    return newUrl
  }}
}

);
*/}));$A.componentService.addLibraryExporter("js://appJsGenerator.generatorLib.generatorLib", (function (){/*$A.componentService.addLibraryInclude("js://appJsGenerator.generatorLib.generatorLib",[],function generatorLib() {
  return
}

);
*/}));$A.componentService.addComponent("markup://aura:text", (function (){/*$A.componentService.addComponentClass("markup://aura:text",function() {
return {
  "meta":{
    "name":"aura$text"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:text",
  "ad":[
    ["value","aura://String","G",false],
    ["truncate","aura://Integer","I",false],
    ["truncateByWord","aura://Boolean","I",false,false],
    ["ellipsis","aura://Boolean","I",false,true]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:placeholder", (function (){/*$A.componentService.addComponentClass("markup://aura:placeholder",function() {
return {
  "meta":{
    "name":"aura$placeholder",
    "extends":"markup://aura:component"
  },
  "renderer":{
    "render":function(cmp) {
        var ret=cmp.superRender();
        return ret;
    },
    "rerender":function(cmp) {
        return cmp.superRerender();
    },
    "afterRender":function(cmp) {
        if ($A.util.getBooleanValue(cmp.get("v.loaded"))){
            return cmp.superAfterRender();
        }

        var action = $A.get("c.aura://ComponentController.getComponent");
        var attributes = cmp.get("v.attributes");
        var atts = {};
        for(var x in attributes){
            var value=attributes[x];
            
            if(value) {
	            if(value["descriptor"]){
	                value=value["value"];
	            }
	            if($A.util.isExpression(value)){
	                value=value.evaluate();
	            }
            }
            atts[x]=value;
        }
        var avp = cmp.getAttributeValueProvider();

        action.setCallback(this, function(a){
            var newBody;
            if(!cmp.isValid()){
                return;
            }
            var state = a.getState();
            if (state === "SUCCESS"){
                var config= a.getReturnValue();
                if(!config.hasOwnProperty("attributes")){
                    config["attributes"]={"values":{}};
                }
                $A.util.apply(config["attributes"]["values"], attributes);
                config["attributes"]["valueProvider"] = avp;
                newBody = $A.createComponentFromConfig(config);
            } else if (state === "INCOMPLETE") { 
            	var offlineMessageEvt = $A.getEvt('markup://force:showOfflineMessage');
            	if(offlineMessageEvt){
            		offlineMessageEvt.setParams({retryAction: action}).fire();
            	}
            } else if (state === "ERROR") {
                var errors = a.getError();
                newBody = $A.createComponentFromConfig({ "descriptor" : "markup://aura:text" });
                if (errors) {
                    newBody.set("v.value", errors[0].message);

                } else {
                    newBody.set("v.value", 'unknown error');
                }
            }




            
            var localId = cmp.getLocalId();
            if(localId){
                var cvp = cmp.getAttributeValueProvider();
                cvp.deIndex(localId, cmp.getGlobalId());
                cvp.index(localId, newBody.getGlobalId());
            }
            cmp.set("v.loaded", true, true);
            cmp.set("v.body", [newBody]);
        });

        var desc = cmp.get("v.refDescriptor");
        action.setParams({
            "name" : desc,
            "attributes" : atts
        });

        $A.enqueueAction(action);

        cmp.superAfterRender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://aura:placeholder",
  "st":{
    "descriptor":"css://aura.placeholder",
    "cl":"auraPlaceholder"
  },
  "ad":[
    ["body","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":"spin"
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"div"
            }
          }
        }
      }
    ]],
    ["refDescriptor","java://org.auraframework.def.DefDescriptor","I",false,null],
    ["attributes","aura://Object","I",false,null],
    ["loaded","aura://Boolean","I",false,false],
    ["exclusive","aura://Boolean","I",false,false]
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"aura:placeholder",
                  "path":"v.body"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:component", (function (){/*$A.componentService.addComponentClass("markup://aura:component",function() {
return {
  "meta":{
    "name":"aura$component"
  },
  "renderer":{
    "render":function(component) {
        var rendering = component.getRendering();
        return rendering||$A.renderingService.renderFacet(component,component.get("v.body"));
    },
    "afterRender":function(component) {
        var body = component.get("v.body");
        $A.afterRender(body);
    },
    "rerender":function(component) {
        var body = component.get("v.body");
        return $A.renderingService.rerenderFacet(component,body);
    },
    "unrender":function(component) {
        var body = component.get("v.body");
        $A.renderingService.unrenderFacet(component,body);
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:component",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "ab":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:expression", (function (){/*$A.componentService.addComponentClass("markup://aura:expression",function() {
return {
  "meta":{
    "name":"aura$expression"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:expression",
  "ad":[
    ["value","aura://String","G",false]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:html", (function (){/*$A.componentService.addComponentClass("markup://aura:html",function() {
return {
  "meta":{
    "name":"aura$html"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:html",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["tag","aura://String","G",false],
    ["HTMLAttributes","aura://Map","G",false,null]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:if", (function (){/*$A.componentService.addComponentClass("markup://aura:if",function() {
return {
  "meta":{
    "name":"aura$if"
  },
  "controller":{

  },
  "renderer":{
    "render":function(component) {
        var rendering = component.getRendering();
        return rendering||$A.renderingService.renderFacet(component,component.get("v.body"));
    },
    "afterRender":function(component) {
        var body = component.get("v.body");
        $A.afterRender(body);
    },
    "rerender":function(component) {
        var body = component.get("v.body");
        return $A.renderingService.rerenderFacet(component,body);
    },
    "unrender":function(component) {
        var body = component.get("v.body");
        $A.renderingService.unrenderFacet(component,body);
    }
  },
  "provider":{
    "provide":function(component) {
        return component;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:if",
  "ad":[
    ["isTrue","aura://Boolean","G",true],
    ["body","aura://Aura.ComponentDefRef[]","G",true,[]],
    ["else","aura://Aura.ComponentDefRef[]","G",false,[]],
    ["template","aura://Aura.ComponentDefRef[]","I",false,[]]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleTheTruth"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.isTrue"
      },
      "n":"change"
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:iteration", (function (){/*$A.componentService.addComponentClass("markup://aura:iteration",function() {
return {
  "meta":{
    "name":"aura$iteration"
  },
  "controller":{

  },
  "provider":{
    "provide":function(component) {
        return component;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:iteration",
  "ad":[
    ["items","aura://List","G",true,[]],
    ["var","aura://String","G",true],
    ["indexVar","aura://String","G",false,"_index"],
    ["start","aura://Integer","G",false],
    ["end","aura://Integer","G",false],
    ["loaded","aura://Boolean","G",false,false],
    ["body","aura://Aura.ComponentDefRef[]","G",true,[]],
    ["template","aura://Aura.ComponentDefRef[]","G",false,[]],
    ["forceServer","aura://Boolean","I",false,false]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "re":[
    {
      "ed":"markup://aura:operationComplete",
      "n":"iterationComplete",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.itemsChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.items"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.rangeChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.start"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.rangeChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.end"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.templateChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.template"
      },
      "n":"change"
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:actionMenuItem", (function (){/*$A.componentService.addComponentClass("markup://ui:actionMenuItem",function() {
return {
  "meta":{
    "name":"ui$actionMenuItem",
    "extends":"markup://ui:menuItem"
  },
  "controller":{
    "init":function(cmp) {
        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;
        if (hasBodyAttribute) {
            cmp.find("anchor").set("v.body", bodyAttribute);
        }
    },
    "onClick":function(cmp, event) {
        if (cmp.isValid()) {
            $A.util.squash(event, true);
            cmp.getConcreteComponent().select();
        }
    }
  },
  "helper":{
    "buildBody":function(cmp) {
        var anchorElement = cmp.find("anchor").getElement();
        var label = cmp.get("v.label");
        var isDisabled = cmp.get("v.disabled");

        var role = cmp.get("v.role");
        if (role) {
            anchorElement.setAttribute("role", role);
        }

        anchorElement.setAttribute("aria-disabled", isDisabled);
        anchorElement.setAttribute("tabindex", isDisabled ? "-1" : "0");
        anchorElement.setAttribute("title", label);

        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;

        if (!hasBodyAttribute) {
            $A.util.clearNode(anchorElement);
            anchorElement.appendChild(document.createTextNode(label));
        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.buildBody(cmp);

        return ret;
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        helper.buildBody(cmp);
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:actionMenuItem",
  "su":"markup://ui:menuItem",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false,"menuitem"],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["selected","aura://Boolean","G",false,false],
    ["type","aura://String","G",false],
    ["label","aura://String","G",false],
    ["hideMenuAfterSelected","aura://Boolean","G",false,true],
    ["disabled","aura://Boolean","G",false,false],
    ["id","aura://String","I",false]
  ],
  "med":[
    {
      "name":"ui:select",
      "xs":"I",
      "action":"{!c.select}"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.setFocus}"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuSelect",
      "n":"menuSelect",
      "xs":"PP"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "ld":{
    "anchor":{
      "description":"Action item button",
      "context":{
        "devNameOrId":{
          "exprType":"PROPERTY",
          "byValue":false,
          "target":"ui:actionMenuItem",
          "path":"v.id"
        }
      },
      "alias":"menu-item",
      "isPrimitive":true
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:actionMenuItem",
                    "path":"v.class"
                  },
                  "role":"presentation"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"li"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"anchor",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:actionMenuItem",
                              "path":"c.onClick"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"a"
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:checkboxMenuItem", (function (){/*$A.componentService.addComponentClass("markup://ui:checkboxMenuItem",function() {
return {
  "meta":{
    "name":"ui$checkboxMenuItem",
    "extends":"markup://ui:menuItem"
  },
  "controller":{
    "init":function(cmp) {
        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;
        if (hasBodyAttribute) {
            cmp.find("anchor").set("v.body", bodyAttribute);
        }
    },
    "onClick":function(cmp, event) {
        if (cmp.isValid()) {
            $A.util.squash(event, true);
            cmp.getConcreteComponent().select();
        }
    },
    "select":function(component) {
        var concreteComponent = component.getConcreteComponent();

        if (concreteComponent.get("v.disabled")) {
            return;
        }

        var current = concreteComponent.get("v.selected");
        concreteComponent.set("v.selected", !current);

        component.getSuper().select();
    }
  },
  "helper":{
    "buildBody":function(cmp) {
        var anchorElement = cmp.find("anchor").getElement();

        var label = cmp.get("v.label");
        var isDisabled = cmp.get("v.disabled");
        var isSelected = cmp.get("v.selected");

        var role = cmp.get("v.role");
        if (role) {
            anchorElement.setAttribute("role", role);
        }

        anchorElement.setAttribute("aria-disabled", isDisabled);
        anchorElement.setAttribute("tabindex", isDisabled ? "-1" : "0");
        anchorElement.setAttribute("title", label);
        anchorElement.setAttribute("aria-checked", isSelected);

        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;

        if (!hasBodyAttribute) {
            $A.util.clearNode(anchorElement);
            anchorElement.appendChild(document.createTextNode(label));
        }

        if (isSelected === true) {
            $A.util.addClass(anchorElement, "selected");
        } else {
            $A.util.removeClass(anchorElement, "selected");
        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.buildBody(cmp);

        return ret;
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        helper.buildBody(cmp);
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:checkboxMenuItem",
  "st":{
    "descriptor":"css://ui.checkboxMenuItem",
    "cl":"uiCheckboxMenuItem"
  },
  "su":"markup://ui:menuItem",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false,"menuitemcheckbox"],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["selected","aura://Boolean","G",false,false],
    ["type","aura://String","G",false],
    ["label","aura://String","G",false],
    ["hideMenuAfterSelected","aura://Boolean","G",false,true],
    ["disabled","aura://Boolean","G",false,false]
  ],
  "med":[
    {
      "name":"ui:select",
      "xs":"I",
      "action":"{!c.select}"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.setFocus}"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuSelect",
      "n":"menuSelect",
      "xs":"PP"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "ld":{
    "anchor":{
      "description":"Select checkBoxMenuItem",
      "context":{
        "body":{
          "exprType":"PROPERTY",
          "byValue":false,
          "target":"ui:checkboxMenuItem",
          "path":"v.body"
        }
      },
      "alias":"select-checkBoxMenuItem"
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:checkboxMenuItem",
                    "path":"v.class"
                  },
                  "role":"presentation"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"li"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"anchor",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:checkboxMenuItem",
                              "path":"c.onClick"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"a"
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:interactive", (function (){/*$A.componentService.addComponentClass("markup://ui:interactive",function() {
return {
  "meta":{
    "name":"ui$interactive",
    "extends":"markup://aura:component"
  },
  "helper":{
    "DATA_UID_KEY":"data-interactive-uid",
    "domEventMap":{

    },
    "interactiveUid":1,
    "addDomEvents":function(component) {
        var events = this.getHandledDOMEvents(component);
        
        var concrete = component.getConcreteComponent();
        var helper = concrete.helper || this;
        for (var event in events) {
            helper.addDomHandler(component, event);
        }
    },
    "addDomHandler":function(component, event) {
        var element = component.getElement();
        if (element === null) {
            $A.warning("Can't add handler to component because didn't have valid html element. Component was " + JSON.stringify(component));
            return ;
        }
        var elementId = this.getUid(element) || this.newUid(element);

        var handler = $A.getCallback(this.domEventHandler);
        $A.util.on(element, event, handler);

        
        
        
        if(!this.domEventMap[elementId]) {
        	this.domEventMap[elementId] = {};
        }

        
        var existing = this.domEventMap[elementId][event];
        if(existing) {
        	
        	$A.util.removeOn(element, event, existing);
        }

        this.domEventMap[elementId][event] = handler;
    },
    "getUid":function(element) {
        return element ? element.getAttribute(this.DATA_UID_KEY) : null;
    },
    "newUid":function(element) {
        var nextUid = ++this.interactiveUid;
        element.setAttribute(this.DATA_UID_KEY, nextUid);
        return nextUid;
    },
    "removeDomEventsFromMap":function(component) {
        var element = component.getElement();
        if (!element) {
            return;
        }

        var elementId = this.getUid(element);

        
        if(elementId && this.domEventMap.hasOwnProperty(elementId)) {
            var eventHandlers = this.domEventMap[elementId];
            for (var event in eventHandlers) {
                var existing = eventHandlers[event];
                if(existing) {
                    $A.util.removeOn(element, event, existing);
                }
            }

            delete this.domEventMap[elementId];
        }
    },
    "domEventHandler":function(event) {
        var element = event.currentTarget || event.target;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);

        
        if (!htmlCmp) {
            return;
        }

        var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
        var helper = component.helper;

        if (!helper || component._recentlyClicked) {
            return;
        }

        
        if (helper.preEventFiring) {
            helper.preEventFiring(component, event);
        }

        
        if (helper.fireEvent) {
            helper.fireEvent(component, event, helper);
        }

        if (event.type === "click" && component.isInstanceOf("ui:doubleClicks") && component.get("v.disableDoubleClicks")) {
        	component._recentlyClicked = true;
        	window.setTimeout(function() { component._recentlyClicked = false; }, 350);
        }
    },
    "fireEvent":function(component, event, helper) {
    	 
    	 
    	 if(component.isValid()) {
	        var e = component.getEvent(event.type);
	        helper.setEventParams(e, event);
	        e.setComponentEvent();
	        e.fire();
    	 }
     },
    "getDomEvents":function(component) {
        return component.getDef().getAllEvents();
    },
    "getHandledDOMEvents":function(component) {
        var ret = {};
        var handledEvents = component.getHandledEvents();
        var domEvents = this.getDomEvents(component);

        if(domEvents){
            for(var i=0,len=domEvents.length; i<len; i++){
                var eventName = domEvents[i].toLowerCase();
                if (handledEvents[eventName]) {
                    ret[eventName] = true;
                }
            }
        }
        return ret;
    },
    "preEventFiring":function() {
    },
    "setEventParams":function(e, DOMEvent) {
        
        var attributeDefs = e.getDef().getAttributeDefs().getNames();
        var attribute;
        var params = {};
        for (var c=0,length=attributeDefs.length;c<length;c++) {
            attribute = attributeDefs[c];
            if (attribute === "domEvent") {
                params[attribute] = DOMEvent;
            } else if (attribute === "keyCode") { 
                params[attribute] = DOMEvent.which || DOMEvent.keyCode;
            } else {
                params[attribute] = DOMEvent[attribute];
            }
        }
        e.setParams(params);
    },
    "setDisabled":function(component, disabled, disabledCss) {
        component.set('v.disabled', disabled);
        if (disabledCss) {
            if(disabled){
                $A.util.addClass(component.getElement(),disabledCss);
            }else{
                $A.util.removeClass(component.getElement(), disabledCss);
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.addDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.addDomEvents(component);
        return component.superRerender();
    },
    "unrender":function(component, helper) {
    	helper.removeDomEventsFromMap(component);
        return component.superUnrender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:interactive",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["disabled","aura://Boolean","G",false,false]
  ],
  "i":[
    "markup://ui:visible",
    "markup://ui:doubleClicks"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:interactive",
                  "path":"v.body"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "ab":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menuItemSeparator", (function (){/*$A.componentService.addComponentClass("markup://ui:menuItemSeparator",function() {
return {
  "meta":{
    "name":"ui$menuItemSeparator",
    "extends":"markup://aura:component"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menuItemSeparator",
  "st":{
    "descriptor":"css://ui.menuItemSeparator",
    "cl":"uiMenuItemSeparator"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["label","aura://String","I",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:menuItemSeparator",
                    "path":"v.class"
                  },
                  "role":"separator"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"li"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:radioMenuItem", (function (){/*$A.componentService.addComponentClass("markup://ui:radioMenuItem",function() {
return {
  "meta":{
    "name":"ui$radioMenuItem",
    "extends":"markup://ui:menuItem"
  },
  "controller":{
    "init":function(cmp) {
        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;
        if (hasBodyAttribute) {
            cmp.find("anchor").set("v.body", bodyAttribute);
        }
    },
    "onClick":function(cmp, event) {
        if (cmp.isValid()) {
            $A.util.squash(event, true);
            cmp.getConcreteComponent().select();
        }
    },
    "select":function(component, event, helper) {
        var concreteComponent = component.getConcreteComponent();

        if (concreteComponent.get("v.disabled")) {
            return;
        }

        var current = concreteComponent.get("v.selected");
        if (current === false) {
            concreteComponent.set("v.selected", true);
        }

        helper.fireSelectEvent(concreteComponent, event, {
            "deselectSiblings": true
        });
    }
  },
  "helper":{
    "buildBody":function(cmp) {
        var anchorElement = cmp.find("anchor").getElement();

        var label = cmp.get("v.label");
        var isDisabled = cmp.get("v.disabled");
        var isSelected = cmp.get("v.selected");

        var role = cmp.get("v.role");
        if (role) {
            anchorElement.setAttribute("role", role);
        }

        anchorElement.setAttribute("aria-disabled", isDisabled);
        anchorElement.setAttribute("tabindex", isDisabled ? "-1" : "0");
        anchorElement.setAttribute("title", label);
        anchorElement.setAttribute("aria-checked", isSelected);

        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;

        if (!hasBodyAttribute) {
            $A.util.clearNode(anchorElement);

            
            
            anchorElement.appendChild(document.createElement("b"));

            anchorElement.appendChild(document.createTextNode(label));
        }

        if (isSelected === true) {
            $A.util.addClass(anchorElement, "selected");
        } else {
            $A.util.removeClass(anchorElement, "selected");
        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.buildBody(cmp);

        return ret;
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        helper.buildBody(cmp);
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:radioMenuItem",
  "st":{
    "descriptor":"css://ui.radioMenuItem",
    "cl":"uiRadioMenuItem"
  },
  "su":"markup://ui:menuItem",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false,"menuitemradio"],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["selected","aura://Boolean","G",false,false],
    ["type","aura://String","G",false],
    ["label","aura://String","G",false],
    ["hideMenuAfterSelected","aura://Boolean","G",false,false],
    ["disabled","aura://Boolean","G",false,false]
  ],
  "med":[
    {
      "name":"ui:select",
      "xs":"I",
      "action":"{!c.select}"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.setFocus}"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuSelect",
      "n":"menuSelect",
      "xs":"PP"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "ld":{
    "anchor":{
      "description":"Radio menu item action",
      "context":{
        "body":{
          "exprType":"PROPERTY",
          "byValue":false,
          "target":"ui:radioMenuItem",
          "path":"v.body"
        }
      },
      "alias":"select-radioMenuItem"
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"listitem",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:radioMenuItem",
                    "path":"v.class"
                  },
                  "role":"presentation"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"li"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"anchor",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:radioMenuItem",
                              "path":"c.onClick"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"a"
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputDefaultError", (function (){/*$A.componentService.addComponentClass("markup://ui:inputDefaultError",function() {
return {
  "meta":{
    "name":"ui$inputDefaultError",
    "extends":"markup://aura:component"
  },
  "controller":{
    "doInit":function(component) {
        var domId = component.get('v.domId');

		if (!domId) {
            var globalId = component.getGlobalId();
			component.set("v.domId", globalId);
		}
	}
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputDefaultError",
  "st":{
    "descriptor":"css://ui.inputDefaultError",
    "cl":"uiInputDefaultError"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String[]","G",false,[]],
    ["visible","aura://Boolean","I",false,true],
    ["errors","aura://Object[]","PP",false,[]],
    ["domId","aura://String","I",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:if"
          },
          "attributes":{
            "values":{
              "isTrue":{
                "descriptor":"isTrue",
                "value":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return (!(fn.empty(cmp.get(\"v.value\")))||!(fn.empty(cmp.get(\"v.errors\")))); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:inputDefaultError",
                      "path":"v.errors"
                    },
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:inputDefaultError",
                      "path":"v.value"
                    }
                  ],
                  "byValue":false
                }
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" has-error\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:inputDefaultError",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            },
                            "id":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDefaultError",
                              "path":"v.domId"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"ul"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:iteration"
                              },
                              "attributes":{
                                "values":{
                                  "var":{
                                    "descriptor":"var",
                                    "value":"message"
                                  },
                                  "items":{
                                    "descriptor":"items",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDefaultError",
                                      "path":"v.value"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"form-element__help"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"li"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:inputDefaultError",
                                                          "path":"message"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:iteration"
                              },
                              "attributes":{
                                "values":{
                                  "var":{
                                    "descriptor":"var",
                                    "value":"error"
                                  },
                                  "items":{
                                    "descriptor":"items",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDefaultError",
                                      "path":"v.errors"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"form-element__help"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"li"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:inputDefaultError",
                                                          "path":"error.message"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:label", (function (){/*$A.componentService.addComponentClass("markup://ui:label",function() {
return {
  "meta":{
    "name":"ui$label",
    "extends":"markup://aura:component"
  },
  "helper":{
    "updateAttribute":function(cmp) {

        var forVal = cmp.get("v.for");
        if (forVal) {
        	var gId;
        	if ($A.util.isString(forVal)) {
                var valueProvider = cmp.getAttributeValueProvider();
                

 				
				var refCmp = valueProvider.find && valueProvider.find(forVal);

                if (refCmp) {
                	
                	refCmp = refCmp.length ? refCmp[0] : refCmp;
                	gId = refCmp.getGlobalId();
                } else {
                	
                	gId = $A.componentService.get(forVal) ? forVal : null;
                }
        	} else if ($A.util.isObject(forVal) && forVal.getGlobalId) {
        		gId = forVal.getGlobalId();
        	}

        	if (!$A.util.isEmpty(gId)) {
        		
                var elm = cmp.getElement();
                if (elm) {
                    elm.setAttribute("for", gId);
                }
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {     
    	component.superAfterRender();
    	
    	
    	helper.updateAttribute(component);    	
    }
  }
};
});
return {
  "xs":"PP",
  "descriptor":"markup://ui:label",
  "st":{
    "descriptor":"css://ui.label",
    "cl":"uiLabel"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["label","aura://String","PP",false],
    ["title","aura://String","I",false],
    ["class","aura://String","PP",false],
    ["labelDisplay","aura://Boolean","I",false,true],
    ["for","aura://Object","PP",false,null],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[]]
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"labelElement",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.join(\" \",cmp.get(\"v.class\"),fn.token(\"uiLabel.label\"),(cmp.get(\"v.labelDisplay\")?null:fn.token(\"uiLabel.assistive\"))); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:label",
                        "path":"v.class"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:label",
                        "path":"v.labelDisplay"
                      }
                    ],
                    "byValue":false
                  },
                  "for":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:label",
                    "path":"v.for"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"label"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return (cmp.get(\"v.labelDisplay\")?null:\"assistiveText\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:label",
                                  "path":"v.labelDisplay"
                                }
                              ],
                              "byValue":false
                            },
                            "title":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:label",
                              "path":"v.title"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"span"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:label",
                                      "path":"v.label"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:label",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:label",
                            "path":"v.requiredIndicator"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:legend", (function (){/*$A.componentService.addComponentClass("markup://ui:legend",function() {
return {
  "meta":{
    "name":"ui$legend",
    "extends":"markup://aura:component"
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:legend",
  "st":{
    "descriptor":"css://ui.legend",
    "cl":"uiLegend"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["legend","aura://String","I",false],
    ["title","aura://String","I",false],
    ["class","aura://String","I",false],
    ["labelDisplay","aura://Boolean","I",false,true],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[]]
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"legendElement",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:legend",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"legend"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return (cmp.get(\"v.labelDisplay\")?null:\"assistiveText\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:legend",
                                  "path":"v.labelDisplay"
                                }
                              ],
                              "byValue":false
                            },
                            "title":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:legend",
                              "path":"v.title"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"span"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:legend",
                                      "path":"v.legend"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:legend",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:legend",
                            "path":"v.requiredIndicator"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menuItem", (function (){/*$A.componentService.addComponentClass("markup://ui:menuItem",function() {
return {
  "meta":{
    "name":"ui$menuItem",
    "extends":"markup://aura:component"
  },
  "controller":{
    "setFocus":function(component, event, helper) {
        helper.focus(component);
    },
    "select":function(component, event, helper) {
        helper.fireSelectEvent(component, event);
    }
  },
  "helper":{
    "typeMap":{
      "action":"markup://ui:actionMenuItem",
      "checkbox":"markup://ui:checkboxMenuItem",
      "radio":"markup://ui:radioMenuItem",
      "separator":"markup://ui:menuItemSeparator"
    },
    "addMenuItemDomEvents":function(component) {
        var events = ["click", "keydown", "mouseover"];
        if (!component._menuItemDomEventsInstalled) {
            for (var i = 0, len = events.length; i < len; i++) {
                $A.util.on(component.getElement(), events[i], this.domEventHandler.bind(this, component));
            }
            component._menuItemDomEventsInstalled = true;
        }
    },
    "domEventHandler":function(component, event) {
        if (!component.isValid() || this.isDisabled(component)) {
            return false;
        }

        var concreteComponent = component.getConcreteComponent();
        if (event.type === "mouseover") {
            concreteComponent.setFocus();
        } else if (event.type === "keydown") {
            if (event.keyCode === 32 || event.keyCode === 13) {  
                event.preventDefault();
                concreteComponent.select();
            }
        } else if (event.type === "click") {
            event.preventDefault();
        }

        return false;
    },
    "isDisabled":function(component) {
        return component.get("v.disabled") === true;
    },
    "fireSelectEvent":function(component, event, options) {
        if (!component.isValid() || this.isDisabled(component)) {
            return;
        }

        
        component.getEvent("click").fire();

        options = options || {};

        var menuSelectEvent = component.getEvent("menuSelect");
        if (menuSelectEvent) {
            var hideMenu = options.hideMenu;
            if ($A.util.isUndefinedOrNull(hideMenu)) {
                hideMenu = component.get("v.hideMenuAfterSelected");
            }

            var focusTrigger = options.focusTrigger;
            if ($A.util.isUndefinedOrNull(focusTrigger)) {
                focusTrigger = hideMenu;
            }

            menuSelectEvent.setParams({
                selectedItem: component,
                "hideMenu": hideMenu,
                "deselectSiblings": options.deselectSiblings,
                "focusTrigger": focusTrigger
            });
            menuSelectEvent.fire();
        }

    },
    "focus":function(component) {
        var element = component.getElement();

        if (element) {
            var anchors = element.getElementsByTagName("a");
            if (anchors && anchors.length > 0) {
                var anchor = anchors[0];
                if (anchor && anchor.focus) {
                    anchor.focus();
                }
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.addMenuItemDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.addMenuItemDomEvents(component);
        component.superRerender();
    },
    "unrender":function(component) {
        delete component._menuItemDomEventsInstalled;

        component.superUnrender();
    }
  },
  "provider":{
    "provide":function(component) {
        var helper = component.helper;
        var type = component.get("v.type")||'';
        if ($A.util.isEmpty(type)) {
            return helper.typeMap["action"];
        } else {
            var menuItemDef = helper.typeMap[type];
            if ($A.util.isUndefinedOrNull(menuItemDef)) {
                return type;
            } else {
                return menuItemDef;
            }
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menuItem",
  "st":{
    "descriptor":"css://ui.menuItem",
    "cl":"uiMenuItem"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false,"menuitem"],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["selected","aura://Boolean","G",false,false],
    ["type","aura://String","G",false],
    ["label","aura://String","G",false],
    ["hideMenuAfterSelected","aura://Boolean","G",false,true],
    ["disabled","aura://Boolean","G",false,false]
  ],
  "med":[
    {
      "name":"ui:select",
      "xs":"I",
      "action":"{!c.select}"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.setFocus}"
    }
  ],
  "i":[
    "markup://ui:uiEvents",
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuSelect",
      "n":"menuSelect",
      "xs":"PP"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:menuItem",
                  "path":"v.body"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "ab":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:picklistLabel", (function (){/*$A.componentService.addComponentClass("markup://ui:picklistLabel",function() {
return {
  "meta":{
    "name":"ui$picklistLabel",
    "extends":"markup://aura:component"
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:picklistLabel",
  "st":{
    "descriptor":"css://ui.picklistLabel",
    "cl":"uiPicklistLabel"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["domId","aura://String","I",false],
    ["label","aura://String","I",false],
    ["title","aura://String","I",false],
    ["class","aura://String","I",false],
    ["labelDisplay","aura://Boolean","I",false,true],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[]]
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"spanElement",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:picklistLabel",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return (cmp.get(\"v.labelDisplay\")?null:\"assistiveText\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:picklistLabel",
                                  "path":"v.labelDisplay"
                                }
                              ],
                              "byValue":false
                            },
                            "id":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:picklistLabel",
                              "path":"v.domId"
                            },
                            "title":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:picklistLabel",
                              "path":"v.title"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"span"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:picklistLabel",
                                      "path":"v.label"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:picklistLabel",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:picklistLabel",
                            "path":"v.requiredIndicator"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:popup", (function (){/*$A.componentService.addComponentClass("markup://ui:popup",function() {
return {
  "meta":{
    "name":"ui$popup",
    "extends":"markup://aura:component"
  },
  "controller":{
    "doInit":function(component, event, helper) {
        helper = component.getConcreteComponent().getDef().getHelper();
        helper.setEventHandlersOnChildren(component, event);
    },
    "onTriggerPress":function(component, event, helper) {
        
        helper = component.getConcreteComponent().helper;
        helper.handleTriggerPress(component, event);
    },
    "onTargetShow":function(component, event, helper) {
        helper = component.getConcreteComponent().getDef().getHelper();
        helper.handleTargetShow(component, event);
    },
    "onTargetHide":function(component, event, helper) {
        helper = component.getConcreteComponent().getDef().getHelper();
        helper.handleTargetHide(component, event);
    },
    "onKeyboardEvent":function(component, event, helper) {
        helper = component.getConcreteComponent().getDef().getHelper();
        helper.handleKeyboardEvent(component, event);
    },
    "onRefresh":function(component, event, helper) {
        helper = component.getConcreteComponent().getDef().getHelper();
        helper.handleRefresh(component, event);
    }
  },
  "helper":{
    "getTargetComponent":function(component) {
        return this.getComponent(component, "ui:popupTarget");
    },
    "getTriggerComponent":function(component) {
        return this.getComponent(component, "ui:popupTrigger");
    },
    "getComponent":function(component, componentName) {
        var body = component.getConcreteComponent().get("v.body"),
            child;

        if (!$A.util.isUndefinedOrNull(componentName)) {
            for (var i = 0; i < body.length; i++) {
                child = body[i];

                if (child.isInstanceOf('ui:scroller')) {
                    return this.getComponent(child, componentName);
                } else if (child.isInstanceOf(componentName)) {
                    return child;
                }
            }
        }
    },
    "handleTriggerPress":function(component) {
        var target = this.getTargetComponent(component);
        if (target && target.isValid()) {
            this.setTargetVisibility(component, !target.get("v.visible"));
        }
    },
    "handleTargetShow":function(component, event) {
        var originalEvent = event.getParam("event");
        if (originalEvent && originalEvent.type === "keydown") {
            this.delegateEventToTarget(component, originalEvent, 'e.keydown');
        }

        this.setTargetVisibility(component, true);
    },
    "handleTargetHide":function(component, event) {
        var originalEvent = event.getParam("event");
        var escapeKeyPressed = originalEvent && originalEvent.type === "keydown" && originalEvent.keyCode === 27;
        if (escapeKeyPressed && this.getTargetComponent(component).get("v.visible")) {
            
            
            $A.util.squash(originalEvent, true);
        }
        this.setTargetVisibility(component, false);
    },
    "handleKeyboardEvent":function(component, event) {
        this.delegateEventToTarget(component, event.getParam("event"), 'e.popupKeyboardEvent');
    },
    "setTargetVisibility":function(component, visible) {
        var target = this.getTargetComponent(component);

        target.set("v.visible", visible);
    },
    "delegateEventToTarget":function(component, event, eventName) {
        var target = this.getTargetComponent(component),
            targetEvent = target.get(eventName);

        if (targetEvent) {
            targetEvent.setParams({
                event: event
            });
            targetEvent.fire();
        }
    },
    "setEventHandlersOnChildren":function(component) {
        var body = component.getConcreteComponent().get("v.body"),
            child;

        for (var i = 0, l = body.length; i < l; i++) {
            child = body[i];
            if (child.isInstanceOf("ui:popupTrigger")) {
                this.setTriggerEventHandlers(component, child);
            }

            if (child.isInstanceOf("ui:popupTarget")) {
                this.setTargetEventHandlers(component, child);
            }
        }
    },
    "setTriggerEventHandlers":function(component, childComponent) {
        childComponent.addHandler("popupTriggerPress", component, "c.onTriggerPress");
        childComponent.addHandler("popupTargetShow", component, "c.onTargetShow");
        childComponent.addHandler("popupTargetHide", component, "c.onTargetHide");
        childComponent.addHandler("popupKeyboardEvent", component, "c.onKeyboardEvent");
    },
    "setTargetEventHandlers":function(component, targetComponent) {
        this.addCloseHandler(component, targetComponent);
    },
    "addCloseHandler":function(component, childComponent) {
        childComponent.addHandler("doClose", component, "c.onTargetHide");
    },
    "handleRefresh":function(component) {
        this.setEventHandlersOnChildren(component);
    },
    "findElement":function(component, localId) {
        var cmp = component.getConcreteComponent();
        var retCmp = null;
        while (cmp) {
            retCmp = cmp.find(localId);
            if (retCmp) {
                break;
            }
            cmp = cmp.getSuper();
        }
        var elem = retCmp ? retCmp.getElement() : null;

        return elem;
    }
  },
  "renderer":{
    "afterRender":function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        var target = _helper.getTargetComponent(component);
    	var trigger = _helper.getTriggerComponent(component);

    	if (target && trigger) {
            var targetElement = _helper.findElement(trigger, "popupTriggerElement");
            if (targetElement) {
                target.set("v.referenceElement", targetElement);
            }
    	}

    	component.superAfterRender();
    }
  }
};
});
return {
  "xs":"PP",
  "descriptor":"markup://ui:popup",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetShow",
      "n":"popupTargetShow",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetHide",
      "n":"popupTargetHide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:refresh",
      "n":"refresh",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTriggerPress",
      "n":"popupTriggerPress",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onTriggerPress"
      },
      "n":"popupTriggerPress"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onTargetShow"
      },
      "n":"popupTargetShow"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onTargetHide"
      },
      "n":"popupTargetHide"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onKeyboardEvent"
      },
      "n":"popupKeyboardEvent"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onRefresh"
      },
      "n":"refresh"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"app",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:popup",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:popup",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:popupTarget", (function (){/*$A.componentService.addComponentClass("markup://ui:popupTarget",function() {
return {
  "meta":{
    "name":"ui$popupTarget",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:panelPositioningLib"
    }
  },
  "controller":{
    "handleVisibilityChange":function(component, event, helper) {
        if (component.get("v.visible")) {
            var popupTarget = component.find("popupTarget");
            if (popupTarget.isRendered()) {
                helper.position(component);
            }
        } else {
            helper.unposition(component);
        }
    },
    "handleKeyboardEvent":function(component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
        _helper.handleKeyboardEvent(component.getConcreteComponent(), event);
    }
  },
  "helper":{
    "getElementCache":function(component) {
        var o;

        if (!component._localElementCache) {
            o = {};
            o.target = component.getConcreteComponent(); 
            o.targetElement = o.target.getElement(); 

            if (component.find("popupTarget")) { 
                o.targetDiv = component.find("popupTarget").getElement(); 
            }

            o.triggerElement = component.getConcreteComponent().get("v.referenceElement");
            if (o.triggerElement) {
                o.trigger = this.getTriggerComponent(o.triggerElement);
            }
            component._localElementCache = o;
        }

        return component._localElementCache;
    },
    "getTransitionEndEventName":function(component) {
        var el,
            names;

        if (!component._transitionEndEventName) {
            el = document.createElement('div');
            names = {
                'transition': 'transitionend',
                'OTransition': 'otransitionend',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

            for (var i in names) {
                if (names.hasOwnProperty(i) && typeof el.style[i] !== 'undefined') {
                    component._transitionEndEventName = names[i];
                }
            }
        }

        return component._transitionEndEventName;
    },
    "getTriggerComponent":function(element) {
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var component = htmlCmp ? htmlCmp.getComponentValueProvider().getConcreteComponent() : null;
        while (component && !component.isInstanceOf("ui:popupTrigger")) {
            component = component.getComponentValueProvider().getConcreteComponent();
        }
        return component;
    },
    "position":function(component) {
        var attachToBody = component.get("v.attachToBody");

        if (attachToBody === true) {
            return this.positionAsBodyChild(component);
        } else {
            var element = component.find("popupTarget").getElement();
            element.classList.remove("positioned");
            window.requestAnimationFrame($A.getCallback(function () {
                if (!component.isValid()) {
                    return;
                }
                if (!component.get("v.manualPosition")) {
                    var elemRect = element.getBoundingClientRect();
                    var viewPort = $A.util.getWindowSize();

                    if (component.get("v.autoPosition") && elemRect.bottom > viewPort.height && elemRect.height) {
                        
                        
                        
                        

                        element.style.top = 0 - elemRect.height + "px";
                    }
                }
                element.classList.add("positioned");
            }));
        }
    },
    "_getScrollableParent":function(elem) {
        if (this._scrollableParent) {
            return this._scrollableParent;
        }

        
        
        var overflow = getComputedStyle(elem)['overflow-y'];

        if (overflow === 'auto') {
            this._scrollableParent = elem;
            return elem;
        }

        if (elem === document.body) {
            this._scrollableParent = null;
            return null;
        }

        return this._getScrollableParent(elem.parentNode);

    },
    "positionAsBodyChild":function(component) {
        var element = component.find("popupTarget").getElement();
        var target = component.get("v.referenceElement");
        if (target && element) {
            var manualPosition = component.get("v.manualPosition");

            $A.util.attachToDocumentBody(component.getElement());

            if (manualPosition) {
                element.classList.add("positioned");
            } else {
                element.classList.remove("positioned");
                
                
                window.requestAnimationFrame($A.getCallback(function () {
                    if (!component.isValid()) {
                        return;
                    }
                    element.style.opacity = 0;
                    var viewPort = $A.util.getWindowSize();
                    var elemRect = element.getBoundingClientRect();
                    var referenceElemRect = target.getBoundingClientRect();
                    var horizontalCornerAlignment = this.rightCornerFitsInViewport(viewPort, elemRect, referenceElemRect) ? "left" : "right";
                    var verticalCornerAlignment;
                    if (this.topCornerFitsInViewport(elemRect, referenceElemRect)) {
                        verticalCornerAlignment = this.bottomCornerFitsInViewport(viewPort, elemRect, referenceElemRect) ? "top" : "bottom";
                    } else {
                        verticalCornerAlignment = "top";
                    }
                    component._constraint = this.lib.panelPositioning.createRelationship({
                        element: element,
                        target: target,
                        scrollableParentBound: true,
                        align: horizontalCornerAlignment + " " + verticalCornerAlignment,
                        targetAlign: horizontalCornerAlignment + " " + (verticalCornerAlignment === "top" ? "bottom" : "top"),
                        padTop: 2
                    });
                    
                    
                    
                    
                    setTimeout($A.getCallback(function () {
                        this.lib.panelPositioning.reposition(function () {
                            element.classList.add("positioned");
                            element.style.opacity = 1;
                        });
                    }).bind(this),50);
                    
                }.bind(this)));
            }
        }
    },
    "unposition":function(component) {
        var element = component.find("popupTarget").getElement();
        element.classList.remove("positioned");
        if (component._constraint) {
            component._constraint.destroy();
            component._constraint = undefined;
        }
    },
    "rightCornerFitsInViewport":function(viewPort, elemRect, referenceElemRect) {
        return (viewPort.width - referenceElemRect.left) > elemRect.width;

    },
    "bottomCornerFitsInViewport":function(viewPort, elemRect, referenceElemRect) {
        return (viewPort.height - referenceElemRect.bottom) > elemRect.height;

    },
    "topCornerFitsInViewport":function(elemRect, referenceElemRect) {
        return (referenceElemRect.top > elemRect.height);
    },
    "setAriaAttributes":function(component) {
        var elements = this.getElementCache(component);

        if (elements.triggerElement && elements.target) {
            elements.targetElement.setAttribute("aria-labelledby", elements.trigger.getGlobalId());
        }
    },
    "onVisibleChange":function(component) {
        var elements = this.getElementCache(component),
            visible = elements.target.get("v.visible"),
            transitionEndEventName = this.getTransitionEndEventName(component),
            hideFunc;

        if (elements.target.get('v.closeOnClickOutside') || elements.target.get('v.closeOnClickInside')) {
            if (visible === true) {
                this.addDismissEvents(component);
            } else {
                this.removeDismissEvents(component);
            }
        }

        
        
        hideFunc = function () {
            $A.util.addClass(elements.targetElement, component.get('v.preTransitionClass'));
            $A.util.removeOn(elements.targetElement, transitionEndEventName, hideFunc);
        };

        
        
        
        setTimeout(function () {
            if (!elements.target.isValid()) {
                return;
            }
            if (visible === true) {
                $A.util.removeClass(elements.targetElement, component.get('v.preTransitionClass'));
                $A.util.addClass(elements.targetElement, "visible");
                elements.target.get("e.popupExpand").fire();
            } else {
                $A.util.on(elements.targetElement, transitionEndEventName, hideFunc, false);
                $A.util.removeClass(elements.targetElement, "visible");
                elements.target.get("e.popupCollapse").fire();
            }
        }, 0);
    },
    "getOnClickEventProp":function(prop) {
        var cached;

        
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        
        cached = this.getOnClickEventProp.cache[prop];

        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        
        this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
        this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";

        return this.getOnClickEventProp.cache[prop];
    },
    "getOnClickStartFunction":function(component) {
        var func;

        if ($A.util.isUndefined(component._onClickStartFunc)) {
            func = function (event) {
                component._onStartX = event.clientX;
                component._onStartY = event.clientY;
            };

            component._onClickStartFunc = func;
        }

        return component._onClickStartFunc;
    },
    "getOnClickEndFunction":function(component) {
        var helper,
            func;

        if ($A.util.isUndefined(component._onClickEndFunc)) {
            helper = this;
            func = function (event) {
                
                var elements = helper.getElementCache(component),
                    doIf = {
                        clickIsInsideTarget: helper.isElementInComponent(elements.target, event.target),
                        clickIsInsideTrigger: helper.isElementInComponent(elements.trigger, event.target),
                        closeOnClickInside: component.get('v.closeOnClickInside'),
                        closeOnClickOutside: component.get('v.closeOnClickOutside'),
                        clickIsInCurtain: $A.util.hasClass(event.target, 'popupCurtain')
                    };

                if (
                    (doIf.clickIsInsideTarget && doIf.closeOnClickInside) 
                    || (!doIf.clickIsInsideTarget && doIf.closeOnClickOutside && !doIf.clickIsInsideTrigger) 
                    || doIf.clickIsInCurtain 
                ) {
                    component.getConcreteComponent().get("e.doClose").fire();
                }
            };

            component._onClickEndFunc = func;
        }

        return component._onClickEndFunc;
    },
    "getWindowBlurHandler":function(component) {
        if ($A.util.isUndefined(component._windowBlurHandlerFunc)) {
            var elements = this.getElementCache(component);

            component._windowBlurHandlerFunc = function () {
                elements.target.set("v.visible", !elements.target.get("v.visible"));
            };
        }

        return component._windowBlurHandlerFunc;
    },
    "getWindowResizeHandler":function(component) {
        if ($A.util.isUndefined(component._windowResizeHandlerFunc)) {
            component._windowResizeHandlerFunc = function () {
                component.getDef().getHelper().position(component);
            };
        }

        return component._windowResizeHandlerFunc;
    },
    "isElementInComponent":function(component, targetElem) {
        var currentNode = targetElem,
            componentElements;

        if (!component || !targetElem) {
            return false;
        }

        componentElements = component.getElements();

        
        
        
        do {
            for (var i = 0, l = componentElements.length; i < l; i++) {
                if (componentElements[i] === currentNode) {
                    return true;
                }
            }

            
            currentNode = currentNode.parentNode;
        } while (currentNode);

        return false;
    },
    "addDismissEvents":function(component) {
        $A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
        $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
        
        $A.util.on(window, "blur", this.getWindowBlurHandler(component));
        
        if (this.getElementCache(component).target.get("v.attachToBody")) {
            $A.util.on(window, "resize", this.getWindowResizeHandler(component));
        }
    },
    "removeDismissEvents":function(component) {
        $A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
        $A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
        $A.util.removeOn(window, "blur", this.getWindowBlurHandler(component));
        $A.util.removeOn(window, "resize", this.getWindowResizeHandler(component));
    },
    "handleKeyboardEvent":function() {
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.setAriaAttributes(component);

        if (component.get("v.visible")) {
            helper.position(component);
        }

        component.superAfterRender();
    },
    "rerender":function(component, helper) {
        var ret = component.superRerender();

        helper.onVisibleChange(component);
        helper.setAriaAttributes(component);

        return ret;
    },
    "unrender":function(component, helper) {
    	if (component._localElementCache) {
    		
    		
    		component._localElementCache = undefined;
    	}
    	helper.unposition(component);
        helper.removeDismissEvents(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"PP",
  "descriptor":"markup://ui:popupTarget",
  "st":{
    "descriptor":"css://ui.popupTarget",
    "cl":"uiPopupTarget"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,false],
    ["closeOnTabKey","aura://Boolean","G",false,true],
    ["autoPosition","aura://Boolean","G",false,true],
    ["curtain","aura://Boolean","G",false,false],
    ["closeOnClickOutside","aura://Boolean","G",false,true],
    ["attachToBody","aura://Boolean","PP",false,false],
    ["manualPosition","aura://Boolean","I",false,false],
    ["smartAttachToBody","aura://Boolean","I",false,false],
    ["referenceElement","aura://Object","I",false,null],
    ["closeOnClickInside","aura://Boolean","I",false,false],
    ["preTransitionClass","aura://String","I",false,""],
    ["showNubbin","aura://Boolean","I",false,false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:collapse",
      "n":"doClose",
      "xs":"I"
    },
    {
      "ed":"markup://ui:expand",
      "n":"popupExpand",
      "xs":"I"
    },
    {
      "ed":"markup://ui:collapse",
      "n":"popupCollapse",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleKeyboardEvent"
      },
      "n":"popupKeyboardEvent"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleVisibilityChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.visible"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:if"
          },
          "attributes":{
            "values":{
              "isTrue":{
                "descriptor":"isTrue",
                "value":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return (cmp.get(\"v.attachToBody\")&&cmp.get(\"v.curtain\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:popupTarget",
                      "path":"v.attachToBody"
                    },
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:popupTarget",
                      "path":"v.curtain"
                    }
                  ],
                  "byValue":false
                }
              },
              "else":{
                "descriptor":"else",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"popupTarget",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(fn.add(fn.add(cmp.get(\"v.class\"),\" popupTargetContainer \"),cmp.get(\"v.preTransitionClass\")),(fn.eq(cmp.get(\"v.showNubbin\"),true)?\" menu--nubbin-top\":\"\")); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:popupTarget",
                                  "path":"v.preTransitionClass"
                                },
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:popupTarget",
                                  "path":"v.class"
                                },
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:popupTarget",
                                  "path":"v.showNubbin"
                                }
                              ],
                              "byValue":false
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:popupTarget",
                                      "path":"v.body"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.class\"),\" popupCurtain \"),cmp.get(\"v.preTransitionClass\")); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:popupTarget",
                                  "path":"v.preTransitionClass"
                                },
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:popupTarget",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"popupTarget",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"popupTargetContainer"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:popupTarget",
                                                "path":"v.body"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:popupTrigger", (function (){/*$A.componentService.addComponentClass("markup://ui:popupTrigger",function() {
return {
  "meta":{
    "name":"ui$popupTrigger",
    "extends":"markup://ui:interactive"
  },
  "controller":{
    "focus":function(component) {
    	var concreteCmp = component.getConcreteComponent();
        
        var _helper = concreteCmp.helper;
        _helper.focus(concreteCmp);
    },
    "onClick":function(component, event) {
        var concreteCmp = component.getConcreteComponent();
        
        var _helper = concreteCmp.helper;
        if ($A.util.getBooleanValue(concreteCmp.get("v.stopClickPropagation"))) {
            $A.util.squash(event.getParam("domEvent"), true);
        }
        _helper.handleClick(component, event);
    },
    "triggerInteraction":function(cmp) {
         cmp.get('c.onClick').run();
    },
    "onPopupToggle":function(component, event, helper) {
    	helper.handlePopupToggle(component, event);
    }
  },
  "helper":{
    "addTriggerDomEvents":function(component) {
        var events = ["click", "keydown"];
        for (var i=0, len=events.length; i < len; i++) {
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }           
        }
    },
    "preEventFiring":function(component, event) {
        if (event.type === "keydown") {
            if (event.keyCode === 32) { 
                $A.util.squash(event, true);
                this.firePopupEvent(component, "e.popupTriggerPress");
            } else if (event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 37 || event.keyCode === 38) { 
                $A.util.squash(event, true);
                this.firePopupEvent(component, "e.popupTargetShow", {
                    event : event
                }); 
            } else if (event.keyCode === 9 || event.keyCode === 27) { 
                this.firePopupEvent(component, "e.popupTargetHide", {
                    event: event
                });
            }
            
            this.firePopupEvent(component, "e.popupKeyboardEvent", {
                event : event
            });
        }
    },
    "handleClick":function(component) {
        this.handleTriggerPress(component);
    },
    "handleTriggerPress":function(component) {
        this.firePopupEvent(component, "e.popupTriggerPress");
    },
    "showTarget":function(component) {
        this.firePopupEvent(component, "e.popupTargetShow");
    },
    "hideTarget":function(component) {
        this.firePopupEvent(component, "e.popupTargetHide");
    },
    "handlePopupToggle":function(component, event) {
        var triggerParams = event.getParams(),
            localTriggerDiv = component.find('popupTriggerElement').getElement(),
            eventTriggerDiv = triggerParams.component.getElement();
        
        if (localTriggerDiv == null) {
            return;
        }
        if ($A.util.contains(localTriggerDiv, eventTriggerDiv)) {
            if (triggerParams.show) {
                this.showTarget(component);
            } else {
                this.hideTarget(component);
            }
        }
    },
    "firePopupEvent":function(component, eventName, params) {
        if (component.get("v.disabled")) {
            return;
        }

        var event = component.getConcreteComponent().get(eventName);
        if (params) {
            event.setParams(params);
        }
        event.fire();
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.addTriggerDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.addTriggerDomEvents(component);
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"PP",
  "descriptor":"markup://ui:popupTrigger",
  "st":{
    "descriptor":"css://ui.popupTrigger",
    "cl":"uiPopupTrigger"
  },
  "su":"markup://ui:interactive",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["disabled","aura://Boolean","G",false,false],
    ["label","aura://String","G",false],
    ["title","aura://String","G",false,""],
    ["trigger","aura://Aura.Component[]","I",false,[]],
    ["stopClickPropagation","aura://Boolean","I",false,false]
  ],
  "med":[
    {
      "name":"ui:triggerInteraction",
      "xs":"I"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetShow",
      "n":"popupTargetShow",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetHide",
      "n":"popupTargetHide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTriggerPress",
      "n":"popupTriggerPress",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "ed":{
        "descriptor":"markup://ui:popupTargetToggle"
      },
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onPopupToggle"
      }
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"popupTrigger",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:popupTrigger",
                    "path":"globalId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return (cmp.get(\"v.trigger.length\")>0); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:popupTrigger",
                                "path":"v.trigger.length"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "else":{
                          "descriptor":"else",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"popupTriggerElement",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:popupTrigger",
                                        "path":"v.class"
                                      },
                                      "aria-disabled":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:popupTrigger",
                                        "path":"v.disabled"
                                      },
                                      "aria-haspopup":"true",
                                      "tabindex":{
                                        "exprType":"FUNCTION",
                                        "code":"function(cmp, fn) { return (cmp.get(\"v.disabled\")? -(1):0); }",
                                        "args":[
                                          {
                                            "exprType":"PROPERTY",
                                            "byValue":false,
                                            "target":"ui:popupTrigger",
                                            "path":"v.disabled"
                                          }
                                        ],
                                        "byValue":false
                                      },
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:popupTrigger",
                                        "path":"c.onClick"
                                      },
                                      "title":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:popupTrigger",
                                        "path":"v.title"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"a"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:if"
                                        },
                                        "attributes":{
                                          "values":{
                                            "isTrue":{
                                              "descriptor":"isTrue",
                                              "value":{
                                                "exprType":"FUNCTION",
                                                "code":"function(cmp, fn) { return fn.ne(cmp.get(\"v.label\"),null); }",
                                                "args":[
                                                  {
                                                    "exprType":"PROPERTY",
                                                    "byValue":false,
                                                    "target":"ui:popupTrigger",
                                                    "path":"v.label"
                                                  }
                                                ],
                                                "byValue":false
                                              }
                                            },
                                            "else":{
                                              "descriptor":"else",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:popupTrigger",
                                                          "path":"v.body"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:popupTrigger",
                                                          "path":"v.label"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:popupTrigger",
                                                          "path":"v.title"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"popupTriggerElement",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{

                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:popupTrigger",
                                                "path":"v.trigger"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:input", (function (){/*$A.componentService.addComponentClass("markup://ui:input",function() {
return {
  "meta":{
    "name":"ui$input",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib"
    }
  },
  "controller":{
    "init":function(cmp) {
        var indicator = cmp.get('v.requiredIndicator');
        if (indicator && indicator.length > 0) {
            var indicatorCmp = indicator[0];
            if (indicatorCmp && indicatorCmp.isValid && indicatorCmp.isValid()) {
                indicatorCmp.autoDestroy(false);
            }
        }
    },
    "onDestroy":function(cmp) {
        var indicator = cmp.get('v.requiredIndicator');

        if (indicator && indicator.length > 0) {
            var indicatorCmp = indicator[0];
            if (indicatorCmp && indicatorCmp.isValid()) {
                indicatorCmp.destroy();
            }
        }
    },
    "updateError":function(cmp, event, helper) {
        var errors = event.getParam("value");

        var showErrors = cmp.get("v.showErrors");
        if (showErrors) {
            helper.updateError(cmp, errors);
        }

        if ($A.util.isEmpty(errors)) {
            var clearEvent = cmp.getEvent("onClearErrors");
            if (clearEvent) {
                clearEvent.fire();
            }
        } else {
            var errorEvent = cmp.getEvent("onError");
            if (errorEvent) {
                errorEvent.fire({errors: errors});
            }
        }
    },
    "handleLabelChange":function(cmp) {
        var labelComponent = cmp.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
        	var isCompound = cmp.get("v.isCompound");
        	var setAttribute = "v.label";
	        
	        if(isCompound){
	        	setAttribute = "v.legend";
	        }
            labelComponent.set(setAttribute, cmp.get("v.label"));
        }
    },
    "handleLabelPositionChange":function(cmp, evt, helper) {
        
        var labelComponent = cmp.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            helper.resetLabelPosition(cmp);
        }
    },
    "focus":function(cmp, event, helper) {
        var inputElement = helper.getInputElement(cmp);
        if (inputElement) {
            inputElement.focus();
        }
    },
    "updateRequired":function(cmp) {
        var labelComponent = cmp.find("inputLabel");

        if (labelComponent) {
            var labelDisplay = labelComponent.get("v.labelDisplay");
            var indicator = labelDisplay && cmp.get("v.required") ? cmp.get("v.requiredIndicator") : null;

            labelComponent.set("v.requiredIndicator", indicator);
        }
    }
  },
  "helper":{
    "SUPPORTED_FIELDHELP_COMPONENTS":[
      "ui:tooltip",
      "force:icon"
    ],
    "buildBody":function(component) {
        var labelAttribute = component.get("v.label");
        var isCompound = component.get("v.isCompound");
        var innerBody;
        var body = [];
        var wrapperTag;

        if (!$A.util.isEmpty(labelAttribute) || isCompound) {
            if (isCompound) {
                wrapperTag = 'fieldset';
                innerBody = this.addLegendToBody(component, labelAttribute);
            } else if (component.get("v.useSpanLabel")) {
                wrapperTag = 'div';
                innerBody = this.addSpanLabelToBody(component, labelAttribute);
            } else {
                wrapperTag = 'div';
                innerBody = this.addLabelToBody(component, labelAttribute);
            }

            
            $A.createComponent('aura:html', {
                    body: innerBody,
                    tag: wrapperTag,
                    "class": "form-element"
                },
                function (wrapperComponent) {
                    body.push(wrapperComponent);
                    component.set("v.body", body);
                }
            );
        }
    },
    "addLabelToBody":function(component, labelAttribute) {
        var innerBody = component.get("v.body");

        
        var domId = this.getGlobalId(component);
        var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
        var labelClass = component.get("v.labelClass") + " uiLabel-" + labelPositionAttribute + " form-element__label";
        var labelDisplay = labelPositionAttribute !== "hidden";
        var requiredIndicator = labelDisplay && component.get("v.required") ? component.get("v.requiredIndicator") : null;

        
        $A.createComponent("markup://ui:label", {
            "aura:id": 'inputLabel',
            label: labelAttribute,
            "class": labelClass,
            "for": domId,
            labelDisplay: labelDisplay,
            title: component.get("v.labelTitle"),
            requiredIndicator: requiredIndicator
        }, function(labelComponent) {
            
            if (labelPositionAttribute === 'left' || labelPositionAttribute === 'top') {
                innerBody.unshift(labelComponent);
            } else {
                innerBody.push(labelComponent);
            }
        });

        return innerBody;
    },
    "addLegendToBody":function(component, labelAttribute) {
        var innerBody = component.get("v.body");

        
        var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
        var labelClass = component.get("v.labelClass") + " uiLegend-" + labelPositionAttribute + " form-element__label";
        var labelDisplay = labelPositionAttribute !== "hidden";
        var requiredIndicator = labelDisplay && component.get("v.required") ? component.get("v.requiredIndicator") : null;

        
        $A.createComponent("markup://ui:legend", {
            "aura:id": "inputLabel",
            legend: labelAttribute,
            "class": labelClass,
            labelDisplay: labelDisplay,
            title: component.get("v.labelTitle"),
            requiredIndicator: requiredIndicator
        }, function(legendComponent) {
            
            if (labelPositionAttribute === "bottom") {
                innerBody.push(legendComponent);
            } else {
                innerBody.unshift(legendComponent);
            }
        });

        return innerBody;
    },
    "addSpanLabelToBody":function(component, labelAttribute) {
        var innerBody = component.get("v.body");

        
        var domId = this.getGlobalId(component);
        var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
        var labelClass = component.get("v.labelClass") + " uiPicklistLabel-" + labelPositionAttribute + " form-element__label";
        var labelDisplay = labelPositionAttribute !== "hidden";
        var requiredIndicator = labelDisplay && component.get("v.required") ? component.get("v.requiredIndicator") : null;

        
        $A.createComponent("markup://ui:picklistLabel", {
            domId: domId + "-label",
            "aura:id": "inputLabel",
            label: labelAttribute,
            "class": labelClass,
            labelDisplay: labelDisplay,
            title: component.get("v.labelTitle"),
            requiredIndicator: requiredIndicator
        }, function (picklistLabelComponent) {
            
            if (labelPositionAttribute === "bottom") {
                innerBody.push(picklistLabelComponent);
            } else {
                innerBody.unshift(picklistLabelComponent);
            }
        });

        return innerBody;
    },
    "renderFieldHelpComponent":function(component) {
        var fieldHelpComponent = component.get('v.fieldHelpComponent');
        if ($A.util.isArray(fieldHelpComponent) && !$A.util.isEmpty(fieldHelpComponent)) {
            for (var i = 0; i < this.SUPPORTED_FIELDHELP_COMPONENTS.length; i++) {
                if (fieldHelpComponent[0].isInstanceOf(this.SUPPORTED_FIELDHELP_COMPONENTS[i])) {
                    var labelComponent = component.find('inputLabel');
                    if (!$A.util.isUndefinedOrNull(labelComponent)) {
                        labelComponent.get('v.body').push(fieldHelpComponent[0]);
                    }
                    break;
                }
            }
        }
    },
    "getGlobalId":function(component) {
        return component.get("v.domId") || component.getGlobalId();
    },
    "resetLabelPosition":function(component) {
        var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
        if (labelPositionAttribute === 'hidden') {
            var labelComponent = component.find("inputLabel");
            if (!$A.util.isUndefinedOrNull(labelComponent)) {
                labelComponent.set("v.labelDisplay", labelPositionAttribute !== "hidden");
            }
            return;
        }

        var body = component.get("v.body");
        if ($A.util.isArray(body) && body[0].isInstanceOf("aura:html")) {
            var htmlBody = body[0].get("v.body");

            
            var label;
            if ($A.util.isArray(htmlBody)) {
                for (var i = 0; i < htmlBody.length; i++) {
                    if (htmlBody[i].isInstanceOf("ui:label")) {
                        label = htmlBody[i];
                        htmlBody.splice(i, 1);
                    }
                }
            }

            if (label) {
                label.set("v.labelDisplay", labelPositionAttribute !== "hidden");
                if (labelPositionAttribute === 'left' || labelPositionAttribute === 'top') {
                    htmlBody.unshift(label);
                } else if (labelPositionAttribute === 'right' || labelPositionAttribute === 'bottom') {
                    htmlBody.push(label);
                }
                body[0].set("v.body", htmlBody);
            }
        }
    },
    "checkValidPosition":function(passedInPosition) {
        var positionMap = {"top": 1, "right": 1, "bottom": 1, "left": 1, "hidden": 1};
        return positionMap[passedInPosition] ? passedInPosition : "left";
    },
    "addDomHandler":function(component, event) {
        var el = this.getInputElement(component);
        this.lib.interactive.attachDomHandlerToElement(component, el, event);
    },
    "addInputDomEvents":function(component) {
        var events = ["input", "change", "paste", "copy", "cut"];

        for (var i = 0, len = events.length; i < len; i++) {
            if (component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }
        }

        if (!component.get('v.updateOnDisabled')) {
            var updateOn = this.getUpdateOn(component);
            if (updateOn) {
                var handledEvents = this.lib.interactive.getHandledDOMEvents(component);
                for (var j = 0, lenj = updateOn.length; j < lenj; j++) {
                    if (handledEvents[updateOn[j]] !== true) {
                        this.addDomHandler(component, updateOn[j]);
                    }
                }
            }
        }
    },
    "getUpdateOn":function(component) {
        var ret = [];
        var updateOn = component.get("v.updateOn");

        if (!updateOn) {
            return ret;
        }

        updateOn = updateOn.toLowerCase().split(/[\W,]+/); 

        var domEvents = this.lib.interactive.getDomEvents(component);
        for (var i = 0, len = domEvents.length; i < len; i++) {
            for (var j = 0, lenj = updateOn.length; j < lenj; j++) {
                if (domEvents[i].toLowerCase() === updateOn[j]) {
                    ret.push(updateOn[j]);
                }
            }
        }
        
        return (ret.length > 0) ? ret : component.getDef().getAttributeDefs().getDef("updateOn").getDefault();
    },
    "getDomElementValue":function(element) {
        return element.value;
    },
    "getHandledDOMEvents":function(component) {
        return this.lib.interactive.getHandledDOMEvents(component);
    },
    "doUpdate":function(component, value) {
        component.set("v.value", value);
    },
    "preEventFiring":function(component, event) {
        this.handleUpdate(component, event);
    },
    "fireEvent":function(component, event, helper) {
        this.lib.interactive.fireEvent(component, event, helper);
    },
    "handleUpdate":function(component, event) {
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        
        if (updateOn.indexOf(event.type) > -1) {
            helper.doUpdate(component, helper.getDomElementValue(this.getInputElement(component)));
        }
    },
    "setEventParams":function(e, DOMEvent) {
        this.lib.interactive.setEventParams(e, DOMEvent);
    },
    "getInputElement":function(component) {
        return this.lib.interactive.getInputElement(component.getElement());
    },
    "updateError":function(cmp, errors) {
        var helper = cmp.getConcreteComponent().getDef().getHelper();
        
        if (!helper.shouldShowError(cmp)) {
            return;
        }

        if (this._thereIsErrorComponent(cmp)) {
            this._updateErrorComponent(cmp, errors);

        } else {
            
            if ($A.util.isEmpty(errors)) {
                return;
            }
            this._createDefaultErrorComponent(cmp, errors);
        }
    },
    "_thereIsErrorComponent":function(cmp) {
        return cmp.get('v.errorComponent').length > 0;
    },
    "_updateErrorComponent":function(cmp, errors) {
        var errorCmp = cmp.get('v.errorComponent')[0];

        errorCmp.set("v.errors", errors);
        var concreteHelper = cmp.getConcreteComponent().getDef().getHelper();
        concreteHelper.updateAriaDescribedBy(cmp, errorCmp.getGlobalId());
    },
    "_createDefaultErrorComponent":function(cmp, errors) {
        $A.createComponent(
            "ui:inputDefaultError",
            {
                "errors": errors
            },
            function (errorCmp, status) {
                if (status === "SUCCESS") {
                    cmp.set("v.errorComponent", errorCmp);
                    var concreteCmpHelper = cmp.getConcreteComponent().getDef().getHelper();
                    concreteCmpHelper.updateAriaDescribedBy(cmp, errorCmp.getGlobalId());
                }
            }
        );
    },
    "updateAriaDescribedBy":function(component, errorCmpId) {
        var ariaDesc = component.get("v.ariaDescribedBy");
        var errors = component.get("v.errors");
        if (!$A.util.isEmpty(errors)) {
            ariaDesc = this.addTokenToString(ariaDesc, errorCmpId);
        } else {
            ariaDesc = this.removeTokenFromString(ariaDesc, errorCmpId);
        }
        component.set("v.ariaDescribedBy", ariaDesc);
    },
    "updateErrorElement":function(component) {
        var errors = component.get("v.errors");
        var hasError = !$A.util.isEmpty(errors);

        if (this.hasLabel(component)) {
            $A.util.toggleClass(component.getElement(), "has-error", hasError);
        } else {
            $A.util.toggleClass(component, "has-error", hasError);
        }
    },
    "addClass":function(component, className) {
        $A.util.addClass(component, className);
    },
    "removeClass":function(component, className) {
        $A.util.removeClass(component, className);
    },
    "isHTML5Input":function(type) {
        
        if ($A.util.isUndefined(this.isHTML5Input.cache)) {
            this.isHTML5Input.cache = {};
        }

        
        var cached = this.isHTML5Input.cache[type];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        
        var test = document.createElement("input");
        test.setAttribute("type", type);

        var isSameType = (test.type === type);
        this.isHTML5Input.cache[type] = isSameType;
        return isSameType;
    },
    "isEventSupported":function(eventName) {
        
        if ($A.util.isUndefined(this.isEventSupported.cache)) {
            this.isEventSupported.cache = {};
        }

        
        var cached = this.isEventSupported.cache[eventName];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        var el = document.createElement('input');
        var _eventName = 'on' + eventName;
        var isSupported = (_eventName in el);
        if (!isSupported) {
            el.setAttribute(_eventName, 'return;');
            isSupported = typeof el[_eventName] === 'function';
        }
        $A.util.removeElement(el);
        this.isEventSupported.cache[eventName] = isSupported;
        return isSupported;
    },
    "setAttribute":function(cmp, attr) {
        cmp.set("v." + attr.key, attr.value, attr.commit);
    },
    "addTokenToString":function(str, token) {
        token = $A.util.trim(token);
        str = $A.util.trim(str);
        if (str > '') {
            if ((' ' + str + ' ').indexOf(' ' + token + ' ') === -1) {
                str += ' ' + token;
            }
        } else {
            str = token;
        }
        return str;
    },
    "removeTokenFromString":function(str, token) {
        token = $A.util.trim(token);
        str = $A.util.trim(str);
        if (str > '') {
            var start = (' ' + str + ' ').indexOf(' ' + token + ' ');
            if (start > -1) {
                str = str.substr(0, start) + str.substr(start + token.length + 1);
            }
        }
        return str;
    },
    "hasLabel":function(cmp) {
        var label = cmp.get('v.label');
        return !!(label && label.length > 0);
    },
    "setDisabled":function(component, disabled, disabledCss) {
        this.lib.interactive.setEventParams(component, disabled, disabledCss);
    },
    "getDomEvents":function(component) {
        return this.lib.interactive.getDomEvents(component);
    },
    "domEventHandler":function(event) {
        this.lib.interactive.domEventHandler(event);
    },
    "updateAriaRequired":function(component) {
        if (!component.get("v.isCompound") && component.get("v.required")) {
            var inputElement = this.getInputElement(component);
            if (!$A.util.isUndefinedOrNull(inputElement)) {
                inputElement.setAttribute("aria-required", true);
            }
        }
    },
    "shouldShowError":function(component) {
        
        
        return !$A.util.getBooleanValue(component.get("v.isCompound"));
    }
  },
  "renderer":{
    "render":function(component, helper) {
    	
		if (!component._hasBuiltBody) {
			helper.buildBody(component);
			component._hasBuiltBody = true;
		}
		
        var domId = component.get('v.domId');
		if (!domId) {
            var globalId = component.getGlobalId();
			helper.setAttribute(component, {key: 'domId', value: globalId});
		}
		helper.renderFieldHelpComponent(component);

		return component.superRender();
	},
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomEvents(component);
        component.superAfterRender();

        
        var concreteCmp = component.getConcreteComponent();
        var concreteHelper = concreteCmp.getDef().getHelper();

        concreteHelper.addInputDomEvents(component);
        concreteHelper.updateErrorElement(component);
        concreteHelper.updateAriaRequired(component);
    },
    "rerender":function(component) {
        
        var concreteCmp = component.getConcreteComponent();
        var concreteHelper = concreteCmp.getDef().getHelper();

        concreteHelper.addInputDomEvents(component);
        concreteHelper.updateErrorElement(component);
        concreteHelper.updateAriaRequired(component);

        component.superRerender();
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"PP",
  "descriptor":"markup://ui:input",
  "st":{
    "descriptor":"css://ui.input",
    "cl":"uiInput"
  },
  "fst":{
    "descriptor":"css://ui.input"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:uiEvents",
    "markup://ui:visible",
    "markup://ui:doubleClicks"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateError"
      },
      "n":"updateError"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateError"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.errors"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleLabelChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.label"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleLabelPositionChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.labelPosition"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateRequired"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.required"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onDestroy"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"destroy"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:input",
                  "path":"v.body"
                }
              }
            }
          }
        },
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:input",
                  "path":"v.errorComponent"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "ab":true,
  "df":"default",
  "dyf":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menu", (function (){/*$A.componentService.addComponentClass("markup://ui:menu",function() {
return {
  "meta":{
    "name":"ui$menu",
    "extends":"markup://ui:popup"
  },
  "controller":{
    "focusTrigger":function(component, event, helper) {
    	var trigger = helper.getTriggerComponent(component);
    	if (trigger) {
    		var action = trigger.get("c.focus");
    		action.runDeprecated();
    	}
    }
  },
  "helper":{
    "handleRefresh":function(component) {
        var menuList = this.getTargetComponent(component);
        if (menuList) {
            menuList.get("e.refresh").fire();
        }
    },
    "setTargetEventHandlers":function(component, targetComponent) {
        this.addCloseHandler(component, targetComponent);

        var focusActionHandler = $A.expressionService.create(component, component.getConcreteComponent().get('c.focusTrigger'));
        targetComponent.set("v.focusTrigger", focusActionHandler);
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
    	var target = helper.getTargetComponent(component);
    	var trigger = helper.getTriggerComponent(component);
    	if (target && trigger) {
            target.set("v.referenceElement", trigger.getElement());
    	}

    	return component.superAfterRender();
	}
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menu",
  "st":{
    "descriptor":"css://ui.menu",
    "cl":"uiMenu"
  },
  "su":"markup://ui:popup",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetShow",
      "n":"popupTargetShow",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetHide",
      "n":"popupTargetHide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:refresh",
      "n":"refresh",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTriggerPress",
      "n":"popupTriggerPress",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:expression"
          },
          "attributes":{
            "values":{
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:menu",
                  "path":"v.body"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menuList", (function (){/*$A.componentService.addComponentClass("markup://ui:menuList",function() {
return {
  "meta":{
    "name":"ui$menuList",
    "extends":"markup://ui:popupTarget"
  },
  "controller":{
    "handleVisibilityChange":function(component) {
        if (!component.get("v.hasMenuOpened") && component.get("v.visible")) {
            component.set("v.hasMenuOpened", true);
        }
    },
    "onMenuItemSelected":function(component, event, helper) {
        helper.onMenuItemSelected(component, event);
    },
    "onKeyboardEvent":function(component, event, helper) {
        var originalEvent = event.getParam("event");

        if (originalEvent.type !== "keydown") {
            return;
        }

        var downArrowKeyCode = 40;
        var upArrowKeyCode = 38;
        var keyCode = originalEvent.keyCode;
        if (keyCode === downArrowKeyCode || keyCode === upArrowKeyCode) {
            originalEvent.preventDefault();
            window.requestAnimationFrame($A.getCallback(function() {
                helper.setMenuItemFocus(component, 0);
            }));
        } else {
            var isPrintableCharacter =
                (keyCode >= 48 && keyCode <= 57)
                || (keyCode >= 65 && keyCode <= 90);
            var isVisible = component.get("v.visible");
            
            var triggerTypeAheadEnabled = component.get("v.triggerTypeAhead") || isVisible;
            if (triggerTypeAheadEnabled && isPrintableCharacter) {
                $A.util.squash(originalEvent, true);
                if (!isVisible) {
                    component.set("v.visible", true);
                }
                window.requestAnimationFrame($A.getCallback(function() {
                    helper.setFocusToTypingChars(component, originalEvent);
                }));
            }
        }
    },
    "update":function(component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
        _helper.setEventHandlersOnChildren(component);

        if(event.getPhase() !== "default") {
            event.stopPropagation();
        }
    }
  },
  "helper":{
    "setEventHandlersOnChildren":function(component) {
    	var concrete = component.getConcreteComponent();
        var children = [];

        var existingChildren = concrete.get("v.childMenuItems") || [];

        this.setHandlersOnMenuItems(concrete, concrete.get("v.body"), children, existingChildren);

        var items = component.find("item");
        if (items && $A.util.isArray(items)) {
            this.setHandlersOnMenuItems(concrete, items, children, existingChildren);
        }
        concrete.set("v.childMenuItems", children);
    },
    "setHandlersOnMenuItems":function(component, items, children, existingChildren) {
        for (var i = 0; i < items.length; i++) {
            var child = items[i];
            if (child.isInstanceOf("ui:menuItem")) {
                if (existingChildren && existingChildren.indexOf(child) === -1) {
                    child.addHandler("menuSelect", component, "c.onMenuItemSelected");
                }
                children.push(child);
            } else if (child.isInstanceOf("aura:iteration") || child.isInstanceOf("aura:if")) {
                this.setHandlersOnMenuItems(component, child.get("v.body"), children, existingChildren);
            } else if (child.isInstanceOf("ui:menuListProvider")) {
                this.setHandlersOnMenuItems(component, child.getSuper().get("v.body"), children, existingChildren);
            } else if (child.isInstanceOf("aura:expression")) {
                this.setHandlersOnMenuItems(component, child.get("v.value"), children, existingChildren);
            }
        }
    },
    "getMenuItem":function(component, index) {
        var menuItems = component.get("v.childMenuItems");
        if (menuItems) {
            return menuItems[index];
        }
    },
    "handleVisible":function(component) {
        var elements = this.getElementCache(component),
            visible = elements.target.get("v.visible");

        if ($A.util.hasClass(elements.targetElement, "visible") === visible) {
            return;
        }

        if (visible === true) {
            $A.util.addClass(elements.targetElement, "visible");
            elements.target.get("e.menuExpand").fire();
        } else {
            $A.util.removeClass(elements.targetElement, "visible");
            elements.target.get("e.menuCollapse").fire();
        }
    },
    "setMenuItemFocus":function(component, index) {
        var menuItem = this.getMenuItem(component, index);
        if (menuItem && menuItem.isValid() && menuItem.getElement()) {
            
            
            
            setTimeout($A.getCallback(function () {
                menuItem.setFocus();
                this.fireMenuFocusChangeEvent(component, null, menuItem);
            }).bind(this),5);
        }
    },
    "setKeyboardEventHandlers":function(component) {
    	var el = component.find("datalist").getElement();
    	$A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
    },
    "removeKeyboardEventHandlers":function(component) {
    	var el = component.find("datalist").getElement();
    	$A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
    	delete component._keyboardEventHandler;
    },
    "getKeyboardInteractionHandler":function(component) {
    	var helper = this;
    	if (!component._keyboardEventHandler) {
    		component._keyboardEventHandler = function(event) {
                
                
                
    			var concreteCmp = component.getConcreteComponent();
    			if (event.type === "keydown") {
    				if (event.keyCode === 40) {  
    					event.preventDefault();
    					helper.setFocusToNextItem(concreteCmp, event);
    				} else if (event.keyCode === 38) {  
    					event.preventDefault();
    					helper.setFocusToPreviousItem(concreteCmp, event);
    				} else if (event.keyCode === 27) {  
    					event.stopPropagation();
    					helper.handleEsckeydown(concreteCmp, event);
    				} else if (event.keyCode === 9) {  
    					helper.handleTabkeydown(concreteCmp, event);
    				} else {
    					helper.setFocusToTypingChars(concreteCmp, event);
    				}
    			}
    		};
    	}
    	return component._keyboardEventHandler;
    },
    "handleEsckeydown":function(component) {
        component.getConcreteComponent().get("e.doClose").fire();
        
        this.setFocusToTrigger(component);
    },
    "setFocusToTrigger":function(component) {
    	var action =  component.get("v.focusTrigger");
    	if (action) {
    		action.runDeprecated();
    	}
    },
    "setFocusToNextItem":function(component, event) {
        var nextIndex = 0;

        var menuItems = component.get("v.childMenuItems");

        if (event) {
            var srcComponent = this.getComponentForElement(event.target || event.srcElement);

            for (var i = 0; i < menuItems.length; i++) {
                if (srcComponent === menuItems[i]) {
                    nextIndex = ++i;
                            break;
                        }
                    }
            if (nextIndex >= menuItems.length) {
                nextIndex = 0;
            }
        }

        var nextFocusCmp = menuItems[nextIndex];
        nextFocusCmp.setFocus();

        this.fireMenuFocusChangeEvent(component, srcComponent, nextFocusCmp);
    },
    "setFocusToPreviousItem":function(component, event) {
        var previousIndex = 0;
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var menuItems = component.get("v.childMenuItems");
        for (var i = 0; i < menuItems.length; i++) {
            if (srcComponent === menuItems[i]) {
                previousIndex = --i;
                break;
            }
        }
        if (previousIndex < 0) {
            previousIndex = menuItems.length - 1;
        }
        var previousFocusCmp = menuItems[previousIndex];
        previousFocusCmp.setFocus();

        this.fireMenuFocusChangeEvent(component, srcComponent, previousFocusCmp);
    },
    "fireMenuFocusChangeEvent":function(component, previousItem, currentItem) {
    	var event = component.getEvent("menuFocusChange");
    	event.setParams({
			"previousItem": previousItem,
			"currentItem": currentItem
		});
    	event.fire();
    },
    "handleTabkeydown":function(component) {
		var closeOnTab = component.get('v.closeOnTabKey');
        var concreteComponent = component.getConcreteComponent();
        if (concreteComponent && closeOnTab) {
            if (component.get("v.attachToBody")) {
                this.setFocusToTrigger(component);
            }
            concreteComponent.get("e.doClose").fire();
        }
    },
    "setFocusToTypingChars":function(component, event) {
        
        if (!$A.util.isUndefinedOrNull(component._clearBufferId)) {
            clearTimeout(component._clearBufferId);
        }

        
        var letter = String.fromCharCode(event.keyCode);
        component._keyBuffer = component._keyBuffer || [];
        component._keyBuffer.push(letter);

        
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var matchText = component._keyBuffer.join("").toLowerCase();
        var menuItems = component.get("v.childMenuItems");
        for(var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            var text = c.get("v.label");
            if(text && text.toLowerCase().indexOf(matchText) === 0) {
                c.setFocus();
                this.fireMenuFocusChangeEvent(component, srcComponent, c);
                break;
            }
        }

        component._clearBufferId = setTimeout(function() {
        	component._keyBuffer = [];
        }, 700);
    },
    "deselectSiblings":function(component, selectedItem) {
          var children = component.get("v.childMenuItems");
          for (var i = 0; i < children.length; i++) {
              var c = children[i];
              if (c.isInstanceOf("ui:radioMenuItem") &&
                      $A.util.getBooleanValue(c.get("v.selected")) &&
                      c.getGlobalId() !== selectedItem.getGlobalId()) {
                  c.set("v.selected", false);
                  break;
              }
          }
    },
    "onMenuItemSelected":function(component, event) {
        var concrete = component.getConcreteComponent();

        var deselectSiblings = event.getParam("deselectSiblings");
        if (deselectSiblings === true) {
            this.deselectSiblings(component, event.getSource());
        }

        var hideMenu = event.getParam("hideMenu");
        if (hideMenu === true) {
            concrete.set("v.visible", false);
        }

        var focusTrigger = event.getParam("focusTrigger");
        if (focusTrigger === true) {
            this.setFocusToTrigger(component);
        }

        if (component.isValid()) {
            component.get("e.menuSelect").fire(event.getParams());
        }
    },
    "getComponentForElement":function(element) {
    	var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
    	return htmlCmp ? htmlCmp.getComponentValueProvider().getConcreteComponent() : null;
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        component.superAfterRender();

    	helper.setKeyboardEventHandlers(component);
        helper.setEventHandlersOnChildren(component);

        if (component.get("v.visible")) {
            component.set("v.hasMenuOpened", true);
        }
    },
    "rerender":function(component, helper) {
        if (!component.isDirty("v.childMenuItems")) {
            helper.setEventHandlersOnChildren(component);
        }
        helper.handleVisible(component);
        return component.superRerender();
    },
    "unrender":function(component, helper) {
        try {
            helper.removeKeyboardEventHandlers(component);
        } finally {
            return component.superUnrender();
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menuList",
  "st":{
    "descriptor":"css://ui.menuList",
    "cl":"uiMenuList"
  },
  "fst":{
    "descriptor":"css://ui.menuList"
  },
  "su":"markup://ui:popupTarget",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false,"menu"],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","G",false,false],
    ["closeOnTabKey","aura://Boolean","G",false,true],
    ["autoPosition","aura://Boolean","G",false,true],
    ["curtain","aura://Boolean","G",false,false],
    ["closeOnClickOutside","aura://Boolean","G",false,true],
    ["attachToBody","aura://Boolean","PP",false,false],
    ["manualPosition","aura://Boolean","I",false,false],
    ["smartAttachToBody","aura://Boolean","I",false,false],
    ["referenceElement","aura://Object","I",false,null],
    ["closeOnClickInside","aura://Boolean","I",false,false],
    ["preTransitionClass","aura://String","I",false,""],
    ["showNubbin","aura://Boolean","I",false,false],
    ["menuItems","aura://List","G",false,[]],
    ["focusItemIndex","aura://Integer","I",false,0],
    ["focusTrigger","aura://Aura.Action","I",false,null],
    ["headerText","aura://String","I",false],
    ["childMenuItems","aura://Aura.Component[]","I",false,[]],
    ["triggerTypeAhead","aura://Boolean","I",false,false],
    ["hasMenuOpened","aura://Boolean","p",false,false]
  ],
  "med":[
    {
      "name":"ui:update",
      "xs":"I",
      "action":"{!c.update}"
    }
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:collapse",
      "n":"doClose",
      "xs":"I"
    },
    {
      "ed":"markup://ui:expand",
      "n":"popupExpand",
      "xs":"I"
    },
    {
      "ed":"markup://ui:collapse",
      "n":"popupCollapse",
      "xs":"I"
    },
    {
      "ed":"markup://ui:expand",
      "n":"menuExpand",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuSelect",
      "n":"menuSelect",
      "xs":"G"
    },
    {
      "ed":"markup://ui:refresh",
      "n":"refresh",
      "xs":"I"
    },
    {
      "ed":"markup://ui:collapse",
      "n":"menuCollapse",
      "xs":"G"
    },
    {
      "ed":"markup://ui:menuFocusChange",
      "n":"menuFocusChange",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onKeyboardEvent"
      },
      "n":"popupKeyboardEvent"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "n":"refresh"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.body"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleVisibilityChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.visible"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"menu",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:menuList",
                    "path":"v.class"
                  },
                  "role":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:menuList",
                    "path":"v.role"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return fn.ne(cmp.get(\"v.headerText\"),null); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:menuList",
                                "path":"v.headerText"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"menu__header"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"text-heading--label"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"v.headerText"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"datalist",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"scrollable",
                            "role":"presentation"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"ul"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:menuList",
                                      "path":"v.hasMenuOpened"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:iteration"
                                        },
                                        "attributes":{
                                          "values":{
                                            "var":{
                                              "descriptor":"var",
                                              "value":"item"
                                            },
                                            "items":{
                                              "descriptor":"items",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:menuList",
                                                "path":"v.menuItems"
                                              }
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://ui:menuItem"
                                                  },
                                                  "localId":"item",
                                                  "attributes":{
                                                    "values":{
                                                      "class":{
                                                        "descriptor":"class",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.className"
                                                        }
                                                      },
                                                      "label":{
                                                        "descriptor":"label",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.label"
                                                        }
                                                      },
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.value"
                                                        }
                                                      },
                                                      "selected":{
                                                        "descriptor":"selected",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.selected"
                                                        }
                                                      },
                                                      "type":{
                                                        "descriptor":"type",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.type"
                                                        }
                                                      },
                                                      "disabled":{
                                                        "descriptor":"disabled",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.disabled"
                                                        }
                                                      },
                                                      "hideMenuAfterSelected":{
                                                        "descriptor":"hideMenuAfterSelected",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:menuList",
                                                          "path":"item.hideMenuAfterSelected"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:menuList",
                                                "path":"v.body"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "dyf":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menuTriggerLink", (function (){/*$A.componentService.addComponentClass("markup://ui:menuTriggerLink",function() {
return {
  "meta":{
    "name":"ui$menuTriggerLink",
    "extends":"markup://ui:popupTrigger"
  },
  "controller":{
    "init":function(component, event, helper) {
        helper.initializeHandlers(component);
    },
    "onblur":function(component) {
        component.get("e.blur").fire();
    },
    "onfocus":function(component) {
        component.get("e.focus").fire();
    },
    "onClick":function(component, event, helper) {
        if (component._recentlyClicked) {
            return false;
        }

        if (event && $A.util.getBooleanValue(component.get("v.stopClickPropagation"))) {
            $A.util.squash(event);
        }

        var concreteCmp = component.getConcreteComponent();
        var concreteHelper = concreteCmp.helper;
        concreteHelper.handleTriggerPress(concreteCmp);
        helper.fireMenuTriggerPress(component);

        if ($A.util.getBooleanValue(component.get("v.disableDoubleClicks"))) {
            component._recentlyClicked = true;
            window.setTimeout($A.getCallback(function() { component._recentlyClicked = false; }), 350);
        }
    },
    "focus":function(component) {
        var concreteCmp = component.getConcreteComponent();
        
        var concreteHelper = concreteCmp.helper;
        if (concreteHelper.focus) {
        	concreteHelper.focus(concreteCmp);
        }
    }
  },
  "helper":{
    "initializeHandlers":function(cmp) {
        var html       = cmp.find('link');
        var htmlAttr   = html.get('v.HTMLAttributes');
        var dispatcher = cmp.getConcreteComponent().getEventDispatcher();

        if (dispatcher.focus && dispatcher.focus["bubble"] && dispatcher.focus["bubble"].length) {
            htmlAttr.onfocus = cmp.getReference('c.onfocus');
        }

        if (dispatcher.blur && dispatcher.blur["bubble"] && dispatcher.blur["bubble"].length) {
            htmlAttr.onblur = cmp.getReference('c.onblur');
        }
    },
    "focus":function(component) {
        var linkCmp = this.getAnchorElement(component);
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem && elem.focus) {
            elem.focus();
        }
    },
    "getAnchorElement":function(component) {
        
        var localId = "link",
            cmp =  component.getConcreteComponent();
        var retCmp = null;
        while (cmp) {
            retCmp = cmp.find(localId);
            if (retCmp) {
                break;
            }
            cmp = cmp.getSuper();
        }
        return retCmp;
    },
    "handleClick":function(component) {
        var concreteCmp = component.getConcreteComponent();
        this.handleTriggerPress(concreteCmp);
        this.fireMenuTriggerPress(concreteCmp);
    },
    "fireMenuTriggerPress":function(component) {
        component.get("e.menuTriggerPress").fire();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menuTriggerLink",
  "su":"markup://ui:popupTrigger",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["disabled","aura://Boolean","G",false,false],
    ["label","aura://String","G",false],
    ["title","aura://String","G",false,""],
    ["trigger","aura://Aura.Component[]","I",false,[]],
    ["stopClickPropagation","aura://Boolean","I",false,false],
    ["ariaLabel","aura://String","I",false],
    ["ariaRequired","aura://Boolean","I",false]
  ],
  "med":[
    {
      "name":"ui:triggerInteraction",
      "xs":"I"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.focus}"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetShow",
      "n":"popupTargetShow",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetHide",
      "n":"popupTargetHide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTriggerPress",
      "n":"popupTriggerPress",
      "xs":"I"
    },
    {
      "ed":"markup://ui:menuTriggerPress",
      "n":"menuTriggerPress",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "ld":{
    "link":{
      "description":"Menu trigger link",
      "alias":"menu-trigger-link",
      "isPrimitive":true
    }
  },
  "fa":[
    {
      "descriptor":"trigger",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"menuTrigger",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{

                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"link",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "aria-required":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.ariaRequired"
                            },
                            "class":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.class"
                            },
                            "aria-disabled":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.disabled"
                            },
                            "aria-describedby":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.ariaDescribedBy"
                            },
                            "aria-haspopup":"true",
                            "tabindex":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return (cmp.get(\"v.disabled\")? -(1):0); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:menuTriggerLink",
                                  "path":"v.disabled"
                                }
                              ],
                              "byValue":false
                            },
                            "role":"button",
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"c.onClick"
                            },
                            "aria-label":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.ariaLabel"
                            },
                            "title":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:menuTriggerLink",
                              "path":"v.title"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"a"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"FUNCTION",
                                      "code":"function(cmp, fn) { return fn.eq(cmp.get(\"v.body.length\"),0); }",
                                      "args":[
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:menuTriggerLink",
                                          "path":"v.body.length"
                                        }
                                      ],
                                      "byValue":false
                                    }
                                  },
                                  "else":{
                                    "descriptor":"else",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:menuTriggerLink",
                                                "path":"v.body"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:menuTriggerLink",
                                                "path":"v.label"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:dayInMonthCell", (function (){/*$A.componentService.addComponentClass("markup://ui:dayInMonthCell",function() {
return {
  "meta":{
    "name":"ui$dayInMonthCell",
    "extends":"markup://aura:component"
  },
  "controller":{
    "dateCellSelected":function(component, event, helper) {
        helper.dateCellSelected(component);
    },
    "updateCell":function(component, event, helper) {
        var attributes = event.getParam('arguments').config;
        helper.setCalendarAttributes(component, attributes);
    }
  },
  "helper":{
    "updateCell":function(component) {
        var elem = component.getElement();
        if (elem) {
            elem.setAttribute("data-datevalue", component.get("v.value"));
        }
    },
    "setCalendarAttributes":function(component, config) {
        component.set("v.ariaSelected", config.ariaSelected);
        component.set("v.value", config.value);
        component.set("v.label", config.label);
        component.set("v.class", config.class);
        component.set("v.tdClass", config.tdClass);
        component.set("v.tabIndex", config.tabIndex);
    },
    "dateCellSelected":function(component) {
        component.set("v.ariaSelected", true);

        component.getEvent("selectDate").fire({
            "value": component.get("v.value")
        });
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.updateCell(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.updateCell(component);
        component.superRerender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:dayInMonthCell",
  "st":{
    "descriptor":"css://ui.dayInMonthCell",
    "cl":"uiDayInMonthCell"
  },
  "fst":{
    "descriptor":"css://ui.dayInMonthCell"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["rowHeader","aura://Boolean","I",false,false],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","I",false],
    ["visible","aura://Boolean","I",false,true],
    ["label","aura://String","I",false],
    ["ariaSelected","aura://Boolean","I",false,false],
    ["tabIndex","aura://Integer","I",false,-1],
    ["tdClass","aura://String","I",false]
  ],
  "med":[
    {
      "name":"ui:updateCell",
      "xs":"I",
      "attributes":[
        ["config","aura://Object","I",false,null]
      ]
    }
  ],
  "i":[
    "markup://ui:tableCell",
    "markup://ui:hasGridEvents",
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:gridAction",
      "n":"gridAction",
      "xs":"I"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:selectDate",
      "n":"selectDate",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:dayInMonthCell",
                    "path":"v.tdClass"
                  },
                  "aria-selected":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:dayInMonthCell",
                    "path":"v.ariaSelected"
                  },
                  "role":"gridcell",
                  "tabindex":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:dayInMonthCell",
                    "path":"v.tabIndex"
                  },
                  "onclick":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:dayInMonthCell",
                    "path":"c.dateCellSelected"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"td"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"day",
                    "flavorable":true,
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.class\"),\" \"),$A.get(\"$Browser.formFactor\")); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:dayInMonthCell",
                                  "path":"$Browser.formFactor"
                                },
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:dayInMonthCell",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"span"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:dayInMonthCell",
                                      "path":"v.label"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:image", (function (){/*$A.componentService.addComponentClass("markup://ui:image",function() {
return {
  "meta":{
    "name":"ui$image",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(component) {
    	var cmp = component.getConcreteComponent();
        var imageType = cmp.get('v.imageType'),
            altText = cmp.get('v.alt') || '',
            id = cmp.getLocalId() || cmp.getGlobalId() || '';

        if (imageType === 'informational' && altText.length === 0) {
            $A.warning('component: ' + id + ' "alt" attribute should not be empty for informational image');
        } else if (imageType === 'decorative' && altText.length > 0) {
            $A.warning('component: ' + id + ': "alt" attribute should be empty for decorative image');
        }
    }
  },
  "helper":{
    "getImageElement":function(cmp) {
        var imageElement = cmp.find("body").getElement().firstChild;

        if (this.isAnchorImage(cmp)) {
            imageElement = imageElement.children[0];
        }
        return imageElement;
    },
    "isAnchorImage":function(cmp) {
        return !$A.util.isEmpty(cmp.get("v.href"));
    },
    "buildBody":function(cmp) {
        var body = cmp.find("body");

        if (body) {
            var bodyElement = body.getElement();

            $A.util.clearNode(bodyElement);

            var image = this.buildImageElement(cmp);

            var href = this.sanitizeUrl(cmp.get("v.href"));

            if (!$A.util.isEmpty(href)) {
                var link = $A.util.createHtmlElement("a", {
                    "href": href,
                    "class": cmp.get("v.linkClass"),
                    "target": cmp.get("v.target")
                });

                link.appendChild(image);
                bodyElement.appendChild(link);
            } else {
                bodyElement.appendChild(image);
            }
        }

    },
    "buildImageElement":function(cmp) {
        var image = $A.util.createHtmlElement("img", {
            "data-aura-rendered-by": cmp.getGlobalId(),
            "src": this.sanitizeUrl(cmp.get("v.src")),
            "class": cmp.get("v.class"),
            "alt": cmp.get("v.alt"),
            "title": cmp.get("v.title")
        });

        image["onerror"] = $A.getCallback(function () {
            if (cmp.isValid()) {
                cmp.get("e.onerror").fire();
            }
        });

        image["onload"] = $A.getCallback(function () {
            if (cmp.isValid()) {
                cmp.get("e.onload").setParams({"value": image}).fire();
            }
        });

        return image;
    },
    "sanitizeUrl":function(url) {
        var regex = /^\s*javascript:/;
        if (regex.test(url)) {
            return '';
        }
        return url;
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.buildBody(cmp);

        return ret;
    },
    "rerender":function(cmp, helper) {

        cmp.superRerender();

        helper.buildBody(cmp);

    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:image",
  "st":{
    "descriptor":"css://ui.image",
    "cl":"uiImage"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["title","aura://String","I",false],
    ["imageType","aura://String","I",false,"informational"],
    ["src","aura://String","I",false,"/auraFW/resources/aura/s.gif"],
    ["class","aura://String","I",false],
    ["href","aura://String","I",false],
    ["linkClass","aura://String","I",false],
    ["alt","aura://String","I",false,""],
    ["target","aura://String","I",false,"_self"]
  ],
  "re":[
    {
      "ed":"markup://ui:response",
      "n":"onerror",
      "xs":"I"
    },
    {
      "ed":"markup://ui:response",
      "n":"onload",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"body",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{

                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputSelect", (function (){/*$A.componentService.addComponentClass("markup://ui:inputSelect",function() {
return {
  "meta":{
    "name":"ui$inputSelect",
    "extends":"markup://ui:input"
  },
  "controller":{
    "doInit":function(cmp, evt, helper) {
        var concreteCmp = cmp.getConcreteComponent();
        var concreteHelper = concreteCmp.getDef().getHelper() || helper;

        concreteHelper.init(concreteCmp);

        if (cmp.get("v.useMenu")) {
            helper.updateMenuLabel(concreteCmp);
            cmp._createMenuItems = true;
        }
    },
    "setFocus":function(cmp) {
        if (cmp.get("v.useMenu")) {
            var menuTrigger = cmp.find("selectTrigger");
            menuTrigger.setFocus();
        } else {
            var selectElement = cmp.find("select").getElement();
            if (selectElement) {
                selectElement.focus();
            }
        }
    },
    "valueChange":function(cmp, evt, helper) {
        var concreteCmp = cmp.getConcreteComponent();
        helper.updateOptionsFromValue(concreteCmp);
    },
    "optionsChange":function(cmp, evt, helper) {
        var concreteCmp = cmp.getConcreteComponent();

        if (concreteCmp._initOptionsFromValue) {
            concreteCmp._initOptionsFromValue = false;
            helper.updateOptionsFromValue(concreteCmp);
        } else {
            helper.updateValueFromOptions(concreteCmp);
        }
        if (cmp.get("v.useMenu") && !cmp._suspendChangeHandlers) {
            helper.updateMenuLabel(concreteCmp);
            cmp._createMenuItems = true;
        }
    },
    "menuOptionSelected":function(cmp, event, helper) {
        helper.menuOptionSelected(cmp);
    },
    "menuOpened":function(cmp, event, helper) {
        if (!cmp._createMenuItems) {
            return;
        }

        helper.updateMenuListWidth(cmp);

        cmp._createMenuItems = false;
        helper.createMenuItems(cmp);
    }
  },
  "helper":{
    "optionSeparator":";",
    "init":function(cmp) {
        var currentValue = cmp.get("v.value");

        if ($A.util.isEmpty(cmp.get("v.options")) && !$A.util.isEmpty(cmp.get("v.body"))) {
            cmp.set("v.renderBody", true);
        }

        if (!$A.util.isUndefined(currentValue)) {
            
            this.updateOptionsFromValue(cmp);
        } else {
            
            this.updateValueFromOptions(cmp);
        }
    },
    "updateMenuListWidth":function(cmp) {
        var menuListElement = cmp.find("options").getElement();
        if (menuListElement) {
            var triggerRect = cmp.find("selectTrigger").getElement().getBoundingClientRect();
            var width = typeof triggerRect.width !== 'undefined' ? triggerRect.width : triggerRect.right - triggerRect.left;
            if (width > 0) {
                menuListElement.style.width = width + "px";
                var minWidth = 200;
                
                
                menuListElement.style.maxWidth = Math.max(minWidth, width) + "px";
                menuListElement.style.minWidth = minWidth + "px";
            }
        }
    },
    "getDomElementValue":function(el) {
        var selectedOptions = [];
        for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].selected) {
                selectedOptions.push(el.options[i].value);
            }
        }
        return selectedOptions.join(this.optionSeparator);
    },
    "getOptionsWithStrategy":function(cmp) {
        var strat = this.optionsStrategy,
            opts = strat.getOptions(cmp);

        if ($A.util.isEmpty(opts)) {
            strat = this.bodyStrategy;
            opts = strat.getOptions(cmp);
        }

        return {options: opts, strategy: strat};
    },
    "menuOptionSelected":function(cmp) {
        var menuItems = cmp.find("options").get("v.body");

        var buildAListOfSelectedOptions = function(accumulator, menuItem) {
            if (menuItem.get("v.selected")) {
                accumulator.push({label: menuItem.get("v.label"), value: menuItem.get("v.value")});
            }
            return accumulator;
        };
        var selectedOptions = menuItems.reduce(buildAListOfSelectedOptions, []);

        var newSelectedLabel = selectedOptions.map(function(value) { return value.label; }).join(this.optionSeparator);
        var newValue = selectedOptions.map(function(value) { return value.value; }).join(this.optionSeparator);

        if (cmp.get("v.selectedLabel") === newSelectedLabel) {
            return;
        }

        cmp.set("v.selectedLabel", newSelectedLabel);
        cmp._suspendChangeHandlers = true;
        cmp.set("v.value", newValue);
        cmp.get("e.change").fire();
        cmp._suspendChangeHandlers = false;
    },
    "createMenuItems":function(cmp) {
        var options = cmp.get("v.options");
        var menuItems = [];

        var handleCreatedMenuItem = function(menuItem, status) {
        	if (status === "SUCCESS") {
        		menuItems.push(menuItem);
                if (menuItems.length === options.length) {
                    cmp.find("options").set("v.body", menuItems);
                }
        	}
        };
        var multiSelect = cmp.get("v.multiple");
        var menuItemComponentName = multiSelect ? "ui:checkboxMenuItem" : "ui:radioMenuItem";

        $A.getDefinition(menuItemComponentName, function() {
            for (var i = 0; i < options.length; i++) {
                $A.createComponent(menuItemComponentName, {
                    "class": options[i].class,
                    "label": options[i].label,
                    "value": options[i].value,
                    "selected": $A.util.getBooleanValue(options[i].selected),
                    "hideMenuAfterSelected": !multiSelect
                }, handleCreatedMenuItem);
            }
        });
    },
    "updateMenuLabel":function(cmp) {
        var options = cmp.get("v.options");

        var newLabel = options.filter(function(option) { return option.selected; })
            .map(function(option) { return option.label; })
            .join(this.optionSeparator);

        
        if (newLabel === "" && options[0]) {
            newLabel = options[0].label;
        }

        cmp.set("v.selectedLabel", newLabel);
    },
    "updateOptionsFromValue":function(cmp, createNewOptions) {
        if (cmp._suspendChangeHandlers) {
            return;
        }

        var value = cmp.get("v.value"),
            optionsPack = this.getOptionsWithStrategy(cmp),
            selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);

        if (optionsPack.options.length === 0) {
            cmp._initOptionsFromValue = true;
            return;
        }


        if (this.isAlreadySelected(cmp, selectedOptions)) {
            return;
        }

        var valueOrEmpty = cmp.get("v.value") || "";
        var newValues;

        var isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple"));
        if (isMultiple) {
            
            newValues = valueOrEmpty.split(this.optionSeparator);
        } else {
            newValues = [valueOrEmpty];
        }

        if (!optionsPack.strategy.updateOptions(cmp, optionsPack.options, newValues, createNewOptions) && !(isMultiple && value === "")) {
            this.updateValueFromOptions(cmp, optionsPack);
        } else {
            cmp._suspendChangeHandlers = true;
            optionsPack.strategy.persistOptions(cmp, optionsPack.options);
            cmp._suspendChangeHandlers = false;
        }
    },
    "isAlreadySelected":function(cmp, selectedOptions) {
        var value = cmp.get("v.value");
        var isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple"));

        return selectedOptions.length > 0 &&
            (isMultiple && value === selectedOptions.join(this.optionSeparator)) ||
            (!isMultiple && value === selectedOptions[0]);
    },
    "updateValueFromOptions":function(cmp, optionsPack) {
        if (cmp._suspendChangeHandlers) {
            return;
        }
        optionsPack = optionsPack || this.getOptionsWithStrategy(cmp);

        var value = cmp.get("v.value"),
            isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple")),
            selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);
        var optionValue = selectedOptions.join(this.optionSeparator);

        if (selectedOptions.length === 0 || value !== optionValue) {
            if (!isMultiple && selectedOptions.length === 0) {
                optionValue = optionsPack.strategy.getValue(optionsPack.options, 0);
                optionsPack.strategy.setOptionSelected(optionsPack.options, 0, true);

                cmp._suspendChangeHandlers = true;
                optionsPack.strategy.persistOptions(cmp, optionsPack.options);
                cmp._suspendChangeHandlers = false;
            }
            cmp.set("v.value", optionValue, true);
        }
    },
    "optionsStrategy":{
      "getOptions":function(cmp) {
            return cmp.get("v.options");
        },
      "updateOptions":function(cmp, options, newValues, createNewOptions) {
            var found = false;
            var i;

            for (i = 0; i < options.length; i++) {
                var option = options[i];
                var val = option.value;
                if ($A.util.isUndefinedOrNull(val)) {
                	continue;
                }
                var selectOption = (newValues.length > 1 && newValues.indexOf(val) > -1) || newValues[0] === val.toString();

                found = found || selectOption;
                option.selected = selectOption;
            }

            if (!found && createNewOptions) {
                for (i=0; i<newValues.length; i++) {
                    options.unshift({
                        label: newValues[i],
                        value: newValues[i],
                        selected: true
                    });
                }
            }

            return found;
        },
      "getSelected":function(options) {
            var values = [];

            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (option.selected) {
                    values.push(option.value || "");
                }
            }

            return values;
        },
      "getValue":function(options, index) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                return options[index].value;
            }
            return undefined;
        },
      "setOptionSelected":function(options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].selected = selected;
            
                
            }
        },
      "persistOptions":function(cmp, options) {
            cmp.set("v.options", options);
        }
    },
    "bodyStrategy":{
      "SUPPORTEDCONTAINERS":[
        "ui:inputSelectOptionGroup",
        "aura:iteration",
        "aura:if",
        "aura:renderIf"
      ],
      "getOptions":function(cmp) {
            var options = [];
            this.performOperationOnCmps(cmp.get("v.body"), this.addOptionToList, options);
            return options;
        },
      "updateOptions":function(cmp, options, newValues) {
            var result = {found: false};
            
            this.performOperationOnCmps(options, this.updateOption, result, newValues);
            return result.found;
        },
      "getSelected":function(bodyCmps) {
            var values = [];
            this.performOperationOnCmps(bodyCmps, this.pushIfSelected, values);
            return values;
        },
      "getValue":function(options, index) {
            if (options[index]) {
                return options[index].get("v.text");
            }
            return undefined;
        },
      "setOptionSelected":function(options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].set("v.value", selected);
            
                
            }
        },
      "persistOptions":function() {
            
            
        },
      "performOperationOnCmps":function(opts, op, result, newValues) {
            for (var i = 0; i < opts.length; i++) {
                var cmp = opts[i];
                if (cmp.isInstanceOf("ui:inputSelectOption")) {
                    op(cmp, result, newValues);
                } else if (this.canSupportOptions(cmp)) {
                    var groupBody = cmp.get("v.body");
                    if (!$A.util.isEmpty(groupBody)) {
                        this.performOperationOnCmps(groupBody, op, result, newValues);
                    }
                } else {
                    var cmpType = cmp.getType();
                    $A.warning("<" + cmpType + "> is currently not supported inside <ui:inputSelect> since it does not properly " +
                    "attach the options to the component. This will lead to undefined behavior. Please " +
                    "use 'v.options' to insert your option objects instead.");
                }
            }
        },
      "updateOption":function(optionCmp, result, newValues) {
            var text = optionCmp.get("v.text");
            var selectOption = (newValues.length > 1 && newValues.indexOf(text) > -1) || newValues[0] === text;

            result.found = result.found || selectOption;
            optionCmp.set("v.value", selectOption);

        },
      "pushIfSelected":function(optionCmp, valueList) {
            if ($A.util.getBooleanValue(optionCmp.get("v.value")) === true) {
                var text = optionCmp.get("v.text");
                if (!$A.util.isUndefined(text)) {
                    valueList.push(text);
                }
            }
        },
      "addOptionToList":function(cmp, list) {
            list.push(cmp);
        },
      "canSupportOptions":function(cmp) {
            for (var i = 0; i < this.SUPPORTEDCONTAINERS.length; i++) {
                if (cmp.isInstanceOf(this.SUPPORTEDCONTAINERS[i])) {
                    return true;
                }
            }
            return false;
        }
    },
    "renderOptions":function(cmp, options) {
    	var fragment = document.createDocumentFragment();

    	for (var i = 0; i < options.length; ++i) {
    		var optionElement = document.createElement('option');
            fragment.appendChild(this.updateOptionElement(cmp, options[i], optionElement));
    	}

    	return fragment;
    },
    "updateOptionElement":function(cmp, option, optionElement) {
    	var internalText = this.getInternalText(option);
    	
        try {
            if (optionElement.label !== option.label || optionElement.label !== internalText) {
                optionElement.label = option.label || internalText;
            }
        } catch (e) {
            
            optionElement.label = option.label || internalText;
        }

    	
    	if (optionElement.value !== option.value) {
    		optionElement.value = option.value;
    		if ($A.util.isUndefined(option.value)) {
    			$A.warning("Option with label '" + option.label + "' in select component " + cmp.getGlobalId() + " has an undefined value.");
    		}
    	}

    	
        var optionClass = option["class"];
    	if (!$A.util.isEmpty(optionClass) && optionElement.getAttribute("class") !== optionClass) {
    		optionElement.setAttribute("class", optionClass);
    	}

    	
    	if (optionElement.selected !== option.selected) {
	    	optionElement.selected = option.selected ? "selected" : undefined;
	    }

    	
    	if (optionElement.disabled !== option.disabled) {
	    	optionElement.disabled = option.disabled ? "disabled" : undefined;
	    }

    	
    	if (optionElement.textContent !== internalText) {
    		$A.util.setText(optionElement, internalText);
    	}

    	return optionElement;
    },
    "getInternalText":function(option) {
    	return ($A.util.isEmpty(option.label) ? option.value : option.label) || '';
    }
  },
  "renderer":{
    "afterRender":function(cmp, helper) {
        cmp.superAfterRender();

        var options = cmp.get("v.options");
        options = $A.util.isUndefinedOrNull(options) ? [] : options;

        if (!cmp.get("v.useMenu")) {
            var selectElement = cmp.find("select").getElement();

            
            if (cmp.get("v.multiple")) {
                selectElement.setAttribute("multiple", true);
            }

            if (!$A.util.isEmpty(options) || $A.util.isEmpty(cmp.get("v.body"))) {
                var optionElements = helper.renderOptions(cmp, options);
                selectElement.appendChild(optionElements);
            }
        }
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        var options = cmp.get("v.options");

        if (!cmp.get("v.useMenu") && (!$A.util.isEmpty(options) || $A.util.isEmpty(cmp.get("v.body")))) {

            var selectCmp = cmp.find("select");
            
            if (selectCmp.isValid() && selectCmp.isRendered()) {
                var select = selectCmp.getElement();
                var optionElements = select.children;

                
                while (optionElements.length > options.length) {
                    select.removeChild(optionElements[options.length]);
                }

                
                var index = 0;
                while (index < optionElements.length) {
                    helper.updateOptionElement(cmp, options[index], optionElements[index]);
                    index++;
                }

                
                if (index < options.length) {
                    var newElements = helper.renderOptions(cmp, options.slice(index));

                    select.appendChild(newElements);
                }
            }
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputSelect",
  "st":{
    "descriptor":"css://ui.inputSelect",
    "cl":"uiInputSelect"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["options","aura://List","G",false,[]],
    ["name","aura://String","I",false],
    ["multiple","aura://Boolean","G",false,false],
    ["size","aura://Integer","PP",false,{
      "exprType":"FUNCTION",
      "code":"function(cmp, fn) { return (cmp.get(\"v.multiple\")?7:1); }",
      "args":[
        {
          "exprType":"PROPERTY",
          "byValue":false,
          "target":"ui:inputSelect",
          "path":"v.multiple"
        }
      ],
      "byValue":false
    }],
    ["useMenu","aura://Boolean","I",false,false],
    ["selectedLabel","aura://String","p",false],
    ["renderBody","aura://Boolean","p",false,false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    },
    {
      "name":"ui:setFocus",
      "xs":"I",
      "action":"{!c.setFocus}"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.valueChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.value"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.optionsChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.options"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"useSpanLabel",
      "value":{
        "exprType":"PROPERTY",
        "byValue":false,
        "target":"ui:inputSelect",
        "path":"v.useMenu"
      }
    },
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:if"
          },
          "attributes":{
            "values":{
              "isTrue":{
                "descriptor":"isTrue",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputSelect",
                  "path":"v.useMenu"
                }
              },
              "else":{
                "descriptor":"else",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"select",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" select\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:inputSelect",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            },
                            "size":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.size"
                            },
                            "name":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.name"
                            },
                            "aria-describedby":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.ariaDescribedBy"
                            },
                            "disabled":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.disabled"
                            },
                            "multiple":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.multiple"
                            },
                            "id":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputSelect",
                              "path":"v.domId"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"select"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"v.renderBody"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:inputSelect",
                                                "path":"v.body"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:menu"
                    },
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputSelect",
                            "path":"v.class"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:menuTriggerLink"
                              },
                              "localId":"selectTrigger",
                              "attributes":{
                                "values":{
                                  "class":{
                                    "descriptor":"class",
                                    "value":"select"
                                  },
                                  "label":{
                                    "descriptor":"label",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"v.selectedLabel"
                                    }
                                  },
                                  "ariaDescribedBy":{
                                    "descriptor":"ariaDescribedBy",
                                    "value":{
                                      "exprType":"FUNCTION",
                                      "code":"function(cmp, fn) { return fn.join(\" \",fn.add(cmp.get(\"v.domId\"),\"-label\"),cmp.get(\"v.ariaDescribedBy\")); }",
                                      "args":[
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:inputSelect",
                                          "path":"v.domId"
                                        },
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:inputSelect",
                                          "path":"v.ariaDescribedBy"
                                        }
                                      ],
                                      "byValue":false
                                    }
                                  },
                                  "ariaRequired":{
                                    "descriptor":"ariaRequired",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"v.required"
                                    }
                                  },
                                  "disabled":{
                                    "descriptor":"disabled",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"v.disabled"
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:menuList"
                              },
                              "localId":"options",
                              "flavor":"default,left,short",
                              "attributes":{
                                "values":{
                                  "class":{
                                    "descriptor":"class",
                                    "value":"select-options"
                                  },
                                  "menuExpand":{
                                    "descriptor":"menuExpand",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"c.menuOpened"
                                    }
                                  },
                                  "attachToBody":{
                                    "descriptor":"attachToBody",
                                    "value":true
                                  },
                                  "triggerTypeAhead":{
                                    "descriptor":"triggerTypeAhead",
                                    "value":true
                                  },
                                  "menuSelect":{
                                    "descriptor":"menuSelect",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelect",
                                      "path":"c.menuOptionSelected"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, select",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputSelectOption", (function (){/*$A.componentService.addComponentClass("markup://ui:inputSelectOption",function() {
return {
  "meta":{
    "name":"ui$inputSelectOption",
    "extends":"markup://aura:component"
  },
  "helper":{
    "DATA_UID_KEY":"data-interactive-uid",
    "domEventMap":{

    },
    "interactiveUid":1,
    "addDomEvents":function(component) {
        var events = this.getHandledDOMEvents(component);
        
        var concrete = component.getConcreteComponent();
        var helper = concrete.helper || this;
        for (var event in events) {
            helper.addDomHandler(component, event);
        }
    },
    "addDomHandler":function(component, event) {
        var element = component.getElement();
        if (element === null) {
            $A.warning("Can't add handler to component because didn't have valid html element. Component was " + JSON.stringify(component));
            return ;
        }
        var elementId = this.getUid(element) || this.newUid(element);

        var handler = $A.getCallback(this.domEventHandler);
        $A.util.on(element, event, handler);

        
        
        
        if(!this.domEventMap[elementId]) {
        	this.domEventMap[elementId] = {};
        }

        
        var existing = this.domEventMap[elementId][event];
        if(existing) {
        	
        	$A.util.removeOn(element, event, existing);
        }

        this.domEventMap[elementId][event] = handler;
    },
    "getUid":function(element) {
        return element ? element.getAttribute(this.DATA_UID_KEY) : null;
    },
    "newUid":function(element) {
        var nextUid = ++this.interactiveUid;
        element.setAttribute(this.DATA_UID_KEY, nextUid);
        return nextUid;
    },
    "removeDomEventsFromMap":function(component) {
        var element = component.getElement();
        if (!element) {
            return;
        }

        var elementId = this.getUid(element);

        
        if(elementId && this.domEventMap.hasOwnProperty(elementId)) {
            var eventHandlers = this.domEventMap[elementId];
            for (var event in eventHandlers) {
                var existing = eventHandlers[event];
                if(existing) {
                    $A.util.removeOn(element, event, existing);
                }
            }

            delete this.domEventMap[elementId];
        }
    },
    "domEventHandler":function(event) {
        var element = event.currentTarget || event.target;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);

        
        if (!htmlCmp) {
            return;
        }

        var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
        var helper = component.helper;

        if (!helper || component._recentlyClicked) {
            return;
        }

        
        if (helper.preEventFiring) {
            helper.preEventFiring(component, event);
        }

        
        if (helper.fireEvent) {
            helper.fireEvent(component, event, helper);
        }

        if (event.type === "click" && component.isInstanceOf("ui:doubleClicks") && component.get("v.disableDoubleClicks")) {
        	component._recentlyClicked = true;
        	window.setTimeout(function() { component._recentlyClicked = false; }, 350);
        }
    },
    "fireEvent":function(component, event, helper) {
    	 
    	 
    	 if(component.isValid()) {
	        var e = component.getEvent(event.type);
	        helper.setEventParams(e, event);
	        e.setComponentEvent();
	        e.fire();
    	 }
     },
    "getDomEvents":function(component) {
        return component.getDef().getAllEvents();
    },
    "getHandledDOMEvents":function(component) {
        var ret = {};
        var handledEvents = component.getHandledEvents();
        var domEvents = this.getDomEvents(component);

        if(domEvents){
            for(var i=0,len=domEvents.length; i<len; i++){
                var eventName = domEvents[i].toLowerCase();
                if (handledEvents[eventName]) {
                    ret[eventName] = true;
                }
            }
        }
        return ret;
    },
    "preEventFiring":function() {
    },
    "setEventParams":function(e, DOMEvent) {
        
        var attributeDefs = e.getDef().getAttributeDefs().getNames();
        var attribute;
        var params = {};
        for (var c=0,length=attributeDefs.length;c<length;c++) {
            attribute = attributeDefs[c];
            if (attribute === "domEvent") {
                params[attribute] = DOMEvent;
            } else if (attribute === "keyCode") { 
                params[attribute] = DOMEvent.which || DOMEvent.keyCode;
            } else {
                params[attribute] = DOMEvent[attribute];
            }
        }
        e.setParams(params);
    },
    "setDisabled":function(component, disabled, disabledCss) {
        component.set('v.disabled', disabled);
        if (disabledCss) {
            if(disabled){
                $A.util.addClass(component.getElement(),disabledCss);
            }else{
                $A.util.removeClass(component.getElement(), disabledCss);
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.addDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.addDomEvents(component);
        return component.superRerender();
    },
    "unrender":function(component, helper) {
        helper.removeDomEventsFromMap(component);
        return component.superUnrender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputSelectOption",
  "st":{
    "descriptor":"css://ui.inputSelectOption",
    "cl":"uiInputSelectOption"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["name","aura://String","G",false],
    ["label","aura://String","G",false],
    ["value","aura://Boolean","G",false,false],
    ["text","aura://String","G",false],
    ["disabled","aura://Boolean","G",false,false],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","I",false,""],
    ["visible","aura://Boolean","I",false,true]
  ],
  "i":[
    "markup://ui:inputBaseOption"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"inputSelectOption",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSelectOption",
                    "path":"v.class"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSelectOption",
                    "path":"v.text"
                  },
                  "selected":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSelectOption",
                    "path":"v.value"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSelectOption",
                    "path":"v.disabled"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"option"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return fn.empty(cmp.get(\"v.label\")); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:inputSelectOption",
                                "path":"v.label"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "else":{
                          "descriptor":"else",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelectOption",
                                      "path":"v.label"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputSelectOption",
                                      "path":"v.text"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputText", (function (){/*$A.componentService.addComponentClass("markup://ui:inputText",function() {
return {
  "meta":{
    "name":"ui$inputText",
    "extends":"markup://ui:input"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputText",
  "st":{
    "descriptor":"css://ui.inputText",
    "cl":"uiInputText"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"txt",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputText",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "size":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.size"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.value"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.maxlength"
                  },
                  "type":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.type"
                  },
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.disabled"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputText",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:datePickerGrid", (function (){/*$A.componentService.addComponentClass("markup://ui:datePickerGrid",function() {
return {
  "meta":{
    "name":"ui$datePickerGrid",
    "extends":"markup://aura:component"
  },
  "controller":{
    "focus":function(component, event, helper) {
        helper.focusDate(component, helper.getHighlightedDate(component));
    },
    "changeCalendar":function(component, event, helper) {
        var params = event.getParam('arguments');
        helper.changeMonthYear(component, params.monthChange, params.yearChange, 1);
    },
    "dateCellSelected":function(component, event, helper) {
        helper.handleDateCellSelected(component, event.getParam("value"));
    },
    "selectToday":function(component, event, helper) {
        helper.handleDateCellSelected(component, component.get("v._today"));
    },
    "setSelectedDate":function(component, event, helper) {
        var selectedDate = event.getParam('arguments').selectedDate;
        helper.selectDate(component, selectedDate);
    },
    "highlightRange":function(component, event, helper) {
        var params = event.getParam('arguments');
        helper.highlightRange(component, params.rangeStart, params.rangeEnd, params.highlightClass);
    }
  },
  "helper":{
    "NUM_COLUMNS":7,
    "NUM_ROWS":6,
    "FORMAT":"YYYY-MM-DD",
    "initializeGrid":function(component, todayString) {
        var initialDate = new Date();
        var value = component.get("v.selectedDate");

        if (!$A.util.isEmpty(value)) {
            initialDate = this.getDateFromString(value);
        } else if (todayString) {
            initialDate = this.getDateFromString(todayString);
        }
        this.setCalendarAttributes(component, initialDate);
        this.updateTitle(component, initialDate.getMonth(), initialDate.getFullYear());
        component.set("v._today", todayString);

        
        this.localizeToday(component);
    },
    "setCalendarAttributes":function(component, date) {
        component.set("v.date", date.getDate());
        component.set("v.month", date.getMonth());
        component.set("v.year", date.getFullYear());
    },
    "localizeToday":function(component) {
        if (component.get("v.showToday")) {
            var todayLabel = $A.get("$Locale.labelForToday");
            if (!todayLabel) {
                todayLabel = "Today";
            }
            $A.util.setText(component.find("today").getElement(), todayLabel);
        }
    },
    "changeMonthYear":function(component, monthChange, yearChange, date) {
        var targetDate = new Date(
            component.get("v.year") + yearChange,
            component.get("v.month") + monthChange,
            date);

        var daysInMonth =  this.daysInMonth(targetDate.getFullYear(), targetDate.getMonth());
        if (daysInMonth < date) { 
            targetDate.setDate(daysInMonth);
        }
        this.changeRenderedCalendar(component, targetDate);
    },
    "changeRenderedCalendar":function(component, newDate) {
        this.setCalendarAttributes(component, newDate);
        this.updateTitle(component, newDate.getMonth(), newDate.getFullYear());
        this.updateCalendar(component);
    },
    "highlightRange":function(component, rangeStart, rangeEnd, highlightClass) {
        component.set("v.rangeStart", rangeStart);
        component.set("v.rangeEnd", rangeEnd);
        component.set("v.highlightClass", highlightClass);
        this.updateCalendar(component);
    },
    "createCalendarHeader":function(component) {
        var weekdayLabels = this.getNameOfWeekDays();
        var headerElement = component.find("tableHead").getElement();
        var trElement = $A.util.createHtmlElement("tr");
        for (var j = 0; j < this.NUM_COLUMNS; j++) {
            var thElement = $A.util.createHtmlElement("th", {
                "scope": "col",
                "class": "dayOfWeek"
            });
            var textNode = document.createTextNode(weekdayLabels[j].shortName);
            $A.util.appendChild(textNode, thElement);
            $A.util.appendChild(thElement, trElement);
        }
        $A.util.clearNode(headerElement);
        $A.util.appendChild(trElement, headerElement);
    },
    "createCalendarBody":function(component) {
        var cellAttributes = this.calculateCellAttributes(component);

        var calendarBody = [];

        var f = function (createdComponents) {
            this.addRowComponents(component, createdComponents, calendarBody);
        }.bind(this);

        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = cellAttributes[i];
            var rowComponents = [];
            var rowClass;

            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var dateCellAttributes = weekCells[j];
                var dateCellConfig = ["markup://ui:dayInMonthCell", dateCellAttributes];
                rowComponents.push(dateCellConfig);

                rowClass = dateCellAttributes["trClass"];
            }

            var rowConfig = {
                "tag": "tr",
                "aura:id": "calRow" + (i + 1),
                "HTMLAttributes": {"class": "calRow " + rowClass}
            };
            var rowComp = ["markup://aura:html", rowConfig];
            rowComponents.unshift(rowComp);

            $A.componentService.createComponents(rowComponents, f);
        }
        component.set("v.gridBody", calendarBody);
    },
    "addRowComponents":function(component, rowComponents, calendarBody) {
        var trNode = rowComponents[0];
        trNode.set("v.body", rowComponents.splice(1));
        calendarBody.push(trNode);
    },
    "updateCalendar":function(component) {
        if (!component._calendarCreated) {
            return;
        }

        var cellAttributes = this.calculateCellAttributes(component);

        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = cellAttributes[i];
            var rowComponent = component.find("calRow" + (i + 1));
            var rowClass;
            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var dateCellAttributes = weekCells[j];
                var cellId = dateCellAttributes["aura:id"];
                var dateCellCmp = component.find(cellId);

                if (dateCellCmp) {
                    dateCellCmp.updateCell(dateCellAttributes);
                }
                rowClass = dateCellAttributes["trClass"];
            }

            
            $A.util.removeClass(rowComponent.getElement(), "has-multi-row-selection");
            if (!$A.util.isEmpty(rowClass)) {
                $A.util.addClass(rowComponent.getElement(), rowClass);
            }
        }
    },
    "calculateCellAttributes":function(component) {
        var dayOfMonth = component.get("v.date");
        var month = component.get("v.month");
        var year = component.get("v.year");
        
        
        var renderedDate = new Date(year, month, dayOfMonth);

        var selectedDate = this.getDateFromString(component.get("v.selectedDate"));
        if (!selectedDate) {
            selectedDate = renderedDate;
        }
        var rangeStart = this.getDateFromString(component.get("v.rangeStart"));
        var rangeEnd = this.getDateFromString(component.get("v.rangeEnd"));
        var hasRange = rangeStart && rangeEnd;
        var highlightClass = component.get("v.highlightClass");
        if ($A.util.isEmpty(highlightClass)) {
            highlightClass = "highlight";
        }

        var today = this.getToday(component);
        var date = this.getCalendarStartDate(component, month, year);
        var isSelectedDayInView = selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

        var calendarCells = [];
        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = [];
            var trClassName = "";
            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var classList = ["slds-day"];
                var tdClassList = [];

                var dayOfWeek = date.getDay();
                var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                if (isWeekend) {
                    classList.push("weekend");
                } else {
                    classList.push("weekday");
                }

                var isPreviousMonth = date.getMonth() === month - 1 || date.getFullYear() === year - 1;
                var isNextMonth = date.getMonth() === month + 1 || date.getFullYear() === year + 1;
                if (isPreviousMonth) {
                    classList.push("prevMonth");
                    tdClassList.push("slds-disabled-text");
                } else if (isNextMonth) {
                    tdClassList.push("slds-disabled-text");
                    classList.push("nextMonth");
                }

                var isToday = this.dateEquals(date, today);
                if (isToday) {
                    classList.push("todayDate");
                    tdClassList.push("slds-is-today");
                }

                var isSelectedDate = this.dateEquals(date, selectedDate);
                if (isSelectedDate) {
                    classList.push("selectedDate");
                    tdClassList.push("slds-is-selected");
                }

                var isInHighlightRange = hasRange && this.dateInRange(date, rangeStart, rangeEnd);
                if (isInHighlightRange) {
                    classList.push(highlightClass);

                    if (!isSelectedDate) { 
                        tdClassList.push("slds-is-selected");
                    }

                    if (!this.dateEquals(rangeStart, rangeEnd)) {
                        tdClassList.push("is-selected-multi");
                        trClassName = "has-multi-row-selection";
                    }

                    if (this.dateEquals(date, rangeStart)) {
                        classList.push("start-date");
                    } else if (this.dateEquals(date, rangeEnd)) {
                        classList.push("end-date");
                    }
                }

                var isFirstDayOfMonth = date.getMonth() === month && date.getDate() === 1;
                var tabIndex = isSelectedDate || (!isSelectedDayInView & isFirstDayOfMonth) ? 0 : -1;

                var dateCellAttributes = {
                    "aura:id": (7 * i + j),
                    "tabIndex": tabIndex,
                    "ariaSelected": isSelectedDate,
                    "value": $A.localizationService.formatDate(date, this.FORMAT),
                    "label": date.getDate(),
                    "class": classList.join(" "),
                    "tdClass": tdClassList.join(" "),
                    "trClass": trClassName,
                    "selectDate": component.getReference("c.dateCellSelected")
                };

                weekCells.push(dateCellAttributes);
                date.setDate(date.getDate() + 1);
            }

            calendarCells.push(weekCells);
        }
        return calendarCells;
    },
    "goToFirstOfMonth":function(component, highlightedDate) {
        highlightedDate.setDate(1);
        this.focusDate(component, highlightedDate);
        component.set("v.date", highlightedDate.getDate());
    },
    "goToLastOfMonth":function(component, highlightedDate) {
        highlightedDate.setMonth(highlightedDate.getMonth() + 1);
        highlightedDate.setDate(0);
        this.focusDate(component, highlightedDate);
        component.set("v.date", highlightedDate.getDate());
    },
    "handlePageKey":function(component, highlightedDate, deltaMonth, deltaYear) {
        this.changeMonthYear(component, deltaMonth, deltaYear, highlightedDate.getDate());
        this.focusDate(component, this.getHighlightedDate(component));
    },
    "handleArrowKey":function(component, highlightedDate, deltaDays) {
        var currentYear = component.get("v.year");
        var currentMonth = component.get("v.month");
        highlightedDate.setDate(highlightedDate.getDate() + deltaDays);

        if (highlightedDate.getFullYear() !== currentYear || highlightedDate.getMonth() !== currentMonth) {
            this.changeRenderedCalendar(component, highlightedDate);
        } else {
            component.set("v.date", highlightedDate.getDate());
        }

        this.focusDate(component, highlightedDate);
    },
    "fireHideEvent":function(component) {
        component.get("e.hide").fire();
    },
    "setKeyboardEventHandlers":function(component) {
        var el = component.find("tableBody").getElement();
        $A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
    },
    "removeKeyboardEventHandlers":function(component) {
        var el = component.find("tableBody").getElement();
        $A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
        delete component._keyboardEventHandler;
    },
    "getKeyboardInteractionHandler":function(component) {
        if (!component._keyboardEventHandler) {
            component._keyboardEventHandler = function (domEvent) {
                var keyCode = domEvent.keyCode;
                var shiftKey = domEvent.shiftKey;
                var currentDateString = domEvent.target.getAttribute("data-datevalue");

                
                if (!currentDateString) {
                    if (keyCode === 9 && shiftKey !== true) { 
                        this.fireHideEvent(component);
                    } else if (keyCode === 32 || keyCode === 13) { 
                        domEvent.preventDefault();
                        this.handleKeyboardSelect(component, component.get("v._today"));
                    } else if (keyCode === 27) { 
                        domEvent.stopPropagation();
                        this.fireHideEvent(component);
                    }
                    return;
                }

                var currentDate = this.getDateFromString(currentDateString);
                

                if (keyCode === 39) {  
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, 1);
                } else if (keyCode === 37) { 
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, -1);
                } else if (keyCode === 38) { 
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, -7);
                } else if (keyCode === 40) { 
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, 7);
                } else if (keyCode === 9 && shiftKey !== true) { 
                    if (!component.get("v.hasTime") && !component.get("v.showToday")) {
                        this.fireHideEvent(component);
                    }
                } else if (keyCode === 33 && shiftKey === true) { 
                    this.handlePageKey(component, currentDate, 0, -1);
                } else if (keyCode === 34 && shiftKey === true) { 
                    this.handlePageKey(component, currentDate, 0, 1);
                } else if (keyCode === 32 || keyCode === 13) { 
                    domEvent.preventDefault();
                    this.handleKeyboardSelect(component, currentDateString);
                } else if (keyCode === 36) { 
                    domEvent.stopPropagation();
                    this.goToFirstOfMonth(component, currentDate);
                } else if (keyCode === 35) { 
                    domEvent.stopPropagation();
                    this.goToLastOfMonth(component, currentDate);
                } else if (keyCode === 33 && shiftKey !== true) { 
                    this.handlePageKey(component, currentDate, -1, 0);
                } else if (keyCode === 34 && shiftKey !== true) { 
                    this.handlePageKey(component, currentDate, 1, 0);
                } else if (keyCode === 27) { 
                    domEvent.stopPropagation();
                    this.fireHideEvent(component);
                }
            }.bind(this);
        }
        return component._keyboardEventHandler;
    },
    "handleKeyboardSelect":function(component, selectedDateString) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime === true) {
            return;
        }
        this.handleDateCellSelected(component, selectedDateString);
    },
    "handleDateCellSelected":function(component, selectedDate) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime !== true) {
            
            component.getEvent("selectDate").fire({
                "value": selectedDate
            });
        }

        this.selectDate(component, selectedDate);
    },
    "selectDate":function(component, newSelectedDate) {
        var currentSelectedDate = this.getDateFromString(component.get("v.selectedDate"));
        var newDate = this.getDateFromString(newSelectedDate);

        if (!newDate) {
            return;
        }

        var change = this.getChangeInMonthYear(component, newDate);
        var monthChange = change[0], yearChange = change[1];
        var hasDifferentMonthOrYear = monthChange !== 0 || yearChange !== 0;

        if (this.dateEquals(currentSelectedDate, newDate) && !hasDifferentMonthOrYear) {
            return;
        }
        component.set("v.selectedDate", newSelectedDate);

        if (hasDifferentMonthOrYear) {
            this.changeMonthYear(component, monthChange, yearChange, newDate.getDate());
            return;
        }

        component.set("v.date", newDate.getDate());
        this.updateCalendar(component);
    },
    "focusDate":function(component, date) {
        var cellCmp = this.findDateComponent(component, date);
        if (cellCmp && cellCmp.isRendered()) {
            cellCmp.getElement().focus();
        }
    },
    "findDateComponent":function(component, date) {
        var startDatePos = component._startDateId;
        var dateId = startDatePos + date.getDate() - 1;
        return component.find(dateId);
    },
    "updateTitle":function(component, month, year) {
        component.get("e.updateCalendarTitle").fire({month: month, year: year});
    },
    "getNameOfWeekDays":function() {
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; 
        var namesOfWeekDays = $A.get("$Locale.nameOfWeekdays");
        var days = [];
        if ($A.util.isNumber(firstDayOfWeek) && $A.util.isArray(namesOfWeekDays)) {
            for (var i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
                days.push(namesOfWeekDays[i]);
            }
            for (var j = 0; j < firstDayOfWeek; j++) {
                days.push(namesOfWeekDays[j]);
            }
        } else {
            days = namesOfWeekDays;
        }
        return days;
    },
    "createCalendar":function(component) {
        component._calendarCreated = false;
        $A.localizationService.getToday($A.get("$Locale.timezone"), function (dateString) {
            if (component.isValid()) {
                this.initializeGrid(component, dateString);
                this.createCalendarBody(component);
                this.createCalendarHeader(component);
                component._calendarCreated = true;
            }
        }.bind(this));
    },
    "getToday":function(component) {
        var todayString = component.get("v._today");
        if (todayString) {
            return this.getDateFromString(todayString);
        }
        return new Date();
    },
    "getHighlightedDate":function(component) {
        var currentYear = component.get("v.year");
        var currentMonth = component.get("v.month");
        var currentDate = component.get("v.date");

        return new Date(currentYear, currentMonth, currentDate);
    },
    "getChangeInMonthYear":function(component, newDate) {
        var currentDate = new Date(component.get("v.year"), component.get("v.month"), 1);

        return [
            newDate.getMonth() - currentDate.getMonth(),
            newDate.getFullYear() - currentDate.getFullYear()
        ];
    },
    "getCalendarStartDate":function(component, month, year) {
        var startDate = new Date(year, month, 1);

        
        
        
        
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; 

        var startDay = startDate.getDay();
        var startDateId = 0;
        while (startDay !== firstDayOfWeek) {
            startDate.setDate(startDate.getDate() - 1);
            startDay = startDate.getDay();
            startDateId++;
        }
        component._startDateId = startDateId;
        return startDate;
    },
    "getDateFromString":function(date) {
        return $A.localizationService.parseDateTime(date, this.FORMAT);
    },
    "dateEquals":function(date1, date2) {
        return $A.localizationService.isSame(date1, date2, "day");
    },
    "dateInRange":function(date, rangeStart, rangeEnd) {
        return $A.localizationService.isBetween(date, rangeStart, rangeEnd, "day");
    },
    "isLeapYear":function(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },
    "daysInMonth":function(year, month) {
        return month === 1 ? (this.isLeapYear(year) ? 29 : 28) : (31 - month % 7 % 2);
    }
  },
  "renderer":{
    "render":function(component, helper) {
        var ret = component.superRender();
        helper.createCalendar(component);
        return ret;
    },
    "afterRender":function(component, helper) {
        helper.setKeyboardEventHandlers(component);
        return component.superAfterRender();
    },
    "unrender":function(component, helper) {
        try {
            helper.removeKeyboardEventHandlers(component);
        } finally {
            return component.superUnrender();
        }
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:datePickerGrid",
  "st":{
    "descriptor":"css://ui.datePickerGrid",
    "cl":"uiDatePickerGrid"
  },
  "fst":{
    "descriptor":"css://ui.datePickerGrid"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","I",false],
    ["hasTime","aura://Boolean","I",false,false],
    ["date","aura://Integer","I",false],
    ["month","aura://Integer","I",false],
    ["year","aura://Integer","I",false],
    ["selectedDate","aura://String","I",false],
    ["_today","aura://String","I",false],
    ["gridBody","aura://Aura.Component[]","I",false,[]],
    ["showToday","aura://Boolean","I",false,true],
    ["rangeStart","aura://String","I",false],
    ["rangeEnd","aura://String","I",false],
    ["highlightClass","aura://String","I",false,"highlight"]
  ],
  "med":[
    {
      "name":"ui:highlightRange",
      "xs":"I",
      "attributes":[
        ["rangeStart","aura://String","I",false],
        ["rangeEnd","aura://String","I",false],
        ["highlightClass","aura://String","I",false]
      ]
    },
    {
      "name":"ui:setSelectedDate",
      "xs":"I",
      "attributes":[
        ["selectedDate","aura://String","I",false]
      ]
    },
    {
      "name":"ui:selectToday",
      "xs":"I"
    },
    {
      "name":"ui:focus",
      "xs":"I"
    },
    {
      "name":"ui:changeCalendar",
      "xs":"I",
      "attributes":[
        ["monthChange","aura://Integer","I",false],
        ["yearChange","aura://Integer","I",false]
      ]
    }
  ],
  "re":[
    {
      "ed":"markup://ui:updateCalendarTitle",
      "n":"updateCalendarTitle",
      "xs":"I"
    },
    {
      "ed":"markup://ui:change",
      "n":"hide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:selectDate",
      "n":"selectDate",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:datePickerGrid",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"datePickerGrid",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"calGrid",
                            "aria-multiselectable":"true",
                            "role":"grid"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"table"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"tableHead",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{

                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"thead"
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"tableBody",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{

                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"tbody"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:datePickerGrid",
                                                "path":"v.gridBody"
                                              }
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:if"
                                        },
                                        "attributes":{
                                          "values":{
                                            "isTrue":{
                                              "descriptor":"isTrue",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:datePickerGrid",
                                                "path":"v.showToday"
                                              }
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{

                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"tr"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "colspan":"7",
                                                                    "role":"gridcell",
                                                                    "tabindex":"0",
                                                                    "onclick":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:datePickerGrid",
                                                                      "path":"c.selectToday"
                                                                    }
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"td"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "localId":"today",
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"today slds-show--inline-block slds-text-link slds-p-bottom--x-small"
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"span"
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputText", (function (){/*$A.componentService.addComponentClass("markup://ui:outputText",function() {
return {
  "meta":{
    "name":"ui$outputText",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib"
    }
  },
  "helper":{
    "appendTextElements":function(textValue, containerEl) {
		
		if (!containerEl) {
			return;
		}
	
		if (typeof textValue === 'number') {
			containerEl.appendChild(document.createTextNode(textValue));
		} else	if (typeof textValue === 'string' && textValue.length > 0) {			
			textValue = textValue.replace(/(\r\n|\r|(\\r\\n)|\\r|\\n)/g, '\n');
			
			var wildCard = '*';
			var regex = new RegExp("[^\\n]." + wildCard + "|\\n", "g");			
			var parts = textValue.match(regex);
			
			if (textValue === '\n') {
				containerEl.appendChild(document.createElement('br'));
			} else if (!parts || parts.length === 1) {
				containerEl.appendChild(document.createTextNode(textValue));
			} else {
				var len = parts.length;
				for (var i=0; i< len; i++) {
					if (parts[i] === '\n') {
						containerEl.appendChild(document.createElement('br'));
					} else {
						containerEl.appendChild(document.createTextNode(parts[i]));
					}					
				}
			}			
		} else {
			containerEl.appendChild(document.createTextNode(''));
		}
	},
    "removeChildren":function(element) {
		if (element && element.nodeType === 1) {
			var child = element.firstChild, nextChild;
	
			while (child) {
			    nextChild = child.nextSibling;		    
			    $A.util.removeElement(child);		    
			    child = nextChild;
			}
		}
	}
  },
  "renderer":{
    "render":function(cmp, helper) {
        var value = cmp.get('v.value');     
        var ret = cmp.superRender();       
        var span = cmp.find('span').getElement();
        
        helper.appendTextElements(value, span);
        
        return ret;     
    },
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(cmp, helper) {       
        if (cmp.isDirty("v.value")) {
            var span = cmp.find('span').getElement();
            helper.removeChildren(span);
            
            var value = cmp.get('v.value');        

            helper.appendTextElements(value, span);
        }
        cmp.superRerender();
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputText",
  "st":{
    "descriptor":"css://ui.outputText",
    "cl":"uiOutputText"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["title","aura://String","G",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputText",
                    "path":"v.class"
                  },
                  "title":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputText",
                    "path":"v.title"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:timePicker", (function (){/*$A.componentService.addComponentClass("markup://ui:timePicker",function() {
return {
  "meta":{
    "name":"ui$timePicker",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(component) {
		var hourError = component.find("hourError");
		var minError = component.find("minuteError");

		component.find("hours").set("v.ariaDescribedBy", hourError.getGlobalId());
		component.find("minutes").set("v.ariaDescribedBy", minError.getGlobalId());
	},
    "updateAmpm":function(component, event, helper) {
    	var amPmCmp = component.find("ampm");
        var isAndroid = $A.get("$Browser.isAndroid");
        if (isAndroid === true) { 
        	                      
            var hoursCmp = component.find("hours");
            var currentHourValue = hoursCmp.getElement().value;
            hoursCmp.set("v.value", currentHourValue);
            if (helper.validateHours(component)) {
                if (amPmCmp) { 
                    var hourValue = parseInt(currentHourValue);
                    if (hourValue === 12) {
                        
                        
                        hourValue = 0;
                    }
                    if (amPmCmp.get("v.value") === "am") {
                        component.set("v.hours", hourValue);
                    } else {
                        component.set("v.hours", hourValue + 12);
                    }
                }
                component.set("v.isValid", true);
            } else {
            	component.set("v.isValid", false);
            }
            return;
        }

        if (component.get("v.isValid") === true) {
            var hours = component.get("v.hours");
            if (amPmCmp) {
                if (amPmCmp.get("v.value") === "am") {
                    component.set("v.hours", parseInt(hours) - 12);
                } else {
                    component.set("v.hours", parseInt(hours) + 12);
                }
            }
        }
    },
    "updateHours":function(component, event, helper) {
        if (helper.validateHours(component)) {
            var hoursCmp = event.getSource();
            if (hoursCmp) {
                helper.updateHourValue(component, hoursCmp.get("v.value"));
                component.set("v.isValid", true);
                return;
            }
        }
        component.set("v.isValid", false);
    },
    "updateMinutes":function(component, event, helper) {
        if (helper.validateMinutes(component)) {
            var minutesCmp = event.getSource();
            if (minutesCmp) {
                helper.updateMinuteValue(component, minutesCmp.get("v.value"));
                component.set("v.isValid", true);
                return;
            }
        }
        component.set("v.isValid", false);
    }
  },
  "helper":{
    "convertFrom24To12":function(component, hours) {
        var amPmCmp = component.find("ampm");
        if (amPmCmp) {
            if (hours === 0) { 
                amPmCmp.set("v.value", "am");
                return 12;
            } else if (hours === 12) { 
                amPmCmp.set("v.value", "pm");
                return 12;
            }
            amPmCmp.set("v.value", hours > 12 ? "pm" : "am");
            return hours % 12;
        }
        return hours;
    },
    "localizeAmpmLabel":function(component) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        if (is24HourFormat === false) {
            
            var dayPeriodLabels = this.getLocalizedDayPeriodLabels();

            var amOptCmp = component.find("amOpt");
            if (amOptCmp && dayPeriodLabels["am"]) {
                amOptCmp.set("v.label", dayPeriodLabels["am"]);
            }

            var pmOptCmp = component.find("pmOpt");
            if (pmOptCmp && dayPeriodLabels["pm"]) {
                pmOptCmp.set("v.label", dayPeriodLabels["pm"]);
            }
        }
    },
    "getLocalizedDayPeriodLabels":function() {
        if (this.localizedDayPeriodLabels) {
            return this.localizedDayPeriodLabels;
        }

        this.localizedDayPeriodLabels = {};
        var locale = $A.get("$Locale.langLocale").replace("_", "-");

        
        var amDate = new Date(Date.UTC(2012, 11, 20, 11, 11, 0));
        var amLabel = this.getLocalizedDayPeriodLabelByDate(amDate, locale);
        if (amLabel) {
            this.localizedDayPeriodLabels["am"] = amLabel;
        }

        var pmDate = new Date(Date.UTC(2012, 11, 20, 23, 11, 0));
        var pmLabel = this.getLocalizedDayPeriodLabelByDate(pmDate, locale);
        if (pmLabel) {
            this.localizedDayPeriodLabels["pm"] = pmLabel;
        }

        return this.localizedDayPeriodLabels;
    },
    "getLocalizedDayPeriodLabelByDate":function(date, locale) {
        
        var dateTimeFormatConfig = {
            'timeZone': "UTC",
            "hour12": true,
            "hour": "2-digit",
            "minute": "2-digit"
        };

        var dayPeriodLabelFormat;
        try {
            dayPeriodLabelFormat = Intl.DateTimeFormat(locale, dateTimeFormatConfig);
        } catch (e) {
            $A.warning("Failed to get day period labels for unsupported locale '" + locale + "'. " + e.message);
            return null;
        }

        if (dayPeriodLabelFormat.formatToParts) {
            var parts = dayPeriodLabelFormat.formatToParts(date);
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part["type"].toLowerCase() === "dayperiod") {
                    return part["value"];
                }
            }
        } else {
            
            var timeString = dayPeriodLabelFormat.format(date);
            
            return timeString.replace(/[\u200E\u200F]/g,'').replace(/ ?.{2}:.{2} ?/, "");
        }
    },
    "renderTime":function(component) {
        
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        var hours = component.get("v.hours");
        hours %= 24;
        if (is24HourFormat === false) {
            hours = this.convertFrom24To12(component, hours);
        }
        var hoursCmp = component.find("hours");
        if (hoursCmp) {
            hoursCmp.set("v.value", hours);
        }

        
        var minutes = component.get("v.minutes");
        minutes %= 60;
        var minutesCmp = component.find("minutes");
        if (minutesCmp) {
            minutes = minutes + '';
            if (minutes.length < 2) {
                minutes = '0' + minutes;
            }
            minutesCmp.set("v.value", minutes);
        }
    },
    "updateHourValue":function(component, hours) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        if (is24HourFormat === true) {
        	component.set("v.hours", hours);
        } else {
            var amPmCmp = component.find("ampm");
            if (amPmCmp) {
                var isPm = amPmCmp.get("v.value") === "pm";
                if (hours === 12) { 
                	component.set("v.hours", isPm ? 12 : 0);
                } else {
                	component.set("v.hours", isPm ? parseInt(hours) + 12 : hours);
                }
            }
        }
    },
    "updateMinuteValue":function(component, minutes) {
    	component.set("v.minutes", minutes);
    },
    "validateNumber":function(value, min, max) {
        var intRegex = /^\d+$/; 
        if (intRegex.test(value)) {
            var n = parseInt(value);
            return n <= max && n >= min;
        }
        return false;
    },
    "validateHours":function(component) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        var hoursCmp = component.find("hours");
        var errorCmp = component.find("hourError");
        if (hoursCmp && errorCmp) {
            var hours = hoursCmp.get("v.value");
            if (is24HourFormat === true) {
                if (this.validateNumber(hours, 0, 23)) {
                    $A.util.removeClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", null);
                    $A.util.addClass(errorCmp.getElement(), "hide");
                    return true;
                } else {
                	$A.util.addClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", ["Please input a valid hour value (0 - 23)."]);
                    $A.util.removeClass(errorCmp.getElement(), "hide");
                    return false;
                }
            } else {
                if (this.validateNumber(hours, 1, 12)) {
                    $A.util.removeClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", null);
                    $A.util.addClass(errorCmp.getElement(), "hide");
                    return true;
                } else {
                	$A.util.addClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", ["Please input a valid hour value (1 - 12)."]);
                    $A.util.removeClass(errorCmp.getElement(), "hide");
                    return false;
                }
            }
        }
        return false;
    },
    "validateMinutes":function(component) {
        var minutesCmp = component.find("minutes");
        var errorCmp = component.find("minuteError");
        if (minutesCmp && errorCmp) {
            var minutes = minutesCmp.get("v.value");
            if (this.validateNumber(minutes, 0, 59)) {
            	$A.util.removeClass(minutesCmp.getElement(), "error");
                errorCmp.set("v.class", "hide");
                errorCmp.set("v.value", null);
                return true;
            } else {
            	$A.util.addClass(minutesCmp.getElement(), "error");
                errorCmp.set("v.class", "");
                errorCmp.set("v.value", ["Please input a valid minute value (0 - 59)."]);
                return false;
            }
        }
        return false;
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        var ret = component.superAfterRender();
        helper.validateHours(component);
        helper.validateMinutes(component);
        return ret;
    },
    "render":function(component, helper) {
        helper.localizeAmpmLabel(component);
        helper.renderTime(component);
        return component.superRender();
    },
    "rerender":function(component, helper) {
        helper.localizeAmpmLabel(component);
        if ($A.util.getBooleanValue(component.get("v.isValid")) === true) {
            helper.renderTime(component);
        }
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:timePicker",
  "st":{
    "descriptor":"css://ui.timePicker",
    "cl":"uiTimePicker"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,false],
    ["hours","aura://Integer","I",false,12],
    ["is24HourFormat","aura://Boolean","I",false,true],
    ["isValid","aura://Boolean","I",false,true],
    ["minutes","aura://Integer","I",false,0]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:timePicker",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:label"
                    },
                    "attributes":{
                      "values":{
                        "labelDisplay":{
                          "descriptor":"labelDisplay",
                          "value":false
                        },
                        "label":{
                          "descriptor":"label",
                          "value":"hours"
                        },
                        "for":{
                          "descriptor":"for",
                          "value":"hours"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputText"
                    },
                    "localId":"hours",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"input-hours"
                        },
                        "type":{
                          "descriptor":"type",
                          "value":"number"
                        },
                        "change":{
                          "descriptor":"change",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:timePicker",
                            "path":"c.updateHours"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:image"
                    },
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"time-separator"
                        },
                        "src":{
                          "descriptor":"src",
                          "value":"/auraFW/resources/aura/images/time-separator.png"
                        },
                        "imageType":{
                          "descriptor":"imageType",
                          "value":"decorative"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:label"
                    },
                    "attributes":{
                      "values":{
                        "labelDisplay":{
                          "descriptor":"labelDisplay",
                          "value":false
                        },
                        "label":{
                          "descriptor":"label",
                          "value":"minutes"
                        },
                        "for":{
                          "descriptor":"for",
                          "value":"minutes"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputText"
                    },
                    "localId":"minutes",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"input-minutes"
                        },
                        "type":{
                          "descriptor":"type",
                          "value":"number"
                        },
                        "change":{
                          "descriptor":"change",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:timePicker",
                            "path":"c.updateMinutes"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return fn.ne(cmp.get(\"v.is24HourFormat\"),true); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:timePicker",
                                "path":"v.is24HourFormat"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:label"
                              },
                              "attributes":{
                                "values":{
                                  "labelDisplay":{
                                    "descriptor":"labelDisplay",
                                    "value":false
                                  },
                                  "label":{
                                    "descriptor":"label",
                                    "value":"period"
                                  },
                                  "for":{
                                    "descriptor":"for",
                                    "value":"ampm"
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:inputSelect"
                              },
                              "localId":"ampm",
                              "attributes":{
                                "values":{
                                  "class":{
                                    "descriptor":"class",
                                    "value":"ampm"
                                  },
                                  "change":{
                                    "descriptor":"change",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:timePicker",
                                      "path":"c.updateAmpm"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://ui:inputSelectOption"
                                        },
                                        "localId":"amOpt",
                                        "attributes":{
                                          "values":{
                                            "label":{
                                              "descriptor":"label",
                                              "value":"AM"
                                            },
                                            "text":{
                                              "descriptor":"text",
                                              "value":"am"
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://ui:inputSelectOption"
                                        },
                                        "localId":"pmOpt",
                                        "attributes":{
                                          "values":{
                                            "label":{
                                              "descriptor":"label",
                                              "value":"PM"
                                            },
                                            "text":{
                                              "descriptor":"text",
                                              "value":"pm"
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputDefaultError"
                    },
                    "localId":"hourError",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"hide"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputDefaultError"
                    },
                    "localId":"minuteError",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"hide"
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:renderIf", (function (){/*$A.componentService.addComponentClass("markup://aura:renderIf",function() {
return {
  "meta":{
    "name":"aura$renderIf",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(cmp) {
        var isTrue        = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        var bodyTemplate  = cmp.get("v.body");
        var elseTemplate  = cmp.get("v.else");
        var template      = cmp.get("v.template");

        if (bodyTemplate.length && !template.length) {
            template=bodyTemplate;
        }
        var facets=[template,elseTemplate];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(false);
            }
        }

        cmp.set("v.template", template, true);
        cmp.set("v.body", isTrue?template:elseTemplate, true);
    },
    "destroy":function(cmp) {
        var facets=[cmp.get("v.template"),cmp.get("v.else")];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].destroy();
            }
        }
    },
    "facetChange":function(cmp, event) {
        if(cmp.updating){
            return;
        }
        var j;
        var i;
        var facets=[event.getParam("value"), event.getParam("oldValue")];
        for(i=0;i<facets.length;i++){
            if (!$A.util.isArray(facets[i])) {
                facets[i]=[facets[i]];
            }
            for(j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(true);
            }
        }
        var isTrue = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        var bodyTemplate=cmp.get("v.body");
        var elseTemplate=cmp.get("v.else");
        var template=cmp.get("v.template");
        if(bodyTemplate!==template){
            template=bodyTemplate;
        }
        facets=[template,elseTemplate];
        for(i=0;i<facets.length;i++){
            for(j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(false);
            }
        }
        cmp.updating=true;
        cmp.set("v.body", isTrue?template:elseTemplate);
        cmp.updating=false;
    },
    "updateBody":function(cmp) {
        var isTrue = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        cmp.updating=true;
        cmp.set("v.body", isTrue?cmp.get("v.template"):cmp.get("v.else"));
        cmp.updating=false;
    }
  },
  "renderer":{
    "render":function(component) {
        var rendering = component.getRendering();
        return rendering||$A.renderingService.renderFacet(component,component.get("v.body"));
    },
    "afterRender":function(component) {
        var body = component.get("v.body");
        $A.afterRender(body);
    },
    "rerender":function(component) {
        var body = component.get("v.body");
        return $A.renderingService.rerenderFacet(component,body);
    },
    "unrender":function(component) {
        var body = component.get("v.body");
        $A.renderingService.unrenderFacet(component,body);
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:renderIf",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["isTrue","aura://Boolean","G",true],
    ["else","aura://Aura.Component[]","G",false,[]],
    ["template","aura://Aura.Component[]","p",false,[]]
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.destroy"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"destroy"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateBody"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.isTrue"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.facetChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.body"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.facetChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.else"
      },
      "n":"change"
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:unescapedHtml", (function (){/*$A.componentService.addComponentClass("markup://aura:unescapedHtml",function() {
return {
  "meta":{
    "name":"aura$unescapedHtml"
  },
  "renderer":{
    "render":function(cmp) {
        var elements=$A.util.createElementsFromMarkup(cmp.get("v.value"));
        if(!elements.length){
            elements=$A.renderingService.renderFacet(cmp,elements);
        }
        return elements;
    },
    "rerender":function(cmp) {
        if (cmp.isDirty("v.value")) {
            var el = cmp.getElement();
            var placeholder=null;
            if(el){
                placeholder = document.createTextNode("");
                $A.util.insertBefore(placeholder, el);
            }else{
                placeholder=$A.renderingService.getMarker(cmp);
            }
            $A.unrender(cmp);
            var results = $A.render(cmp);
            if(results.length){
                $A.util.insertBefore(results, placeholder);
                $A.afterRender(cmp);
            }
        }
    },
    "unrender":function(cmp) {
        var elements = cmp.getElements();
        for(var c=0;c<elements.length;c++) {
            $A.util.removeElement(elements[c]);
        }
        cmp.disassociateElements();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://aura:unescapedHtml",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["value","aura://String","G",false]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:block", (function (){/*$A.componentService.addComponentClass("markup://ui:block",function() {
return {
  "meta":{
    "name":"ui$block",
    "extends":"markup://aura:component"
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:block",
  "st":{
    "descriptor":"css://ui.block",
    "cl":"uiBlock"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["overflow","aura://Boolean","I",false,false],
    ["left","aura://Aura.Component[]","I",false,[]],
    ["right","aura://Aura.Component[]","I",false,[]],
    ["tag","aura://String","I",false,"div"]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),((fn.eq(cmp.get(\"v.overflow\"),true)||fn.eq(cmp.get(\"v.overflow\"),\"true\"))?\" overflow\":\"\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:block",
                        "path":"v.overflow"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:block",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:block",
                  "path":"v.tag"
                }
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return (cmp.get(\"v.left.length\")>0); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:block",
                                "path":"v.left.length"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"bLeft"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:block",
                                                "path":"v.left"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return (cmp.get(\"v.right.length\")>0); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:block",
                                "path":"v.right.length"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"bRight"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:block",
                                                "path":"v.right"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"bBody"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:block",
                                      "path":"v.body"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:datePicker", (function (){/*$A.componentService.addComponentClass("markup://ui:datePicker",function() {
return {
  "meta":{
    "name":"ui$datePicker",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:panelPositioningLib"
    }
  },
  "controller":{
    "cancel":function(component, event, helper) {
        helper.hide(component, true);
    },
    "handleVisible":function(component, event, helper) {
        helper.toggleVisibility(component);
    },
    "trapClicks":function(component, event) {
        $A.util.squash(event, true);
    },
    "highlightRange":function(component, event) {
        var params = event.getParam('arguments');
        if (params) {
            var grid = component.find("grid");
            grid.highlightRange(params.rangeStart, params.rangeEnd, params.highlightClass);
        }
    },
    "goToPrevMonth":function(component, event, helper) {
        helper.goToPrevMonth(component);
    },
    "goToNextMonth":function(component, event, helper) {
        helper.goToNextMonth(component);
    },
    "handleKeydown":function(component, event, helper) {
        helper.handleKeydown(component, event);
    },
    "show":function(component, event, helper) {
        helper.show(component, event);
    },
    "hide":function(component, event, helper) {
        helper.closeOnClickOut(component);
    },
    "focus":function(component, event, helper) {
        helper.focusDate(component);
    },
    "setDate":function(component, event, helper) {
        helper.setDate(component, event);
    },
    "setDateTime":function(component, event, helper) {
        helper.setDateTime(component, event);
    },
    "updateCalendarTitle":function(component, event, helper) {
        helper.updateMonthYear(component, new Date(event.getParam("year"), event.getParam("month"), 1));
    },
    "yearChange":function(component, event, helper) {
        helper.yearChange(component);
    }
  },
  "helper":{
    "attachToDocumentBody":function(component) {
        var body = document.getElementsByTagName("body")[0];
        var elem = component.getElement();
        body.appendChild(elem);
    },
    "show":function(component, event) {
        var params = event.getParam("arguments");
        if (params) {
            component.set("v.value", params.value);

            if (params.referenceElement) {
                component.set("v.referenceElement", params.referenceElement);
            }

            component.set("v.visible", true);

            if (params.focus) {
                this.focusDate(component);
            }
        }
    },
    "focusDate":function(component) {
        
        window.requestAnimationFrame($A.getCallback(function () {
        	if (!component.find("grid").isValid()) {
                return;
            }
            component.find("grid").focus();
        }));

    },
    "goToPrevMonth":function(component) {
        this.changeCalendar(component, -1, 0);
    },
    "goToNextMonth":function(component) {
        this.changeCalendar(component, 1, 0);
    },
    "changeCalendar":function(component, monthChange, yearChange) {
        var grid = component.find("grid");
        grid.changeCalendar(monthChange, yearChange);
    },
    "handleKeydown":function(component, event) {
        if (component.get("v.closeOnClickOut")) {
            var keyCode = event.keyCode;
            var elem = event.target || event.srcElement;
            if (keyCode === 9 && event.shiftKey === true) { 
                if ($A.util.hasClass(elem, "prevMonth")) {
                    $A.util.squash(event, true);
                    this.closeOnClickOut(component);
                }
            } else if (keyCode === 27) { 
                this.closeOnClickOut(component);
            }
        }
    },
    "updateGlobalEventListeners":function(component) {
        var visible = component.get("v.visible");
        if (component.get("v.closeOnClickOut")) {
            if (!component._clickHandler) {
                component._clickHandler = component.addDocumentLevelHandler("mouseup", this.getOnClickFunction(component), visible);
            } else {
                component._clickHandler.setEnabled(visible);
            }
        }
    },
    "getOnClickFunction":function(component) {
        var f = function (event) {
            if (!this.isElementInComponent(component, event.target)) {
                this.hide(component);
            }
        }.bind(this);
        return f;
    },
    "isElementInComponent":function(component, targetElem) {
        var componentElements = component.getElements();
        
        var currentNode = targetElem;
        do {
            for (var index = 0; index < componentElements.length; index++) {
                if (componentElements[index] === currentNode) {
                    return true;
                }
            }

            currentNode = currentNode.parentNode;
        } while (currentNode);
        return false;
    },
    "position":function(component) {
        var divCmp = component.find("datePicker");
        var element = divCmp ? divCmp.getElement() : null;
        var visible = component.get("v.visible");
        var referenceElem = component.getConcreteComponent().get("v.referenceElement");

        if (element && visible) {
            if ($A.get("$Browser.isPhone")) {
                this.attachToDocumentBody(component);
                var scrollerDivCmp = component.find("scroller");
                var scrollerElem = scrollerDivCmp ? scrollerDivCmp.getElement() : null;
                if (scrollerElem) { 
                    scrollerElem.style.height = $A.util.getWindowSize().height + "px";
                }

            } else if (!$A.util.isUndefinedOrNull(referenceElem)) {
                element.style.opacity = 0;

                if ($A.util.isEmpty(element.style.top)) {
                    
                    
                    element.style.top = referenceElem.getBoundingClientRect().bottom + window.pageYOffset + "px";
                }

                if ($A.util.isEmpty(element.style.left)) {
                    element.style.left = referenceElem.getBoundingClientRect().left + "px";
                }

                if (!component.positionConstraint) {
                    var shouldFlip = this.shouldFlip(element, referenceElem);
                    var referenceVerticalAlign = shouldFlip ? "top" : "bottom";
                    var elementVerticalAlign = shouldFlip ? "bottom" : "top";
                    var horizontalAlign = this.shouldAlignToRight(element, referenceElem) ? "right" : "left";

                    component.positionConstraint = this.lib.panelPositioning.createRelationship({
                        element: element,
                        target: referenceElem,
                        appendToBody: true,
                        scrollableParentBound: true,
                        align: horizontalAlign + " " + elementVerticalAlign,
                        targetAlign: horizontalAlign + " " + referenceVerticalAlign
                    });
                }
                this.lib.panelPositioning.reposition(function () {
                    element.style.opacity = 1;
                });
            }
        }
    },
    "shouldFlip":function(element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var height = typeof elemRect.height !== 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;

        if (referenceElemRect.top >= height         
            && (viewPort.height - referenceElemRect.bottom) < height) { 
            return true;
        }
        return false;
    },
    "shouldAlignToRight":function(element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var width = typeof elemRect.width !== 'undefined' ? elemRect.width : elemRect.right - elemRect.left;

        if (referenceElemRect.right >= width         
            && (viewPort.width - referenceElemRect.left) < width) { 
            return true;
        }
        return false;
    },
    "refreshYearSelection":function(component) {
        if (!$A.util.getBooleanValue(component._yearListInitialized)) {
            var minY = component.get("v.minYear");
            var maxY = component.get("v.maxYear");

            var sampleDate = new Date();
            var currentYear = sampleDate.getFullYear();

            if (!minY) {
                minY = currentYear - 100;
            }
            sampleDate.setFullYear(minY);
            minY = $A.localizationService.translateToOtherCalendar(sampleDate).getFullYear();

            if (!maxY) {
                maxY = currentYear + 30;
            }
            sampleDate.setFullYear(maxY);
            maxY = $A.localizationService.translateToOtherCalendar(sampleDate).getFullYear();

            var yearTitleCmp = component.find("yearTitle");
            var selectElem = yearTitleCmp ? yearTitleCmp.getElement() : null;
            if (selectElem) {
                selectElem.setAttribute("id", yearTitleCmp.getGlobalId());
                for (var i = minY; i <= maxY; i++) {
                    selectElem.options[selectElem.options.length] = new Option(i + "", i + "");
                }
            }
            component._yearListInitialized = true;
        }
    },
    "setInitialValuesOnChildren":function(component) {
        var value = component.get("v.value");
        this.setGridValue(component, value);
        this.setTimePickerInitialValues(component);
    },
    "setGridValue":function(component, value) {
        component.find("grid").setSelectedDate(value);
    },
    "setInitialFocus":function(component) {
        if (component.get("v.setFocus")) {
            this.focusDate(component);
        }
    },
    "setTimePickerInitialValues":function(component) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime) {
            var timePickerCmp = component.find("time");
            if (timePickerCmp) {
                timePickerCmp.set("v.hours", component.get("v.hours"));
                timePickerCmp.set("v.is24HourFormat", component.get("v.is24HourFormat"));
                timePickerCmp.set("v.minutes", component.get("v.minutes"));
            }
        }
    },
    "initializeMonthYear":function(component, value) {
        if ($A.util.isEmpty(value)) {
            value = this.getDateStringFromGrid(component);
        }

        var date = $A.localizationService.parseDateTime(value, "YYYY-MM-DD");

        if (date) {
            this.updateMonthYear(component, date);
        }
    },
    "updateMonthYear":function(component, date) {
        date = $A.localizationService.translateToOtherCalendar(date);
        if (!this.isDesktopBrowser()) {
            this.updateMobileMonth(component, date);
        } else {
            var titleElem = component.find("calTitle").getElement();
            if (titleElem) {
                var monthLabels = $A.get("$Locale.nameOfMonths");
                var title = monthLabels[date.getMonth()].fullName;
                var textContent = titleElem.textContent || titleElem.innerText;
                if (textContent !== title) {
                    $A.util.setText(titleElem, title);
                }
            }
        }
        
        var selectElem = component.find("yearTitle").getElement();
        if (selectElem) {
            selectElem.value = date.getFullYear() + "";
        }
    },
    "updateMobileMonth":function(component, date) {
        var monthTitleCmp = component.find("monthTitle");
        var monthLabels = $A.get("$Locale.nameOfMonths");
        monthTitleCmp.set("v.value", monthLabels[date.getMonth()].fullName);
    },
    "yearChange":function(component) {
        var grid = component.find("grid");
        var yearCmp = component.find("yearTitle");
        
        if (grid && yearCmp) {
            var year = parseInt(grid.get("v.year"), 10);

            var selectedYear = parseInt(yearCmp.getElement().value, 10);
            var sampleDate = new Date();
            sampleDate.setFullYear(selectedYear);
            selectedYear = $A.localizationService.translateFromOtherCalendar(sampleDate).getFullYear();

            grid.changeCalendar(0, selectedYear - year);
        }
    },
    "toggleVisibility":function(component) {
        if (component.get("v.visible") === true) {
            window.requestAnimationFrame($A.getCallback(function () {
                if (!component.isValid()) {
                    return;
                }
                this.position(component);
            }.bind(this)));
        }
    },
    "closeOnClickOut":function(component) {
        if (component.get("v.closeOnClickOut")) {
            this.hideAndReturnFocus(component);
        }
    },
    "hideOnSelect":function(component) {
        if (component.get("v.hideOnSelect")) {
            this.hideAndReturnFocus(component);
        }
    },
    "hideAndReturnFocus":function(component) {
        this.hide(component);
        this.focusReferenceElement(component);
    },
    "hide":function(component) {
        if (component._clickHandler) {
            component._clickHandler.setEnabled(false);
        }
        component.set("v.visible", false);

        this.unposition(component);
    },
    "focusReferenceElement":function(component) {
        if (!this.isDesktopBrowser()) {
            return;
        }
        var referenceElem = component.get("v.referenceElement");
        if (!$A.util.isUndefinedOrNull(referenceElem)) {
            referenceElem.focus();
        }
    },
    "isDesktopBrowser":function() {
        return $A.get("$Browser.formFactor") === "DESKTOP";
    },
    "getDateStringFromGrid":function(component) {
        var gridCmp = component.find("grid");
        return gridCmp.get("v.year") + "-" + (gridCmp.get("v.month") + 1) + "-" + gridCmp.get("v.date");
    },
    "setDate":function(component, event) {
        component.getEvent("selectDate").fire({
            "value": event.getParam("value")
        });
        this.hideOnSelect(component);
    },
    "setDateTime":function(component) {
        
        var gridCmp = component.find("grid");
        if (!gridCmp) {
            return;
        }
        var date = this.getDateStringFromGrid(component);

        
        var timeCmp = component.find("time");
        if (!timeCmp || ($A.util.getBooleanValue(timeCmp.get("v.isValid")) === false)) {
            return;
        }
        component.getEvent("selectDate").fire({
            "value": date,
            "hours": timeCmp.get("v.hours"),
            "minutes": timeCmp.get("v.minutes")
        });

        this.hideAndReturnFocus(component);
    },
    "unposition":function(component) {
        if (component.positionConstraint) {
            component.positionConstraint.destroy();
            component.positionConstraint = undefined;
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        component.superAfterRender();
        var visible = component.get("v.visible");
        var managed = component.get('v.managed');

        if (visible) {
            helper.refreshYearSelection(component);
            helper.setInitialValuesOnChildren(component);
            helper.initializeMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
            helper.setInitialFocus(component);

            
            
            if (!managed) {
                helper.position(component);
            }
        }
    },
    "rerender":function(component, helper) {
        component.superRerender();
        var visible = component.get("v.visible");
        if (visible) {
            helper.refreshYearSelection(component);
            helper.setInitialValuesOnChildren(component);
            helper.initializeMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
            helper.position(component);
        }
    },
    "unrender":function(component, helper) {
        helper.unposition(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:datePicker",
  "st":{
    "descriptor":"css://ui.datePicker",
    "cl":"uiDatePicker"
  },
  "fst":{
    "descriptor":"css://ui.datePicker"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","I",false],
    ["visible","aura://Boolean","I",false,false],
    ["hasTime","aura://Boolean","I",false,false],
    ["hours","aura://Integer","I",false],
    ["minutes","aura://Integer","I",false],
    ["is24HourFormat","aura://Boolean","I",false,true],
    ["maxYear","aura://Integer","I",false],
    ["minYear","aura://Integer","I",false],
    ["managed","aura://Boolean","I",false,false],
    ["referenceElement","aura://Object","I",false,null],
    ["showToday","aura://Boolean","I",false,true],
    ["hideOnSelect","aura://Boolean","I",false,false],
    ["setFocus","aura://Boolean","I",false,false],
    ["closeOnClickOut","aura://Boolean","I",false,false]
  ],
  "med":[
    {
      "name":"ui:highlightRange",
      "xs":"I",
      "action":"{!c.highlightRange}",
      "attributes":[
        ["rangeStart","aura://String","I",false],
        ["rangeEnd","aura://String","I",false],
        ["highlightClass","aura://String","I",false]
      ]
    },
    {
      "name":"ui:show",
      "xs":"I",
      "attributes":[
        ["value","aura://String","I",false],
        ["focus","aura://Boolean","I",false,"false"],
        ["referenceElement","aura://Object","I",false,null]
      ]
    },
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:selectDate",
      "n":"selectDate",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleVisible"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.visible"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"datePicker",
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.class\"),(fn.eq(cmp.get(\"v.visible\"),true)?\" visible \":\" \")),$A.get(\"$Browser.formFactor\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:datePicker",
                        "path":"v.visible"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:datePicker",
                        "path":"$Browser.formFactor"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:datePicker",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"scroller",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"scroller slds-datepicker",
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:datePicker",
                              "path":"c.trapClicks"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"v.hasTime"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"headerBar"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"div"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "localId":"cancel",
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"calCancel button",
                                                          "onclick":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:datePicker",
                                                            "path":"c.cancel"
                                                          }
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"a"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:text"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "value":{
                                                                  "descriptor":"value",
                                                                  "value":"Cancel"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                },
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "localId":"set",
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"calSet button",
                                                          "onclick":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:datePicker",
                                                            "path":"c.setDateTime"
                                                          }
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"a"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:text"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "value":{
                                                                  "descriptor":"value",
                                                                  "value":"Set"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"dateBar"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"datepicker__filter--month"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"div"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"prevLinks"
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"div"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "localId":"prevMonth",
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"navLink prevMonth",
                                                                    "onkeydown":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:datePicker",
                                                                      "path":"c.handleKeydown"
                                                                    },
                                                                    "onclick":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:datePicker",
                                                                      "path":"c.goToPrevMonth"
                                                                    },
                                                                    "title":"Go to previous month"
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"a"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"assistiveText"
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"span"
                                                                          },
                                                                          "body":{
                                                                            "descriptor":"body",
                                                                            "value":[
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:text"
                                                                                },
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "value":{
                                                                                      "descriptor":"value",
                                                                                      "value":"Go to previous month"
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            ]
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                },
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"nextLinks"
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"div"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "localId":"nextMonth",
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"navLink nextMonth",
                                                                    "onkeydown":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:datePicker",
                                                                      "path":"c.handleKeydown"
                                                                    },
                                                                    "onclick":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:datePicker",
                                                                      "path":"c.goToNextMonth"
                                                                    },
                                                                    "title":"Go to next month"
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"a"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"assistiveText"
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"span"
                                                                          },
                                                                          "body":{
                                                                            "descriptor":"body",
                                                                            "value":[
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:text"
                                                                                },
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "value":{
                                                                                      "descriptor":"value",
                                                                                      "value":"Go to next month"
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            ]
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                },
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:if"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "isTrue":{
                                                        "descriptor":"isTrue",
                                                        "value":{
                                                          "exprType":"FUNCTION",
                                                          "code":"function(cmp, fn) { return fn.ne($A.get(\"$Browser.formFactor\"),\"DESKTOP\"); }",
                                                          "args":[
                                                            {
                                                              "exprType":"PROPERTY",
                                                              "byValue":false,
                                                              "target":"ui:datePicker",
                                                              "path":"$Browser.formFactor"
                                                            }
                                                          ],
                                                          "byValue":false
                                                        }
                                                      },
                                                      "else":{
                                                        "descriptor":"else",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "localId":"calTitle",
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"monthYear",
                                                                    "aria-live":"assertive",
                                                                    "aria-atomic":"true"
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"h2"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "localId":"calTitle",
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"monthYear",
                                                                    "aria-live":"assertive",
                                                                    "aria-atomic":"true"
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"h2"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://ui:outputText"
                                                                      },
                                                                      "localId":"monthTitle",
                                                                      "attributes":{
                                                                        "values":{
                                                                          "value":{
                                                                            "descriptor":"value",
                                                                            "value":""
                                                                          }
                                                                        }
                                                                      }
                                                                    },
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{

                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"label"
                                                                          },
                                                                          "body":{
                                                                            "descriptor":"body",
                                                                            "value":[
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:html"
                                                                                },
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "HTMLAttributes":{
                                                                                      "descriptor":"HTMLAttributes",
                                                                                      "value":{
                                                                                        "class":"assistiveText"
                                                                                      }
                                                                                    },
                                                                                    "tag":{
                                                                                      "descriptor":"tag",
                                                                                      "value":"span"
                                                                                    },
                                                                                    "body":{
                                                                                      "descriptor":"body",
                                                                                      "value":[
                                                                                        {
                                                                                          "componentDef":{
                                                                                            "descriptor":"markup://aura:text"
                                                                                          },
                                                                                          "attributes":{
                                                                                            "values":{
                                                                                              "value":{
                                                                                                "descriptor":"value",
                                                                                                "value":"Pick a Year"
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      ]
                                                                                    }
                                                                                  }
                                                                                }
                                                                              },
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:html"
                                                                                },
                                                                                "localId":"yearTitle",
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "HTMLAttributes":{
                                                                                      "descriptor":"HTMLAttributes",
                                                                                      "value":{
                                                                                        "class":"slds-select",
                                                                                        "onchange":{
                                                                                          "exprType":"PROPERTY",
                                                                                          "byValue":false,
                                                                                          "target":"ui:datePicker",
                                                                                          "path":"c.yearChange"
                                                                                        }
                                                                                      }
                                                                                    },
                                                                                    "tag":{
                                                                                      "descriptor":"tag",
                                                                                      "value":"select"
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            ]
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:if"
                                        },
                                        "attributes":{
                                          "values":{
                                            "isTrue":{
                                              "descriptor":"isTrue",
                                              "value":{
                                                "exprType":"FUNCTION",
                                                "code":"function(cmp, fn) { return fn.eq($A.get(\"$Browser.formFactor\"),\"DESKTOP\"); }",
                                                "args":[
                                                  {
                                                    "exprType":"PROPERTY",
                                                    "byValue":false,
                                                    "target":"ui:datePicker",
                                                    "path":"$Browser.formFactor"
                                                  }
                                                ],
                                                "byValue":false
                                              }
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"picklist datepicker__filter--year"
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"div"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{

                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"label"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"assistiveText"
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"span"
                                                                          },
                                                                          "body":{
                                                                            "descriptor":"body",
                                                                            "value":[
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:text"
                                                                                },
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "value":{
                                                                                      "descriptor":"value",
                                                                                      "value":"Pick a Year"
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            ]
                                                                          }
                                                                        }
                                                                      }
                                                                    },
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "localId":"yearTitle",
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"slds-select picklist__label",
                                                                              "onchange":{
                                                                                "exprType":"PROPERTY",
                                                                                "byValue":false,
                                                                                "target":"ui:datePicker",
                                                                                "path":"c.yearChange"
                                                                              },
                                                                              "onkeydown":{
                                                                                "exprType":"PROPERTY",
                                                                                "byValue":false,
                                                                                "target":"ui:datePicker",
                                                                                "path":"c.handleKeydown"
                                                                              }
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"select"
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:datePickerGrid"
                              },
                              "localId":"grid",
                              "attributes":{
                                "values":{
                                  "selectedDate":{
                                    "descriptor":"selectedDate",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":true,
                                      "target":"ui:datePicker",
                                      "path":"v.value"
                                    }
                                  },
                                  "showToday":{
                                    "descriptor":"showToday",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"v.showToday"
                                    }
                                  },
                                  "hasTime":{
                                    "descriptor":"hasTime",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"v.hasTime"
                                    }
                                  },
                                  "selectDate":{
                                    "descriptor":"selectDate",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"c.setDate"
                                    }
                                  },
                                  "updateCalendarTitle":{
                                    "descriptor":"updateCalendarTitle",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"c.updateCalendarTitle"
                                    }
                                  },
                                  "hide":{
                                    "descriptor":"hide",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"c.hide"
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:datePicker",
                                      "path":"v.hasTime"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"timeBar"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"div"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://ui:timePicker"
                                                  },
                                                  "localId":"time",
                                                  "attributes":{
                                                    "values":{
                                                      "is24HourFormat":{
                                                        "descriptor":"is24HourFormat",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:datePicker",
                                                          "path":"v.is24HourFormat"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputDateHtml", (function (){/*$A.componentService.addComponentClass("markup://ui:inputDateHtml",function() {
return {
  "meta":{
    "name":"ui$inputDateHtml",
    "extends":"markup://ui:input",
    "imports":{
      "dateTimeLib":"markup://ui:dateTimeLib"
    }
  },
  "controller":{
    "doInit":function(cmp) {
        
        
        
        
        if ($A.get("$Browser.isAndroid")) {
            cmp.set('v.updateOn', 'change');
        }
    }
  },
  "helper":{
    "formatValue":function(component) {
        var config = {
            format: "YYYY-MM-DD",
            timezone: component.get("v.timezone") || $A.get("$Locale.timezone"),
            validateString: false,
            ignoreThaiYearTranslation: true
        };

        var displayValue = function (returnValue) {
            this.setInputValue(component, returnValue.isoString);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },
    "setInputValue":function(component, displayValue) {
        var inputElement = component.find("inputDateHtml").getElement();

        if (!$A.util.isEmpty(displayValue)) {
            
            displayValue = displayValue.split("T", 1)[0] || displayValue;

            inputElement.value = displayValue;
        } else {
            inputElement.value = '';
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.formatValue(component);
        component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.formatValue(component);
        component.superRerender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:inputDateHtml",
  "st":{
    "descriptor":"css://ui.inputDateHtml",
    "cl":"uiInputDateHtml"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["timezone","aura://String","I",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:htmlDateTime"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"updateOn",
      "value":"blur"
    },
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"inputDateHtml",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputDateHtml",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "type":"date",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateHtml",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateHtml",
                    "path":"v.disabled"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateHtml",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateHtml",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input, datetime",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputDateTimeHtml", (function (){/*$A.componentService.addComponentClass("markup://ui:inputDateTimeHtml",function() {
return {
  "meta":{
    "name":"ui$inputDateTimeHtml",
    "extends":"markup://ui:input"
  },
  "controller":{
    "doInit":function(cmp) {
        var timezone = cmp.get("v.timezone");
        if ($A.util.isEmpty(timezone)) {
            cmp.set("v.timezone", $A.get("$Locale.timezone"));
        }

        
        
        
        
        if ($A.get("$Browser.isAndroid")) {
            cmp.set('v.updateOn', 'change');
        }
    }
  },
  "helper":{
    "formatValue":function(component) {
        var value = component.get("v.value");
        var timezone = component.get("v.timezone");

        var inputElement = component.find("inputDateTimeHtml").getElement();

        if (!$A.util.isEmpty(value)) {
            var isoDate = $A.localizationService.parseDateTimeISO8601(value);

            $A.localizationService.UTCToWallTime(isoDate, timezone, function (walltime) {
                this.setInputValue(inputElement, walltime);
            }.bind(this));
        } else {
            inputElement.value = "";
        }
    },
    "setInputValue":function(elem, date) {
        var isoString = date.toISOString();

        
        
        var displayValue = isoString.split("Z", 1)[0] || isoString;
        elem.value = displayValue;
    },
    "doUpdate":function(component, value) {
        var timezone = component.get("v.timezone");

        
        
        if ($A.util.isUndefined(component._considerLocalDateTime)) {
            component._considerLocalDateTime = $A.util.isEmpty(component.get("v.value"));
        }

        if (component._considerLocalDateTime) {
            
            
            
            var date = $A.localizationService.parseDateTime(value);
            this.setValue(component, date);
        } else {
            date = $A.localizationService.parseDateTimeUTC(value);
            $A.localizationService.WallTimeToUTC(date, timezone, function (utcDate) {
                this.setValue(component, utcDate);
            }.bind(this));
        }
    },
    "setValue":function(component, value) {
        component.set("v.value", value.toISOString());
        component._ignoreChange = true;
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.formatValue(component);
        component.superAfterRender();
    },
    "rerender":function(component, helper) {
        if (!component._ignoreChange) {
            helper.formatValue(component);
        }

        
        component._ignoreChange = false;
        component.superRerender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:inputDateTimeHtml",
  "st":{
    "descriptor":"css://ui.inputDateTimeHtml",
    "cl":"uiInputDateTimeHtml"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["timezone","aura://String","I",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:htmlDateTime"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"updateOn",
      "value":"blur"
    },
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"inputDateTimeHtml",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputDateTimeHtml",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "type":"datetime-local",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateTimeHtml",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateTimeHtml",
                    "path":"v.disabled"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateTimeHtml",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputDateTimeHtml",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input, datetime",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputSmartNumber", (function (){/*$A.componentService.addComponentClass("markup://ui:inputSmartNumber",function() {
return {
  "meta":{
    "name":"ui$inputSmartNumber",
    "extends":"markup://aura:component",
    "imports":{
      "inputNumberLibrary":"markup://ui:inputNumberLibrary"
    }
  },
  "controller":{
    "initialize":function(cmp, event, helper) {
        helper.setDefaultAttrs(cmp);
        helper.handleNewValue(cmp);
    },
    "handleCompositionStart":function(cmp, event, helper) {
        helper.startComposition(cmp);
    },
    "handleCompositionEnd":function(cmp, event, helper) {
        
        
        helper.resetCompositionState(cmp);
    },
    "handleOnInput":function(cmp, event, helper) {
        cmp.set('v.inputValue', event.target.value);

        
        
        if (helper.isCompositionEnd(cmp)) {
            helper.resetCompositionState(cmp);
            
            helper.restoreLastInputValue(cmp);

        } else if (helper.isInputValueValid(cmp) || helper.isCompositionStart(cmp)) {
            helper.updateLastInputValue(cmp);
            if (helper.weHaveToUpdate(cmp, 'input')) {
                helper.setNewValue(cmp);
            }

        } else {
            helper.restoreLastInputValue(cmp);
        }
    },
    "handleOnChange":function(cmp, event, helper) {
        
        
        event.stopPropagation();
        if (helper.weHaveToUpdate(cmp,'change')) {
            helper.setNewValue(cmp);
            helper.formatInputValue(cmp);
            helper.updateLastInputValue(cmp);
        }
    },
    "handleOnBlur":function(cmp, event, helper) {
        if (helper.isCompositionStart(cmp)) {
            helper.endComposition(cmp);
        }

        if (helper.hasChangedValue(cmp)) {
            helper.setNewValue(cmp);
            helper.formatInputValue(cmp);
            helper.updateLastInputValue(cmp);
        } else {
            helper.formatInputValue(cmp);
        }
    },
    "handleChangeEvent":function(cmp, event, helper) {
        if (helper.hasChangedValue(cmp)) {
            helper.handleNewValue(cmp);
        }
    },
    "handleOnFocus":function(cmp, event, helper) {
        cmp.set('v.inputValue', helper.removeSymbols(cmp.get('v.inputValue')));
        helper.updateLastInputValue(cmp);
    }
  },
  "helper":{
    "setDefaultAttrs":function(cmp) {
        this.setDefaultStyle(cmp);
        this.setDefaultFormat(cmp);
        this.setDefaultUpdateOn(cmp);
    },
    "setDefaultStyle":function(cmp) {
        var style = cmp.get('v.style');
        if (['number','currency','percent'].indexOf(style.toLowerCase()) !== -1) {
            cmp.set('v.style',style.toLowerCase());
        } else {
            cmp.set('v.style','number');
        }
    },
    "setDefaultFormat":function(cmp) {
        var formatter = cmp.get('v.format');
        try {
            $A.localizationService.getNumberFormat(formatter);
        } catch (e) {
            switch (cmp.get('v.style')) {
                case 'number':
                    cmp.set('v.format', $A.get("$Locale.numberFormat"));
                    break;
                case 'currency':
                    cmp.set('v.format', $A.get("$Locale.currencyFormat"));
                    break;
                case 'percent':
                    cmp.set('v.format', $A.get("$Locale.percentFormat"));
                    break;
            }
        }
    },
    "setDefaultUpdateOn":function(cmp) {
        if (['input','change','keypress','keydown','keyup'].indexOf(cmp.get('v.updateOn')) === -1) {
            cmp.set('v.updateOn','change');
        }
    },
    "isNumberInRange":function(cmp) {
        var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991
          , MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991
          , lib              = this.inputNumberLibrary.number
          , formatter        = cmp.get('v.format')
          , number           = cmp.get('v.inputValue');
        number = lib.isNumber(number) ? number : lib.unFormatNumber(number, formatter);

        return number <= MAX_SAFE_INTEGER && number >= MIN_SAFE_INTEGER;
    },
    "isValidValue":function(number, formatter) {
        var lib = this.inputNumberLibrary.number;
        
        
        
        

        return !$A.util.isUndefinedOrNull(number) &&
            (lib.isNumber(number) || !isNaN(number) || this.isFormattedValue(number, formatter));
    },
    "isInputValueValid":function(cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var inputValue = cmp.get('v.inputValue');
        return lib.isFormattedNumber(inputValue, formatter) && this.isNumberInRange(cmp);
    },
    "isFormattedValue":function(string, formatter) {
        var lib = this.inputNumberLibrary.number;
        return lib.formatNumber(lib.unFormatNumber(string, formatter), formatter) === string;
    },
    "isPercentStyle":function(cmp) {
        var format = cmp.get('v.format');
        if (typeof format === 'string') {
            return format.indexOf('%') !== -1;
        }
        return false;
    },
    "hasInputElementFocus":function(cmp) {
       return this.getElementInput(cmp) ===  document.activeElement;
    },
    "weHaveToUpdate":function(cmp, eventType) {
        var eventMap = {
            input : 'input',
            keypress : 'input',
            keyup : 'input',
            keydown : 'input',
            change  : 'change'
        };
        return eventMap[cmp.get('v.updateOn').toLowerCase()] === eventType;
    },
    "handleNewValue":function(cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var value = cmp.get('v.value');
        if ($A.util.isUndefinedOrNull(value)) {
            cmp.set('v.inputValue','');
            this.updateLastInputValue(cmp);
            return;
        }

        if (this.isValidValue(value, formatter)) {

            if (this.isFormattedValue(value,formatter)) {
                cmp.set('v.value',lib.unFormatNumber(value,formatter));
                return;
            }
            
            if (typeof value === "string" && !$A.util.isEmpty(value)){
                cmp.set("v.value", Number(value));
            }

            this.formatInputValue(cmp);
            this.updateLastInputValue(cmp);
        } else {
            this.setValueEmpty(cmp);
            $A.warning('Invalid value was passed(' + value + ')');
        }
    },
    "setValueEmpty":function(cmp) {
        if (cmp.get('v.value') !== null) {
            cmp.set('v.value', null);
            this.fireChangeEvent(cmp);
        }
    },
    "formatInputValue":function(cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var newInputValue = lib.formatNumber(this.getScaledValue(cmp), formatter);
            newInputValue = this.hasInputElementFocus(cmp) ? this.removeSymbols(newInputValue) : newInputValue;

        cmp.set('v.inputValue', newInputValue);
    },
    "convertInputValueToInternalValue":function(cmp) {
        var lib        = this.inputNumberLibrary.number;
        var formatter  = cmp.get("v.format");
        var inputValue = cmp.get("v.inputValue");
        return this.getUnScaledValue(cmp, lib.unFormatNumber(inputValue, formatter));
    },
    "getScaledValue":function(cmp) {
        
        return  Number(cmp.get('v.value') + 'e' + cmp.get('v.valueScale'));
    },
    "getUnScaledValue":function(cmp, inputValue) {
        var valueScale = cmp.get('v.valueScale');
        if (this.isPercentStyle(cmp)) {
            
            
            return Number(inputValue + 'e' + (-valueScale - 2));
        } else {
            return Number(inputValue + 'e' + (-valueScale));
        }
    },
    "updateLastInputValue":function(cmp) {
        cmp.set('v.lastInputValue',cmp.get('v.inputValue'));
    },
    "restoreLastInputValue":function(cmp) {
        cmp.set('v.inputValue', cmp.get('v.lastInputValue'));
    },
    "getElementInput":function(cmp) {
        return cmp.find("input").getElement();
    },
    "setNewValue":function(cmp) {
        var inputValue = cmp.get('v.inputValue');
        if (!inputValue.length) {
            this.setValueEmpty(cmp);
            return;
        }
        var newValue = this.convertInputValueToInternalValue(cmp);
        if (cmp.get('v.value') !== newValue) {
            cmp.set('v.value', newValue);
            this.fireChangeEvent(cmp);
        }
    },
    "fireChangeEvent":function(cmp) {
        cmp.getEvent('change').fire();
    },
    "hasChangedValue":function(cmp) {
        var value = String(cmp.get('v.value'));
        var inputValue = cmp.get("v.inputValue");

        
        return String(this.convertInputValueToInternalValue(cmp)) !== value
            || (inputValue === '' && value === '0');
    },
    "removeSymbols":function(string) {

        var decimalSeparator  = $A.get("$Locale.decimal");
        var groupingSeparator = $A.get("$Locale.grouping");
        var currencySymbol = $A.get("$Locale.currency");

        
        string = string.replace(currencySymbol, '');
        
        string = string.replace(/(^\()(.+)(\)$)/,'-$2');

        var reg = '[^\\' + groupingSeparator + '\\' + decimalSeparator +'\\d\+\-]';
            reg = new RegExp(reg,'g');
        return string.replace(reg, '');
    },
    "isCompositionStart":function(cmp) {
        return cmp.get('v.compositionState') === 'start';
    },
    "isCompositionEnd":function(cmp) {
        return cmp.get('v.compositionState') === 'end';
    },
    "startComposition":function(cmp) {
        cmp.set('v.compositionState', 'start');
    },
    "endComposition":function(cmp) {
        cmp.set('v.compositionState', 'end');
    },
    "resetCompositionState":function(cmp) {
        cmp.set('v.compositionState', '');
    }
  },
  "renderer":{
    "afterRender":function(cmp, helper) {
        cmp.superAfterRender();
        if (helper.hasChangedValue(cmp)) {
            helper.handleNewValue(cmp);
        }
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:inputSmartNumber",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false],
    ["value","aura://Decimal","I",false],
    ["max","aura://Decimal","PP",false,99999999999999],
    ["min","aura://Decimal","PP",false,-99999999999999],
    ["step","aura://Decimal","I",false,1],
    ["format","aura://String","G",false],
    ["valueScale","aura://Integer","I",false,0],
    ["doFormat","aura://Boolean","I",false,true],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["visible","aura://Boolean","I",false,true],
    ["id","aura://String","I",false],
    ["required","aura://Boolean","I",false,false],
    ["disabled","aura://Boolean","I",false,false],
    ["style","aura://String","I",false,"number"],
    ["updateOn","aura://String","I",false,"change"],
    ["inputValue","aura://String","p",false,""],
    ["lastInputValue","aura://String","p",false,""],
    ["compositionState","aura://String","p",false,""]
  ],
  "i":[
    "markup://ui:inputTextComponent",
    "markup://ui:inputNumberComponent",
    "markup://ui:uiEvents",
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.initialize"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleChangeEvent"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.value"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"input",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "onchange":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleOnChange"
                  },
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputSmartNumber",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "onblur":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleOnBlur"
                  },
                  "oninput":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleOnInput"
                  },
                  "oncompositionstart":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleCompositionStart"
                  },
                  "oncompositionend":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleCompositionEnd"
                  },
                  "min":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.min"
                  },
                  "onfocus":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"c.handleOnFocus"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.disabled"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.id"
                  },
                  "max":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.max"
                  },
                  "step":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.step"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.inputValue"
                  },
                  "type":"text",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.ariaDescribedBy"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSmartNumber",
                    "path":"v.required"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputTextArea", (function (){/*$A.componentService.addComponentClass("markup://ui:inputTextArea",function() {
return {
  "meta":{
    "name":"ui$inputTextArea",
    "extends":"markup://ui:input"
  },
  "controller":{
    "valueChange":function(cmp, evt, helper) {
        helper.setDomElementValue(cmp);
    }
  },
  "helper":{
    "setDomElementValue":function(component) {
        var textAreaCmp = component.find("textAreaElem");
        var elem = !$A.util.isUndefinedOrNull(textAreaCmp) ? textAreaCmp.getElement() : null;
        if (elem) {
            var value = component.get("v.value");
            if ($A.util.isUndefinedOrNull(value)) {
                elem.value = "";
            } else {
                if (value !== elem.value) {
                    if (document.activeElement === elem) {
                        var selectionStart = elem.selectionStart;
                        var selectionEnd = elem.selectionEnd;
                        elem.value = value;
                        elem.setSelectionRange(selectionStart,selectionEnd);
                    } else {
                        elem.value = value;
                    }
                }

                
                var carriageReturnValue = value.replace(/(\r\n)|\n/g,'\r\n');
                component.set("v.value",carriageReturnValue,true);
            }
        }
    }
  },
  "renderer":{
    "render":function(component, helper) {
        var ret = component.superRender();
        helper.setDomElementValue(component);
        return ret;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputTextArea",
  "st":{
    "descriptor":"css://ui.inputTextArea",
    "cl":"uiInputTextArea"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["rows","aura://Integer","G",false,2],
    ["cols","aura://Integer","G",false,20],
    ["readonly","aura://Boolean","G",false,false],
    ["placeholder","aura://String","G",false,""],
    ["resizable","aura://Boolean","G",false,true],
    ["maxlength","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.valueChange"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.value"
      },
      "n":"change"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"textAreaElem",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.class\"),\" textarea\"),(cmp.get(\"v.resizable\")?\"\":\" noresize\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputTextArea",
                        "path":"v.resizable"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputTextArea",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "cols":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.cols"
                  },
                  "rows":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.rows"
                  },
                  "readonly":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.readonly"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.maxlength"
                  },
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.disabled"
                  },
                  "role":"textbox",
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.placeholder"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputTextArea",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"textarea"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, textarea",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputTimePicker", (function (){/*$A.componentService.addComponentClass("markup://ui:inputTimePicker",function() {
return {
  "meta":{
    "name":"ui$inputTimePicker",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:panelPositioningLib"
    }
  },
  "controller":{
    "selectTime":function(component, event, helper) {
        helper.selectTime(component, event);
    },
    "handleMouseover":function(component, event) {
        var elem = event.target || event.srcElement;
        if (!$A.util.isUndefinedOrNull(elem)) {
            elem.focus();
        }
    },
    "show":function(component, event, helper) {
        helper.show(component, event);
    }
  },
  "helper":{
    "show":function(component, event) {
        var params = event.getParam('arguments');
        if (params) {
            if (params.hours) {
                component.set("v.hours", params.hours);
                component.set("v.minutes", params.minutes);
            }

            
            component._focus = params.focus;

            component.set("v.visible", true);
        }
    },
    "position":function(component) {
        var element = component.find("timeDropdown").getElement();
        var target = component.get("v.referenceElement");
        var self = this;
        if (target && element) {
            var scrollableParent = this._getScrollableParent(element);
            this._handleScroll = function () {
                self.lib.panelPositioning.reposition();
            };

            this._handleWheel = function (e) {
                var elScrollableParent = self._getScrollableParent(element);
                if (elScrollableParent && elScrollableParent.scrollTop) {
                    elScrollableParent.scrollTop += e.deltaY;
                }

            };

            
            
            
            
            if (scrollableParent) {
                scrollableParent.addEventListener('scroll', this._handleScroll);
                element.addEventListener('wheel', this._handleWheel);
            }

            var shouldFlip = this.shouldFlip(element, target);
            var referenceVerticalAlign = shouldFlip ? "top" : "bottom";
            var elementVerticalAlign = shouldFlip ? "bottom" : "top";
            var horizontalAlign = this.shouldAlignToRight(element, target) ? "right" : "left";

            component.positionConstraint = this.lib.panelPositioning.createRelationship({
                element: element,
                target: target,
                appendToBody: true,
                scrollableParentBound: true,
                align: horizontalAlign + " " + elementVerticalAlign,
                targetAlign: horizontalAlign + " " + referenceVerticalAlign
            });
            this.lib.panelPositioning.reposition($A.getCallback(function () {
                self.scrollToSelectedTime(component);
            }));
        } else {
            this.scrollToSelectedTime(component);
        }
    },
    "_getScrollableParent":function(elem) {

        if (this._scrollableParent) {
            return this._scrollableParent;
        }

        
        
        var overflow = getComputedStyle(elem)['overflow-y'];

        if (overflow === 'auto') {
            this._scrollableParent = elem;
            return elem;
        }

        if (elem === document.body) {
            this._scrollableParent = null;
            return null;
        }

        return this._getScrollableParent(elem.parentNode);

    },
    "shouldFlip":function(element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var height = typeof elemRect.height !== 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;

        if (referenceElemRect.top >= height         
            && (viewPort.height - referenceElemRect.bottom) < height) { 
            return true;
        }
        return false;
    },
    "shouldAlignToRight":function(element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var width = typeof elemRect.width !== 'undefined' ? elemRect.width : elemRect.right - elemRect.left;

        if (referenceElemRect.right >= width         
            && (viewPort.width - referenceElemRect.left) < width) { 
            return true;
        }
        return false;
    },
    "selectTime":function(component, event) {
        event.stopPropagation();
        var li = event.target || event.srcElement;
        var hours = li.getAttribute("data-hours"),
            minutes = li.getAttribute("data-minutes");
        component.set("v.hours", hours);
        component.set("v.minutes", minutes);
        var setDateTimeEvent = component.getEvent("selectDate");
        if (setDateTimeEvent) {
            setDateTimeEvent.setParams({
                "hours": hours,
                "minutes": minutes
            });
            setDateTimeEvent.fire();
        }

        this.hide(component, true);
    },
    "hide":function(component, shouldFocusReferenceElem) {
        component.set("v.visible", false);
        if ($A.get("$Browser.formFactor") === "DESKTOP" && shouldFocusReferenceElem) {
            var referenceElem = component.get("v.referenceElement");
            if (!$A.util.isUndefinedOrNull(referenceElem)) {
                referenceElem.focus();
            }
        }
    },
    "renderList":function(component) {
        var listCmp = component.find("timeList");
        var listElem = listCmp ? listCmp.getElement() : null;
        if (listElem) {
            
            listElem.innerHTML = "";
            var date = new Date();
            var minIncrement = component.get("v.interval"),
                timeFormat = component.get("v.timeFormat"),
                currentHour = component.get("v.hours"),
                currentMinutes = component.get("v.minutes");

            for (var hour = 0; hour < 24; hour++) {
                for (var minutes = 0; minutes < 60; minutes += minIncrement) {
                    date.setHours(hour, minutes);
                    var displayValue = $A.localizationService.formatTime(date, timeFormat);
                    var selected = currentHour === hour && currentMinutes === minutes;
                    this.appendListElement(listElem, displayValue, hour, minutes, selected);
                }
            }
        }
    },
    "updateGlobalEventListeners":function(component) {
        var visible = component.get("v.visible");
        if (!component._clickHandler) {
            component._clickHandler = component.addDocumentLevelHandler("mouseup", this.getOnClickFunction(component), visible);
        } else {
            component._clickHandler.setEnabled(visible);
        }
    },
    "getOnClickFunction":function(component) {
        var f = function (event) {
            if (!this.isElementInComponent(component, event.target)) {
                this.hide(component, false);
            }
        }.bind(this);
        return f;
    },
    "isElementInComponent":function(component, targetElem) {
        var componentElements = component.getElements();
        
        var currentNode = targetElem;
        do {
            for (var index = 0; index < componentElements.length; index++) {
                if (componentElements[index] === currentNode) {
                    return true;
                }
            }
            currentNode = currentNode.parentNode;
        } while (currentNode);

        return false;
    },
    "appendListElement":function(listElem, displayValue, hourValue, minuteValue) {
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(displayValue));
        
        var hours = ("0" + hourValue).slice(-2),
            minutes = ("0" + minuteValue).slice(-2);
        entry.setAttribute("data-hours", hours);
        entry.setAttribute("tabindex", 0);
        entry.setAttribute("role", "menuitem");
        entry.setAttribute("data-minutes", minutes);
        entry.setAttribute("id", hours + minutes);
        listElem.appendChild(entry);
    },
    "scrollToSelectedTime":function(component) {
        var helper = this;
        window.requestAnimationFrame($A.getCallback(function () {
            var hours = component.get("v.hours"),
                minutes = component.get("v.minutes"),
                interval = component.get("v.interval"),
                closestMinute;

            var mod = minutes % interval,
                quotient = Math.floor(minutes / interval);
            if (mod === 0) {
                closestMinute = minutes;
            } else {
                var multiplier = mod < interval / 2 ? quotient : quotient + 1;
                closestMinute = multiplier * interval;
                if (closestMinute >= 60) {
                    if (hours === 23) {
                        closestMinute -= interval;
                    } else {
                        closestMinute = 0;
                        hours++;
                    }
                }
            }
            var time = ("0" + hours).slice(-2) + ("0" + closestMinute).slice(-2);
            if (!$A.util.isUndefinedOrNull(time)) {
                var elem = document.querySelector(".visible li[id = '" + time + "']");
                if (!$A.util.isUndefinedOrNull(elem)) {
                    helper.focusElement(component, elem);
                }
            }
        }));
    },
    "focusElement":function(component, element) {
        if (this.shouldReturnFocusToInput(component)) {
            var referenceElement = component.get("v.referenceElement");
            if (referenceElement) {
                referenceElement.focus();
            }
        } else {
            element.focus();
        }
    },
    "shouldReturnFocusToInput":function(component) {
        return !$A.util.isUndefinedOrNull(component._focus)
            && component._focus === false;
    },
    "setEventHandlers":function(component) {
        var el = component.find("timeList").getElement();
        $A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
        $A.util.on(el, "mousewheel", this.getMousewheelHandler(component));
    },
    "removeEventHandlers":function(component) {
        var el = component.find("timeList").getElement();
        $A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
        $A.util.removeOn(el, "mousewheel", this.getMousewheelHandler(component));
        delete component._keyboardEventHandler;
        delete component._mousewheelEventHandler;
    },
    "getMousewheelHandler":function(component) {
        if (!component._mousewheelEventHandler) {
            component._mousewheelEventHandler = function (event) {
                
                
                event.stopPropagation();
            };
        }
        return component._mousewheelEventHandler;
    },
    "getKeyboardInteractionHandler":function(component) {
        var helper = this;
        if (!component._keyboardEventHandler) {
            component._keyboardEventHandler = function (event) {
                if (event.type === "keydown") {
                    if (event.keyCode === 39 || event.keyCode === 40) { 
                        event.preventDefault();
                        helper.setFocusToNextItem(component, event);
                    } else if (event.keyCode === 37 || event.keyCode === 38) {  
                        event.preventDefault();
                        helper.setFocusToPreviousItem(component, event);
                    } else if (event.keyCode === 9 && event.shiftKey === true) {  
                        $A.util.squash(event, true);
                        helper.hide(component, true);
                    } else if (event.keyCode === 27) {  
                        $A.util.squash(event, true);
                        helper.hide(component, true);
                    } else if (event.keyCode === 9) {   
                        helper.hide(component, true);
                    } else if (event.keyCode === 32 || event.keyCode === 13) {  
                        event.preventDefault();
                        helper.selectTime(component, event);
                    }
                }
            };
        }
        return component._keyboardEventHandler;
    },
    "setFocusToNextItem":function(component, event) {
        var li = event.target || event.srcElement;
        var hours = parseInt(li.getAttribute("data-hours")),
            minutes = parseInt(li.getAttribute("data-minutes")),
            interval = component.get("v.interval"),
            newMinutes;

        newMinutes = minutes + interval;
        if (newMinutes >= 60) {
            if (hours >= 23) {
                return;
            }
            newMinutes = 0;
            hours++;
        }
        var time = ("0" + hours).slice(-2) + ("0" + newMinutes).slice(-2);
        if (!$A.util.isUndefinedOrNull(time)) {
            var elem = document.querySelector(".visible li[id = '" + time + "']");
            if (!$A.util.isUndefinedOrNull(elem)) {
                elem.focus();
            }
        }
    },
    "setFocusToPreviousItem":function(component, event) {
        var li = event.target || event.srcElement;
        var hours = parseInt(li.getAttribute("data-hours")),
            minutes = parseInt(li.getAttribute("data-minutes")),
            interval = component.get("v.interval"),
            newMinutes;

        newMinutes = minutes - interval;
        if (newMinutes < 0) {
            if (hours <= 0) {
                return;
            }
            newMinutes = 60 - interval;
            hours--;
        }
        var time = ("0" + hours).slice(-2) + ("0" + newMinutes).slice(-2);
        if (!$A.util.isUndefinedOrNull(time)) {
            var elem = document.querySelector(".visible li[id = '" + time + "']");
            if (!$A.util.isUndefinedOrNull(elem)) {
                elem.focus();
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        var visible = component.get("v.visible");
        if (visible === true) {
            if (component.get("v._timeListInitialized") === false) {
                helper.renderList(component);
                component.set("v._timeListInitialized", true);
            }

            helper.position(component);
        }
        helper.updateGlobalEventListeners(component);
        helper.setEventHandlers(component);
        component.superAfterRender();
    },
    "rerender":function(component, helper) {
        component.superRerender();
        var visible = component.get("v.visible");
        if (visible === true) {
            var shouldRerender = component.get("v._timeListInitialized") === false || component.isDirty("v.interval");
            if (shouldRerender) {
                helper.renderList(component);
                component.set("v._timeListInitialized", true);
            }
            helper.position(component);
        }
        helper.updateGlobalEventListeners(component);
    },
    "unrender":function(component, helper) {
        if (component.positionConstraint) {
            component.positionConstraint.destroy();
        }
        helper.removeEventHandlers(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:inputTimePicker",
  "st":{
    "descriptor":"css://ui.inputTimePicker",
    "cl":"uiInputTimePicker"
  },
  "fst":{
    "descriptor":"css://ui.inputTimePicker"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,false],
    ["timeFormat","aura://String","I",false],
    ["hours","aura://Integer","I",false,12],
    ["minutes","aura://Integer","I",false,0],
    ["interval","aura://Integer","I",false,30],
    ["referenceElement","aura://Object","I",false,null],
    ["_timeListInitialized","aura://Boolean","p",false,false]
  ],
  "med":[
    {
      "name":"ui:show",
      "xs":"I",
      "attributes":[
        ["hours","aura://Integer","I",false],
        ["minutes","aura://Integer","I",false],
        ["focus","aura://Boolean","I",false,"false"]
      ]
    }
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:selectDate",
      "n":"selectDate",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"timeDropdown",
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),(fn.eq(cmp.get(\"v.visible\"),true)?\" visible\":\"\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputTimePicker",
                        "path":"v.visible"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputTimePicker",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"dropdown dropdown--left datepicker datepicker--time scrollable",
                            "aria-hidden":"false",
                            "data-selection":"time"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"timeList",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"datepicker--time__list",
                                      "onmouseover":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputTimePicker",
                                        "path":"c.handleMouseover"
                                      },
                                      "role":"menu",
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputTimePicker",
                                        "path":"c.selectTime"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"ul"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:label", (function (){/*$A.componentService.addComponentClass("markup://aura:label",function() {
return {
  "meta":{
    "name":"aura$label",
    "extends":"markup://aura:component"
  },
  "controller":{
    "updateTemplate":function(cmp) {
        if(!cmp.get("v.updating")){
            var bodyTemplate=cmp.get("v.body");
            for(var i=0;i<bodyTemplate.length;i++){
                if (bodyTemplate[i].isInstanceOf("aura:text")) {
                    bodyTemplate.splice(i--,1);
                }
            }
            cmp.set("v.template", bodyTemplate);
        }
        cmp.set("v.updating",false);
    },
    "update":function(cmp) {
        var value=cmp.get("v.value")||'';
        
        if(!value||!$A.util.isString(value)){
            cmp.set("v.updating",true);
            return cmp.getSuper().set("v.body",[]);
        }

        
        var formatRegex=/\{(\d+)\}/gm;
        var template=cmp.get("v.template");
        if(!template||!template.length||!formatRegex.test(value)){
            
            var valueText=$A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value}});
            cmp.set("v.updating",true);
            return cmp.getSuper().set("v.body",[valueText]);
        }

        
        var body=[];
        var startIndex=0;
        value.replace(formatRegex, function(match, position, index) {
            var substitution = template[position];
            if (substitution !== undefined) {
                
                body.push($A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value.substring(startIndex,index)}}));
                body.push(substitution);
                startIndex=index+match.length;
            }
        });
        
        if(startIndex<value.length){
            body.push($A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value.substring(startIndex)}}));
        }
        cmp.set("v.updating",true);
        cmp.getSuper().set("v.body",body);
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://aura:label",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["template","aura://Aura.Component[]","p",false,[]],
    ["updating","aura://Boolean","p",false],
    ["value","aura://String","I",false]
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateTemplate"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateTemplate"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.body"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.template"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.value"
      },
      "n":"change"
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://auraStorage:init", (function (){/*$A.componentService.addComponentClass("markup://auraStorage:init",function() {
return {
  "meta":{
    "name":"auraStorage$init",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(cmp, event, helper) {
        helper.init(cmp);
    },
    "connectionLost":function(cmp, event, helper) {
        var storage = helper.getStorage(cmp);
        if (storage) {
            storage.suspendSweeping();
        }
    },
    "connectionResumed":function(cmp, event, helper) {
        var storage = helper.getStorage(cmp);
        if (storage) {
            storage.resumeSweeping();
        }
    }
  },
  "helper":{
    "getStorage":function(cmp) {
        return $A.storageService.getStorage(cmp.get("v.name"));
    },
    "init":function(cmp) {
        var debugLoggingEnabled = $A.util.getBooleanValue(cmp.get("v.debugLoggingEnabled"));
        var name = cmp.get("v.name");
        var defaultExpiration = parseInt(cmp.get("v.defaultExpiration"),10);
        var defaultAutoRefreshInterval = parseInt(cmp.get("v.defaultAutoRefreshInterval"),10);
        var maxSize = cmp.get("v.maxSize") * 1024.0; 
        var clearStorageOnInit = $A.util.getBooleanValue(cmp.get("v.clearStorageOnInit"));
        var persistent = $A.util.getBooleanValue(cmp.get("v.persistent"));
        var secure = $A.util.getBooleanValue(cmp.get("v.secure"));
        var version = cmp.get("v.version");

        $A.storageService.initStorage({
            "name":                name,
            "persistent":          persistent,
            "secure":              secure,
            "maxSize":             maxSize,
            "expiration":          defaultExpiration,
            "debugLogging":        debugLoggingEnabled,
            "clearOnInit":         clearStorageOnInit,
            "version":             version,
            "autoRefreshInterval": defaultAutoRefreshInterval
        });

    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://auraStorage:init",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["name","aura://String","G",true],
    ["persistent","aura://Boolean","G",false,false],
    ["secure","aura://Boolean","G",false,false],
    ["clearStorageOnInit","aura://Boolean","G",false,true],
    ["defaultExpiration","aura://Integer","G",false,10],
    ["defaultAutoRefreshInterval","aura://Integer","G",false,30],
    ["maxSize","aura://Integer","G",false,1000],
    ["debugLoggingEnabled","aura://Boolean","G",false,false],
    ["version","aura://String","G",false,""]
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "ed":{
        "descriptor":"markup://aura:connectionLost"
      },
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.connectionLost"
      }
    },
    {
      "ed":{
        "descriptor":"markup://aura:connectionResumed"
      },
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.connectionResumed"
      }
    }
  ],
  "hs":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:button", (function (){/*$A.componentService.addComponentClass("markup://ui:button",function() {
return {
  "meta":{
    "name":"ui$button",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(cmp, event, helper) {
        helper.initializeHandlers(cmp);
        helper.validateButtonType(cmp);
    },
    "addHandler":function(cmp, event, helper) {
        var params = event.getParam('arguments');
        helper.addHandler(cmp, params);
    },
    "keydown":function(cmp, event) {
        var keydownEvent = cmp.getEvent("keydown");
        keydownEvent.setParams({"domEvent": event});
        keydownEvent.fire();
    },
    "mouseover":function(cmp, event, helper) {
        helper.catchAndFireEvent(cmp, event, 'mouseover');
    },
    "mouseout":function(cmp, event, helper) {
        helper.catchAndFireEvent(cmp, event, 'mouseout');
    },
    "focus":function(cmp, event, helper) {
        helper.catchAndFireEvent(cmp, event, 'focus');
    },
    "blur":function(cmp, event, helper) {
        helper.catchAndFireEvent(cmp, event, 'blur');
    },
    "press":function(cmp, event, helper) {
        helper.catchAndFireEvent(cmp, event, 'press');
    }
  },
  "helper":{
    "EVENT_DISPATCH":{
      "keydown":"onkeydown",
      "mouseover":"onmouseover",
      "mouseout":"onmouseout",
      "focus":"onfocus",
      "blur":"onblur",
      "press":"onclick"
    },
    "VALID_BUTTON_TYPES":[
      "submit",
      "button",
      "reset"
    ],
    "initializeHandlers":function(cmp) {
        var htmlButton = cmp.find('button');
        var htmlAttr   = htmlButton.get('v.HTMLAttributes');
        var dispatcher = cmp.getConcreteComponent().getEventDispatcher();

        for (var e in this.EVENT_DISPATCH) {
            if (dispatcher[e] && dispatcher[e]["bubble"] && dispatcher[e]["bubble"].length) {
                htmlAttr[this.EVENT_DISPATCH[e]] = cmp.getReference('c.' + e);
            }
        }
    },
    "validateButtonType":function(cmp) {
        var buttonType = cmp.get("v.buttonType");
        if(this.VALID_BUTTON_TYPES.indexOf(buttonType.toLowerCase()) === -1) {
            
            cmp.set("v.buttonType", "submit");
        }
    },
    "addHandler":function(cmp, handlerParams) {
        var eventName = handlerParams.eventName;
        var htmlEventName = this.EVENT_DISPATCH[eventName];
        $A.assert(htmlEventName, 'Type of event not supported');

        var valueProvider = handlerParams.valueProvider;
        var actionExpression = handlerParams.actionExpression;
        var uiButton = cmp;
        while (!(uiButton.getDef().getDescriptor().getQualifiedName() === "markup://ui:button")) {
            uiButton = uiButton.getSuper();
        }
        var htmlButton = uiButton.find('button');
        var originalAddHandler = htmlButton.addHandler;
        var htmlAttr = htmlButton.get('v.HTMLAttributes');

        
        htmlAttr[htmlEventName] = cmp.getReference('c.' + eventName);
        
        htmlButton.set('v.HTMLAttributes', htmlAttr);

        
        originalAddHandler.call(cmp, eventName, valueProvider, actionExpression);

    },
    "catchAndFireEvent":function(cmp, event, eventName) {
        if (eventName === 'press' && $A.util.getBooleanValue(cmp.get("v.stopPropagation"))) {
            $A.util.squash(event);
        }

        if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
            return event.preventDefault();
        }

        cmp.getEvent(eventName).fire({"domEvent": event});
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:button",
  "st":{
    "descriptor":"css://ui.button",
    "cl":"uiButton"
  },
  "fst":{
    "descriptor":"css://ui.button"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["buttonTitle","aura://String","G",false],
    ["buttonType","aura://String","G",false,"button"],
    ["class","aura://String","G",false,""],
    ["variant","aura://String","PP",false,""],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelDisplay","aura://Boolean","I",false,true],
    ["iconImgSrc","aura://String","I",false,""],
    ["iconClass","aura://String","I",false,""],
    ["selectedClass","aura://String","I",false,"is-selected"],
    ["notSelectedClass","aura://String","I",false,"not-selected"],
    ["classList","aura://String","p",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["accesskey","aura://String","G",false],
    ["labelDir","aura://String","I",false,"ltr"],
    ["stopPropagation","aura://Boolean","I",false,false],
    ["tabIndex","aura://Integer","I",false],
    ["stateful","aura://Boolean","I",false,false],
    ["selected","aura://Boolean","I",false,false]
  ],
  "med":[
    {
      "name":"ui:addHandler",
      "xs":"I",
      "attributes":[
        ["eventName","aura://String","I",false],
        ["valueProvider","aura://Object","I",false,null],
        ["actionExpression","aura://Aura.Action","I",false,null]
      ]
    }
  ],
  "re":[
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur"
    },
    {
      "ed":"markup://ui:press",
      "n":"press",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "ld":{
    "button":{
      "description":"Simple UI button",
      "isPrimitive":true
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"button",
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.join(\" \",(cmp.get(\"v.variant\")||fn.token(\"uiButton.button\")),(cmp.get(\"v.stateful\")?(cmp.get(\"v.selected\")?fn.add(\"is-selected \",fn.token(\"uiButton.is-selected\")):fn.add(\"not-selected \",fn.token(\"uiButton.not-selected\"))):\"\"),cmp.get(\"v.class\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:button",
                        "path":"v.variant"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:button",
                        "path":"v.class"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:button",
                        "path":"v.stateful"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:button",
                        "path":"v.selected"
                      }
                    ],
                    "byValue":false
                  },
                  "accesskey":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:button",
                    "path":"v.accesskey"
                  },
                  "aria-live":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return (cmp.get(\"v.stateful\")?\"assertive\":\"off\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:button",
                        "path":"v.stateful"
                      }
                    ],
                    "byValue":false
                  },
                  "type":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:button",
                    "path":"v.buttonType"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:button",
                    "path":"v.disabled"
                  },
                  "tabindex":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:button",
                    "path":"v.tabIndex"
                  },
                  "title":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:button",
                    "path":"v.buttonTitle"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"button"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return (fn.ne(cmp.get(\"v.iconImgSrc\"),\"\")||fn.ne(cmp.get(\"v.iconClass\"),\"\")); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:button",
                                "path":"v.iconImgSrc"
                              },
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:button",
                                "path":"v.iconClass"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":{
                                        "exprType":"FUNCTION",
                                        "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.iconClass\"),\" icon bLeft\"); }",
                                        "args":[
                                          {
                                            "exprType":"PROPERTY",
                                            "byValue":false,
                                            "target":"ui:button",
                                            "path":"v.iconClass"
                                          }
                                        ],
                                        "byValue":false
                                      },
                                      "alt":"",
                                      "src":{
                                        "exprType":"FUNCTION",
                                        "code":"function(cmp, fn) { return (fn.ne(cmp.get(\"v.iconImgSrc\"),\"\")?cmp.get(\"v.iconImgSrc\"):\"/auraFW/resources/aura/s.gif\"); }",
                                        "args":[
                                          {
                                            "exprType":"PROPERTY",
                                            "byValue":false,
                                            "target":"ui:button",
                                            "path":"v.iconImgSrc"
                                          }
                                        ],
                                        "byValue":false
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"img"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return (cmp.get(\"v.labelDisplay\")&&!(fn.empty(cmp.get(\"v.label\")))); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:button",
                                "path":"v.label"
                              },
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:button",
                                "path":"v.labelDisplay"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "else":{
                          "descriptor":"else",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"FUNCTION",
                                      "code":"function(cmp, fn) { return !(fn.empty(cmp.get(\"v.label\"))); }",
                                      "args":[
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:button",
                                          "path":"v.label"
                                        }
                                      ],
                                      "byValue":false
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "localId":"hidden",
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:button",
                                                          "path":"v.label"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"span",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":{
                                        "exprType":"FUNCTION",
                                        "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.labelClass\"),\" label bBody\"); }",
                                        "args":[
                                          {
                                            "exprType":"PROPERTY",
                                            "byValue":false,
                                            "target":"ui:button",
                                            "path":"v.labelClass"
                                          }
                                        ],
                                        "byValue":false
                                      },
                                      "dir":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:button",
                                        "path":"v.labelDir"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"span"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:button",
                                                "path":"v.label"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:button",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:format", (function (){/*$A.componentService.addComponentClass("markup://ui:format",function() {
return {
  "meta":{
    "name":"ui$format",
    "extends":"markup://aura:component"
  },
  "controller":{
    "updateTemplate":function(cmp) {
        if(!cmp.get("v.updating")){
            cmp.set("v.template",cmp.get("v.body"));
        }
        cmp.set("v.updating",false);
    },
    "update":function(cmp) {
        var value=cmp.get("v.value")||'';
        
        if(!value||!$A.util.isString(value)){
            cmp.set("v.updating",true);
            cmp.getSuper().set("v.body",[]);
            return;
        }

        
        var formatRegex=/\{(\d+)\}/gm;
        var template=cmp.get("v.template");
        if(!template||!template.length||!formatRegex.test(value)){
            cmp.set("v.updating",true);
            $A.createComponent("aura:text",{"value":value},function(valueText){
                cmp.getSuper().set("v.body",[valueText]);
            });
            return;
        }

        
        var texts=[];
        var body=[];
        var startIndex=0;
        value.replace(formatRegex,function(match,position,index){
            var substitution=template[position];
            if(substitution!==undefined){
                texts.push(["aura:text",{"value":value.substring(startIndex,index)}]);
                body.push(null);
                body.push(substitution);
                startIndex=index+match.length;
            }
        });
        
        if(startIndex<value.length){
            texts.push(["aura:text",{"value":value.substring(startIndex)}]);
            body.push(null);
        }
        cmp.set("v.updating",true);
        $A.createComponents(texts,function(valueTexts){
            for(var i=0;i<body.length;i++){
                if(body[i]===null){
                    body[i]=valueTexts.shift();
                }
            }
            cmp.getSuper().set("v.body",body);
        });
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:format",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["template","aura://Aura.Component[]","p",false,[]],
    ["updating","aura://Boolean","p",false],
    ["value","aura://String","I",false]
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateTemplate"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.updateTemplate"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.body"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.template"
      },
      "n":"change"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.update"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"v.value"
      },
      "n":"change"
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputCheckbox", (function (){/*$A.componentService.addComponentClass("markup://ui:inputCheckbox",function() {
return {
  "meta":{
    "name":"ui$inputCheckbox",
    "extends":"markup://ui:input"
  },
  "helper":{
    "getDomElementValue":function(element) {
        return element.checked;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputCheckbox",
  "st":{
    "descriptor":"css://ui.inputCheckbox",
    "cl":"uiInputCheckbox"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","I",false,""],
    ["value","aura://Boolean","G",false,false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change,click"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["name","aura://String","G",false],
    ["text","aura://String","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputBaseOption"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"checkbox",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputCheckbox",
                    "path":"v.class"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputCheckbox",
                    "path":"v.text"
                  },
                  "type":"checkbox",
                  "name":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputCheckbox",
                    "path":"v.name"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputCheckbox",
                    "path":"v.disabled"
                  },
                  "checked":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.eq(cmp.get(\"v.value\"),true); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputCheckbox",
                        "path":"v.value"
                      }
                    ],
                    "byValue":false
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputCheckbox",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, checkbox",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputCurrency", (function (){/*$A.componentService.addComponentClass("markup://ui:inputCurrency",function() {
return {
  "meta":{
    "name":"ui$inputCurrency",
    "extends":"markup://ui:input"
  },
  "controller":{
    "initialize":function(cmp, event, helper) {
        helper.setDefaultAttrs(cmp);
    },
    "handleChange":function(cmp, event) {
        event.stopPropagation();
        cmp.getEvent('change').fire();
    }
  },
  "helper":{
    "setDefaultAttrs":function(cmp) {
        cmp.set('v.updateOnDisabled', true);
    },
    "handleUpdate":function() {
        
        
        
        
    },
    "fireEvent":function(component, event) {
        
        
        
        
        if (event.type !== 'change') {
            this.lib.interactive.fireEvent(component, event);
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputCurrency",
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Decimal","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false],
    ["max","aura://Decimal","PP",false,99999999999999],
    ["min","aura://Decimal","PP",false,-99999999999999],
    ["step","aura://Decimal","I",false,1],
    ["format","aura://String","G",false],
    ["valueScale","aura://Integer","I",false,0],
    ["doFormat","aura://Boolean","I",false,true]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent",
    "markup://ui:inputNumberComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.initialize"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://ui:inputSmartNumber"
          },
          "attributes":{
            "values":{
              "class":{
                "descriptor":"class",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.class"
                }
              },
              "min":{
                "descriptor":"min",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.min"
                }
              },
              "disabled":{
                "descriptor":"disabled",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.disabled"
                }
              },
              "id":{
                "descriptor":"id",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.domId"
                }
              },
              "updateOn":{
                "descriptor":"updateOn",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.updateOn"
                }
              },
              "style":{
                "descriptor":"style",
                "value":"currency"
              },
              "format":{
                "descriptor":"format",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.format"
                }
              },
              "max":{
                "descriptor":"max",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.max"
                }
              },
              "step":{
                "descriptor":"step",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.step"
                }
              },
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.value"
                }
              },
              "ariaDescribedBy":{
                "descriptor":"ariaDescribedBy",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.ariaDescribedBy"
                }
              },
              "change":{
                "descriptor":"change",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"c.handleChange"
                }
              },
              "placeholder":{
                "descriptor":"placeholder",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.placeholder"
                }
              },
              "required":{
                "descriptor":"required",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputCurrency",
                  "path":"v.required"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputDate", (function (){/*$A.componentService.addComponentClass("markup://ui:inputDate",function() {
return {
  "meta":{
    "name":"ui$inputDate",
    "extends":"markup://ui:input",
    "imports":{
      "dateTimeLib":"markup://ui:dateTimeLib"
    }
  },
  "controller":{
    "clearValue":function(component, event, helper) {
        helper.setComponentValue(component, "");
    },
    "doInit":function(component, event, helper) {
        helper.init(component);
    },
    "openDatePicker":function(component, event, helper) {
        helper.displayDatePicker(component, true);
    },
    "pickerKeydown":function(component, event, helper) {
        helper.handlePickerTab(component, event);
    },
    "inputDateClick":function(component, event, helper) {
        helper.displayDatePicker(component, false);
    },
    "onDateSelected":function(component, event, helper) {
        helper.handleDateSelectionByManager(component, event);
    },
    "registerManager":function(component, event, helper) {
        helper.registerManager(component, event);
    }
  },
  "helper":{
    "init":function(component) {
        if (component.get("v.disabled")) {
            
            return;
        }
        if ($A.get("$Browser.formFactor") === "DESKTOP") {
            
            if (!component.get("v.displayDatePicker")) {
                component.set("v.placeholder", component.get("v.format"));
            }
            if (component.get("v.useManager")) {
                this.checkManagerExists(component);
            }
        } else {
            component.set("v._isPhoneOrTablet", true);
        }
    },
    "displayValue":function(component) {
        var config = {
            langLocale: this.getLocale(component),
            format: this.getFormat(component),
            timezone: this.getTimezone(component),
            validateString: true
        };

        var displayValue = function (returnValue) {
            this.setInputValue(component, returnValue.date);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },
    "displayDatePicker":function(component, focusDatePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }
        var useManager = component.get("v.useManager"),
            managerExists = component.get("v.managerExists");
        if (useManager && managerExists) {
            this.openDatepickerWithManager(component, focusDatePicker, true);
        } else {
            
            
            this.loadDatePicker(component);

            var datePicker = component.find("datePicker");
            if (datePicker && datePicker.get("v.visible") === false) {
                var currentDate = this.getDateValueForDatePicker(component);
                datePicker.show(currentDate, focusDatePicker);
            }
        }
    },
    "doUpdate":function(component, value) {
        var localizedValue = $A.localizationService.translateFromLocalizedDigits(value);
        var formattedDate = localizedValue;
        if (value) {
            var langLocale = this.getLocale(component);
            var format = this.getFormat(component);
            var date = $A.localizationService.parseDateTimeUTC(localizedValue, format, langLocale, true);

            if (date) {
                date = $A.localizationService.translateFromOtherCalendar(date);
                formattedDate = $A.localizationService.formatDateUTC(date, "YYYY-MM-DD");
            }
        }
        component.set("v.value", formattedDate, true);
    },
    "getInputElement":function(component) {
        var inputCmp = component.getConcreteComponent().find("inputText");
        if (inputCmp) {
            return inputCmp.getElement();
        }
        return component.getElement();
    },
    "getDateValueForDatePicker":function(component) {
        var date;
        var format = this.getFormat(component);
        var langLocale = this.getLocale(component);
        var dateString = this.getInputElement(component).value;
        if (!$A.util.isEmpty(dateString)) {
            date = $A.localizationService.parseDateTime(dateString, format, langLocale, true);
        }
        return date ? $A.localizationService.translateFromOtherCalendar(date) : new Date();
    },
    "getDateString":function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    "togglePickerIcon":function(component) {
        var openIconCmp = component.find("datePickerOpener");
        var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
        var clearCmp = component.find("clear");
        var clearElem = clearCmp ? clearCmp.getElement() : null;

        if (component.get("v._isPhoneOrTablet")) {
            if ($A.util.isEmpty(component.get("v.value"))) { 
                $A.util.swapClass(clearElem, "display", "hide");
                $A.util.swapClass(openIconElem, "hide", "display");
            } else {
                $A.util.swapClass(clearElem, "hide", "display");
                $A.util.swapClass(openIconElem, "display", "hide");
            }
        } else {
            if (component.get('v.displayDatePicker')) {
                if ($A.util.getBooleanValue(component.get('v.disabled'))) {
                    $A.util.swapClass(openIconElem, "display", "hide");
                } else {
                    $A.util.swapClass(openIconElem, "hide", "display");
                }
            }
        }
    },
    "loadDatePicker":function(component) {
        if (!component.get("v.loadDatePicker")) {
            component.set("v.loadDatePicker", true);

            
            this.initializeDatePicker(component);
        }
    },
    "initializeDatePicker":function(component) {
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.set("v.referenceElement", component.find("inputText").getElement());
        }
    },
    "checkManagerExists":function(component) {
        $A.getEvt('markup://ui:registerDatePickerManager').fire({
            sourceComponentId: component.getGlobalId()
        });
    },
    "registerManager":function(component, event) {
        var sourceComponentId = event.getParam('sourceComponentId') || event.getParam("arguments").sourceComponentId;
        if ($A.util.isUndefinedOrNull(sourceComponentId)) {
            return;
        }

        var sourceComponent = $A.componentService.get(sourceComponentId);
        if (sourceComponent && sourceComponent.isInstanceOf("ui:datePickerManager")) {
            component.set("v.managerExists", true);
        }
    },
    "openDatepickerWithManager":function(component, focusDatePicker, toggleVisibility) {
        var currentDate = this.getDateValueForDatePicker(component);

        $A.getEvt('markup://ui:showDatePicker').fire({
            element: this.getInputElement(component),
            value: currentDate ? this.getDateString(currentDate) : currentDate,
            sourceComponentId: component.getGlobalId(),
            focusDatePicker: focusDatePicker,
            toggleVisibility: toggleVisibility
        });
    },
    "handleDateSelectionByManager":function(component, event) {
        var dateValue = event.getParam("value") || event.getParam("arguments").value;
        if (dateValue) {
            this.setComponentValue(component, dateValue);
        }
    },
    "setComponentValue":function(component, newValue) {
        if (component.get("v.value") !== newValue) {
            component.set("v.value", newValue);
            this.fireChangeEvent(component);
        }
    },
    "fireChangeEvent":function(component) {
        component.getEvent("change").fire();
    },
    "setInputValue":function(component, displayValue) {
        var inputElement = this.getInputElement(component);
        if (!$A.util.isUndefinedOrNull(inputElement) && inputElement.value !== displayValue) {
            
            inputElement.value = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : "";
        }
    },
    "getFormat":function(component) {
        return component.get("v.format") || $A.get("$Locale.dateFormat");
    },
    "getTimezone":function(component) {
        return component.get("v.timezone") || $A.get("$Locale.timezone");
    },
    "getLocale":function(component) {
        return component.get("v.langLocale");
    },
    "handlePickerTab":function(component, event) {
        if (event.keyCode === 9) { 
            var useManager = component.get("v.useManager"),
                managerExists = component.get("v.managerExists");
            if (useManager && managerExists) {
                
                this.openDatepickerWithManager(component, true, false);
            } else {
                var datepicker = component.find("datePicker");
                if (datepicker && datepicker.get("v.visible") === true) {
                    datepicker.focus();
                }
            }
        }
    }
  },
  "renderer":{
    "afterRender":function(component) {
        component.superAfterRender();

        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.displayValue(component);
        _helper.togglePickerIcon(component);
        _helper.initializeDatePicker(component);
    },
    "rerender":function(component) {
        var _helper = component.getConcreteComponent().getDef().getHelper();

        _helper.displayValue(component);
        _helper.togglePickerIcon(component);

        return component.superRerender();
    }
  },
  "provider":{
    "provide":function() {
        var isPhoneOrTablet = $A.get("$Browser.isPhone") || $A.get("$Browser.isTablet"),
            isWindows = $A.get("$Browser.isWindowsPhone") || $A.get("$Browser.isWindowsTablet");
        
        if (isPhoneOrTablet && !isWindows) {
            return "markup://ui:inputDateHtml";
        } else {
            return "markup://ui:inputDate";
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputDate",
  "st":{
    "descriptor":"css://ui.inputDate",
    "cl":"uiInputDate"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["format","aura://String","G",false],
    ["displayDatePicker","aura://Boolean","G",false,false],
    ["langLocale","aura://String","G",false],
    ["timezone","aura://String","I",false],
    ["useManager","aura://Boolean","I",false,false],
    ["managerExists","aura://Boolean","p",false,false],
    ["loadDatePicker","aura://Boolean","I",false,false],
    ["placeholder","aura://String","PP",false],
    ["_isPhoneOrTablet","aura://Boolean","p",false,false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    },
    {
      "name":"ui:registerManager",
      "xs":"I",
      "attributes":[
        ["sourceComponentId","aura://String","I",false]
      ]
    },
    {
      "name":"ui:onDateSelected",
      "xs":"I",
      "attributes":[
        ["value","aura://String","I",false]
      ]
    }
  ],
  "i":[
    "markup://ui:inputDateComponent",
    "markup://ui:hasManager",
    "markup://ui:handlesDateSelected"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    },
    {
      "ed":"markup://ui:openPicker",
      "n":"openPicker",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.openDatePicker"
      },
      "n":"openPicker"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":"form-element"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"inputText",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:inputDate",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            },
                            "readonly":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"v._isPhoneOrTablet"
                            },
                            "type":"text",
                            "aria-describedby":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"v.ariaDescribedBy"
                            },
                            "disabled":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"v.disabled"
                            },
                            "placeholder":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"v.placeholder"
                            },
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"c.inputDateClick"
                            },
                            "id":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDate",
                              "path":"v.domId"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"input"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputDate",
                            "path":"v.displayDatePicker"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"datePickerOpener",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"datePicker-openIcon display",
                                      "onkeydown":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputDate",
                                        "path":"c.pickerKeydown"
                                      },
                                      "aria-haspopup":"true",
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputDate",
                                        "path":"c.openDatePicker"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"a"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:text"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":"Date Picker"
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputDate",
                            "path":"v._isPhoneOrTablet"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"clear",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"clearIcon hide",
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputDate",
                                        "path":"c.clearValue"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"a"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:text"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":"Clear Button"
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputDate",
                            "path":"v.loadDatePicker"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:datePicker"
                              },
                              "localId":"datePicker",
                              "attributes":{
                                "values":{
                                  "closeOnClickOut":{
                                    "descriptor":"closeOnClickOut",
                                    "value":true
                                  },
                                  "hideOnSelect":{
                                    "descriptor":"hideOnSelect",
                                    "value":true
                                  },
                                  "showToday":{
                                    "descriptor":"showToday",
                                    "value":true
                                  },
                                  "selectDate":{
                                    "descriptor":"selectDate",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDate",
                                      "path":"c.onDateSelected"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input, datetime",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputDateTime", (function (){/*$A.componentService.addComponentClass("markup://ui:inputDateTime",function() {
return {
  "meta":{
    "name":"ui$inputDateTime",
    "extends":"markup://ui:input",
    "imports":{
      "dateTimeLib":"markup://ui:dateTimeLib"
    }
  },
  "controller":{
    "clearValue":function(component, event, helper) {
        helper.setComponentValue(component, "");
    },
    "doInit":function(component, event, helper) {
        helper.init(component);
    },
    "openDatePicker":function(component, event, helper) {
        helper.displayDatePicker(component, true);
    },
    "openTimePicker":function(component, event, helper) {
        event.stopPropagation();
        helper.displayTimePicker(component, true);
    },
    "inputDateClick":function(component, event, helper) {
        helper.displayDatePicker(component, false);
    },
    "inputTimeFocus":function(component, event, helper) {
        event.stopPropagation();
        helper.displayTimePicker(component, false);
    },
    "pickerKeydown":function(component, event, helper) {
        helper.handlePickerTab(component, event);
    },
    "onDateSelected":function(component, event, helper) {
        helper.handleDateSelectionByManager(component, event);
    },
    "registerManager":function(component, event, helper) {
        helper.registerManager(component, event);
    },
    "setDateTime":function(component, event, helper) {
        helper.handleDateTimeSelection(component, event);
    }
  },
  "helper":{
    "DATE_FORMAT":"YYYY-MM-DD",
    "init":function(component) {
        if (component.get("v.disabled")) {
            if (component.get('v.displayDatePicker') && !component.get('v.useSingleInput')) {
                this.updateTimeFormat(component);
            }
            
            return;
        }
        if (!component.get("v.useSingleInput")) {
            this.updateTimeFormat(component);
            this.setPlaceHolder(component);

            if (component.get("v.useManager")) {
                this.checkManagerExists(component);
            }
        }
    },
    "displayDatePicker":function(component, focusDatePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }

        var currentDate = this.getDateValueForDatePicker(component);
        this.popUpDatePicker(component, currentDate, focusDatePicker);
    },
    "displayTimePicker":function(component, focusTimePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }

        var inputTimeValue = this.getTimeString(component);
        var dateTimeString;
        var hours, minutes;
        if (!$A.util.isEmpty(inputTimeValue)) {
            var inputDateValue = this.getDateString(component);
            if (!$A.util.isEmpty(inputDateValue)) {
                dateTimeString = inputDateValue + " " + inputTimeValue;
            } else {
                
                var todayDate = new Date();
                var todayDateString = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();
                var formattedDate = this.formatDateString(component, todayDateString);

                dateTimeString = formattedDate + " " + inputTimeValue;
            }

            var currentDate = $A.localizationService.parseDateTime(dateTimeString, this.getDateTimeFormat(component), this.getLocale(component));

            
            if (!$A.util.isUndefinedOrNull(currentDate)) {
                hours = currentDate.getHours();
                minutes = currentDate.getMinutes();
            }
        }
        this.popupTimePicker(component, hours, minutes, focusTimePicker);
    },
    "addDomHandler":function(component, event) {
        if (component.get("v.useSingleInput")) {
            var inputElement = this.getInputElement(component);
            this.lib.interactive.attachDomHandlerToElement(component, inputElement, event);
        } else {
            var inputElements = component.getElement().getElementsByTagName('input');
            for (var i = 0; i < inputElements.length; i++) {
                var element = inputElements[i];
                this.lib.interactive.attachDomHandlerToElement(component, element, event);
            }
        }
    },
    "handleUpdate":function(component, event) {
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        
        if (updateOn.indexOf(event.type) > -1) {
            var dateValue = this.getDateString(component);
            var timeValue = this.getTimeString(component);
            if (!component.get("v.useSingleInput")) {
                if ($A.util.isEmpty(dateValue) && !$A.util.isEmpty(timeValue)) { 
                    return;
                }
            }

            var dateTimeParams = {
                date: dateValue,
                time: timeValue,
                ignoreChange: true        
            };
            this.setDateTimeValue(component, dateTimeParams);
        }
    },
    "displayValue":function(component) {
        var config = {
            langLocale: this.getLocale(component),
            timezone: this.getTimezone(component),
            validateString: false       
        };

        if (component.get("v.useSingleInput")) {
            config.format = this.getDateTimeFormat(component);
        } else {
            config.format = this.getDateFormat(component);
            config.timeFormat = this.getTimeFormat(component);
        }

        var displayValue = function (returnValue) {
            this.displayDate(component, returnValue.date);
            this.displayTime(component, returnValue.time);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },
    "getUTCDateString":function(date) {
        return $A.localizationService.formatDateUTC(date, this.DATE_FORMAT);
    },
    "is24HourFormat":function(component) {
        var format = this.getDateTimeFormat(component);
        if (!format) {
            return false;
        }

        var shouldEscape = false;
        for (var i = 0; i < format.length; i++) {
            var c = format.charAt(i);
            if (c === 'h' && shouldEscape === false) {
                return true;
            }
            if (c === '[') {
                shouldEscape = true;
            } else if (c === ']') {
                shouldEscape = false;
            }
        }
        return false;
    },
    "popUpDatePicker":function(component, date, focusDatePicker) {
        var useManager = component.get("v.useManager"),
            managerExists = component.get("v.managerExists");

        if (useManager && managerExists) {
            this.openDatepickerWithManager(component, date, focusDatePicker, true);
        } else {
            
            
            this.loadDatePicker(component);

            var datePicker = component.find("datePicker");
            if (datePicker && datePicker.get("v.visible") === false) {
                var currentDate = this.getUTCDateString(date);
                datePicker.show(currentDate, focusDatePicker);

                if (component.get("v.useSingleInput")) {
                    datePicker.set("v.hours", date.getUTCHours());
                    datePicker.set("v.minutes", date.getUTCMinutes());
                }
            }
        }
    },
    "popupTimePicker":function(component, hours, minutes, focusTimePicker) {
        this.loadTimePicker(component);

        var timePicker = component.find("timePicker");
        if (timePicker && timePicker.get("v.visible") === false) {
            timePicker.show(hours, minutes, focusTimePicker);
        }
    },
    "loadDatePicker":function(component) {
        if (!component.get("v.loadDatePicker")) {
            component.set("v.loadDatePicker", true);

            
            this.initializeDatePicker(component);
        }
    },
    "loadTimePicker":function(component) {
        if (!component.get("v.loadTimePicker")) {
            component.set("v.loadTimePicker", true);
        }

        this.initializeTimePicker(component);
    },
    "initializeDatePicker":function(component) {
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.set("v.referenceElement", component.find("inputDate").getElement());
            datePicker.set("v.is24HourFormat", this.is24HourFormat(component));
        }
    },
    "initializeTimePicker":function(component) {
        var timePicker = component.find("timePicker");
        if (timePicker) {
            timePicker.set("v.referenceElement", component.find("inputTime").getElement());
        }
    },
    "checkManagerExists":function(component) {
        $A.getEvt('markup://ui:registerDatePickerManager').fire({
            sourceComponentId: component.getGlobalId()
        });
    },
    "registerManager":function(component, event) {
        var sourceComponentId = event.getParam('sourceComponentId') || event.getParam("arguments").sourceComponentId;
        if ($A.util.isUndefinedOrNull(sourceComponentId)) {
            return;
        }

        var sourceComponent = $A.componentService.get(sourceComponentId);
        if (sourceComponent && sourceComponent.isInstanceOf("ui:datePickerManager")) {
            component.set("v.managerExists", true);
        }
    },
    "openDatepickerWithManager":function(component, currentDate, focusDatePicker, toggleVisibility) {
        $A.getEvt('markup://ui:showDatePicker').fire({
            element: component.find("inputDate").getElement(),
            value: currentDate ? this.getUTCDateString(currentDate) : currentDate,
            sourceComponentId: component.getGlobalId(),
            focusDatePicker: focusDatePicker,
            toggleVisibility: toggleVisibility
        });
    },
    "closeDatepickerWithManager":function(component) {
        var useManager = component.get("v.useManager"),
        managerExists = component.get("v.managerExists");
        if (useManager && managerExists) {
            $A.getEvt('markup://ui:hideDatePicker').fire();
        }
    },
    "handleDateSelectionByManager":function(component, event) {
        var dateValue = event.getParam("arguments").value;
        if (dateValue) {
            this.setDateValue(component, dateValue);
        }
    },
    "togglePickerIcon":function(component) {
        var openIconCmp = component.find("datePickerOpener");
        var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
        var openTimeIconCmp = component.find("timePickerOpener");
        var openTimeIconElem = openTimeIconCmp ? openTimeIconCmp.getElement() : null;
        var clearCmp = component.find("clear");
        var clearElem = clearCmp ? clearCmp.getElement() : null;

        if (component.get("v.useSingleInput")) {
            if ($A.util.isEmpty(component.get("v.value"))) { 
                $A.util.swapClass(clearElem, "display", "hide");
                $A.util.swapClass(openIconElem, "hide", "display");
            } else {
                $A.util.swapClass(clearElem, "hide", "display");
                $A.util.swapClass(openIconElem, "display", "hide");
            }
        } else {
            if (component.get('v.displayDatePicker')) {
                if ($A.util.getBooleanValue(component.get('v.disabled'))) {
                    $A.util.swapClass(openIconElem, "display", "hide");
                    if (openTimeIconElem) {
                        $A.util.swapClass(openTimeIconElem, "display", "hide");
                    }
                } else {
                    $A.util.swapClass(openIconElem, "hide", "display");
                    if (openTimeIconElem) {
                        $A.util.swapClass(openTimeIconElem, "hide", "display");
                    }
                }
            }
        }
    },
    "handleDateTimeSelection":function(component, event) {
        var dateValue = event.getParam("value"),
            selectedHours = event.getParam("hours"),
            selectedMinutes = event.getParam("minutes");

        if (!component.get("v.useSingleInput")) {
            var hasNewDate = !$A.util.isUndefinedOrNull(dateValue),
                hasNewTime = !$A.util.isUndefinedOrNull(selectedHours) && !$A.util.isUndefinedOrNull(selectedMinutes);

            if (hasNewDate) {
                this.setDateValue(component, dateValue);
            } else if (hasNewTime) {
                this.setTimeValue(component, selectedHours, selectedMinutes);
            }
        } else {
            var config = {
                hours: selectedHours,
                minutes: selectedMinutes,
                timezone: this.getTimezone(component)
            };

            var date = $A.localizationService.parseDateTimeUTC(dateValue, this.DATE_FORMAT, this.getLocale(component));

            var setValue = function (isoValue) {
                this.setComponentValue(component, isoValue);
            }.bind(this);

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        }
    },
    "setDateValue":function(component, dateValue) {
        var displayValue = this.formatDateString(component, dateValue);

        this.displayDate(component, displayValue);

        var dateTimeParams = {
            date: displayValue,
            time: this.getTimeString(component),
            ignoreChange: false
        };
        this.setDateTimeValue(component, dateTimeParams);
    },
    "setTimeValue":function(component, selectedHours, selectedMinutes) {
        var displayValue = this.formatTimeString(component, selectedHours, selectedMinutes);

        this.displayTime(component, displayValue);

        var currentDateString = this.getDateString(component);
        if (!$A.util.isEmpty(currentDateString)) {
            var dateTimeParams = {
                date: currentDateString,
                time: displayValue,
                ignoreChange: false
            };
            this.setDateTimeValue(component, dateTimeParams);
        }
    },
    "setDateTimeValue":function(component, dateTimeParams) {
        var hasTime = !$A.util.isEmpty(dateTimeParams.time);

        var date = this.getDateTime(component, dateTimeParams.date, dateTimeParams.time);
        if (!$A.util.isUndefinedOrNull(date)) {
            var config = {
                timezone: this.getTimezone(component)
            };

            if (!hasTime && !component.get("v.useSingleInput")) {
                
                config.hours = 12;
                config.minutes = 0;
            }

            var setValue = function (isoValue) {
                this.setComponentValue(component, isoValue, dateTimeParams.ignoreChange);
            }.bind(this);

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        } else {
            
            var value = hasTime ? dateTimeParams.date + " " + dateTimeParams.time : dateTimeParams.date;
            this.setComponentValue(component, value, dateTimeParams.ignoreChange);
        }
    },
    "updateTimeFormat":function(component) {
        
        var timeFormat = this.getTimeFormat(component);

        var regexp = /(\W*(?=[sS])[^aAZ\s]*)/;
        var timeWithoutSecondsFormat = timeFormat.replace(regexp, '');
        component.set("v.timeFormat", timeWithoutSecondsFormat);
    },
    "setPlaceHolder":function(component) {
        
        if (!component.get("v.displayDatePicker")) {
            if ($A.util.isEmpty(component.get("v.placeholder"))) {
                component.set("v.placeholder", this.getDateFormat(component));
            }
            if ($A.util.isEmpty(component.get("v.timePlaceholder"))) {
                component.set("v.timePlaceholder", this.getTimeFormat(component));
            }
        }
    },
    "getDateValueForDatePicker":function(component) {
        var currentDate = this.getDateTime(component);
        if (!currentDate) {
            var now = new Date(); 
            
            currentDate = new Date(Date.UTC(now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()));
        } else {
            currentDate = $A.localizationService.translateFromOtherCalendar(currentDate);
        }
        return currentDate;
    },
    "getDateTime":function(component, dateString, timeString) {
        var dateValue = !$A.util.isEmpty(dateString) ? dateString : this.getDateString(component);
        return this.parseDateTimeInput(true, component, dateValue, timeString);
    },
    "getDateString":function(component) {
        var inputDateElement = component.find("inputDate").getElement();
        return $A.localizationService.translateFromLocalizedDigits(inputDateElement.value);
    },
    "getTimeString":function(component) {
        var inputTimeCmp = component.find("inputTime");
        
        var inputTimeElement = inputTimeCmp ? inputTimeCmp.getElement() : null;
        if (!inputTimeElement) {
            return null;
        }
        return $A.localizationService.translateFromLocalizedDigits(inputTimeElement.value);
    },
    "displayDate":function(component, dateDisplayValue) {
        if (!$A.util.isUndefinedOrNull(dateDisplayValue)) {
            var inputElem = component.find("inputDate").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(dateDisplayValue);
        }
    },
    "displayTime":function(component, timeDisplayValue) {
        if (!component.get("v.useSingleInput") && !$A.util.isUndefinedOrNull(timeDisplayValue)) {
            var inputElem = component.find("inputTime").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(timeDisplayValue);
        }
    },
    "formatDateString":function(component, dateString) {
        var utcDate = $A.localizationService.parseDateTimeUTC(dateString, this.DATE_FORMAT);

        if (!utcDate) {
            return "";
        }

        utcDate = $A.localizationService.translateToOtherCalendar(utcDate);
        var formattedDate = $A.localizationService.formatDateUTC(utcDate, this.getDateFormat(component), this.getLocale(component));
        return formattedDate;
    },
    "formatTimeString":function(component, hours, minutes) {
        var date = new Date();
        date.setHours(hours, minutes);
        var formattedTime = $A.localizationService.formatTime(date, this.getTimeFormat(component), this.getLocale(component));

        return formattedTime;
    },
    "shouldUpdateDisplayValue":function(component) {
        
        
        var currentDateString = this.getDateString(component);
        var currentTimeString = this.getTimeString(component);

        return component.get("v.useSingleInput")
            || ($A.util.isEmpty(currentDateString) && $A.util.isEmpty(currentTimeString))
            || $A.util.isEmpty(component.get("v.value"))
            || this.parseDateTimeInput(false, component, currentDateString, currentTimeString);
    },
    "parseDateTimeInput":function(isUTC, component, dateValue, timeValue) {
        if ($A.util.isEmpty(dateValue)) {
            return null;
        }

        var value, format, date;
        var isDesktop = !component.get("v.useSingleInput");

        if (isDesktop) {
            var dateFormat = this.getDateFormat(component);
            var timeFormat = this.getTimeFormat(component);

            var hasTime = !$A.util.isEmpty(timeValue);
            format = hasTime ? dateFormat + " " + timeFormat : dateFormat;
            value = hasTime ? dateValue + " " + timeValue : dateValue;
        } else {
            format = this.getDateTimeFormat(component);
            value = dateValue;
        }

        if (isUTC) {
            date = $A.localizationService.parseDateTimeUTC(value, format, this.getLocale(component), isDesktop);
        } else {
            date = $A.localizationService.parseDateTime(value, format, this.getLocale(component), isDesktop);
        }

        return date;
    },
    "handlePickerTab":function(component, event) {
        if (event.keyCode === 9) { 
            var useManager = component.get("v.useManager"),
                managerExists = component.get("v.managerExists");
            if (useManager && managerExists) {
                
                this.openDatepickerWithManager(component, null, true, false);
            } else {
                var datepicker = component.find("datePicker");
                if (datepicker && datepicker.get("v.visible") === true) {
                    datepicker.focus();
                }
            }
        }
    },
    "setComponentValue":function(component, newValue, ignoreChange) {
        if (component.get("v.value") !== newValue) {
            component.set("v.value", newValue);
            this.fireChangeEvent(component, ignoreChange);
        }
    },
    "fireChangeEvent":function(component, ignoreChange) {
        if (!ignoreChange) {
            component.getEvent("change").fire();
        }
    },
    "getDateFormat":function(component) {
        return component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
    },
    "getTimeFormat":function(component) {
        return component.get("v.timeFormat") || $A.get("$Locale.timeFormat");
    },
    "getDateTimeFormat":function(component) {
        return component.get("v.format") || $A.get("$Locale.datetimeFormat");
    },
    "getTimezone":function(component) {
        return component.get("v.timezone") || $A.get("$Locale.timezone");
    },
    "getLocale":function(component) {
        return component.get("v.langLocale");
    },
    "shouldShowError":function() {
        return true;
    }
  },
  "renderer":{
    "afterRender":function(component) {
        var _helper = component.getConcreteComponent().getDef().getHelper();

        _helper.displayValue(component);
        _helper.togglePickerIcon(component);
        _helper.initializeDatePicker(component);
        _helper.initializeTimePicker(component);

        return component.superAfterRender();
    },
    "rerender":function(component) {
        var _helper = component.getConcreteComponent().getDef().getHelper();

        if (component.isDirty("v.value") && _helper.shouldUpdateDisplayValue(component)) {
            _helper.displayValue(component);
        }
        _helper.togglePickerIcon(component);

        return component.superRerender();
    },
    "unrender":function(component) {        
        
        
        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.closeDatepickerWithManager(component);
        return component.superUnrender();
    }
  },
  "provider":{
    "provide":function() {
        var isPhoneOrTablet = $A.get("$Browser.isPhone") || $A.get("$Browser.isTablet"),
            isWindows = $A.get("$Browser.isWindowsPhone") || $A.get("$Browser.isWindowsTablet");
        
        if (isPhoneOrTablet && !isWindows) {
            return "markup://ui:inputDateTimeHtml";
        } else {
            return "markup://ui:inputDateTime";
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputDateTime",
  "st":{
    "descriptor":"css://ui.inputDateTime",
    "cl":"uiInputDateTime"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["format","aura://String","G",false],
    ["displayDatePicker","aura://Boolean","G",false,false],
    ["langLocale","aura://String","G",false],
    ["timezone","aura://String","I",false],
    ["useManager","aura://Boolean","I",false,false],
    ["dateFormat","aura://String","I",false],
    ["timeFormat","aura://String","I",false],
    ["dateLabel","aura://String","I",false],
    ["timeLabel","aura://String","I",false],
    ["managerExists","aura://Boolean","p",false,false],
    ["useSingleInput","aura://Boolean","I",false,{
      "exprType":"FUNCTION",
      "code":"function(cmp, fn) { return fn.ne($A.get(\"$Browser.formFactor\"),\"DESKTOP\"); }",
      "args":[
        {
          "exprType":"PROPERTY",
          "byValue":false,
          "target":"ui:inputDateTime",
          "path":"$Browser.formFactor"
        }
      ],
      "byValue":false
    }],
    ["placeholder","aura://String","I",false],
    ["timePlaceholder","aura://String","I",false],
    ["loadDatePicker","aura://Boolean","I",false,false],
    ["loadTimePicker","aura://Boolean","I",false,false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    },
    {
      "name":"ui:registerManager",
      "xs":"I",
      "attributes":[
        ["sourceComponentId","aura://String","I",false]
      ]
    },
    {
      "name":"ui:onDateSelected",
      "xs":"I",
      "attributes":[
        ["value","aura://String","I",false]
      ]
    }
  ],
  "i":[
    "markup://ui:inputDateTimeComponent",
    "markup://ui:inputDateComponent",
    "markup://ui:hasManager",
    "markup://ui:handlesDateSelected"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    },
    {
      "ed":"markup://ui:openPicker",
      "n":"openPicker",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.doInit"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.openDatePicker"
      },
      "n":"openPicker"
    }
  ],
  "fa":[
    {
      "descriptor":"isCompound",
      "value":{
        "exprType":"FUNCTION",
        "code":"function(cmp, fn) { return !(cmp.get(\"v.useSingleInput\")); }",
        "args":[
          {
            "exprType":"PROPERTY",
            "byValue":false,
            "target":"ui:inputDateTime",
            "path":"v.useSingleInput"
          }
        ],
        "byValue":false
      }
    },
    {
      "descriptor":"labelPosition",
      "value":"top"
    },
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:if"
          },
          "attributes":{
            "values":{
              "isTrue":{
                "descriptor":"isTrue",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputDateTime",
                  "path":"v.useSingleInput"
                }
              },
              "else":{
                "descriptor":"else",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"form--stacked form-element__group"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"dateTime-inputDate form-element form-element__control"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"form-element__label",
                                                "for":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"v.domId"
                                                }
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"label"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:inputDateTime",
                                                          "path":"v.dateLabel"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "localId":"inputDate",
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":{
                                                  "exprType":"FUNCTION",
                                                  "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                                                  "args":[
                                                    {
                                                      "exprType":"PROPERTY",
                                                      "byValue":false,
                                                      "target":"ui:inputDateTime",
                                                      "path":"v.class"
                                                    }
                                                  ],
                                                  "byValue":false
                                                },
                                                "type":"text",
                                                "aria-describedby":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"v.ariaDescribedBy"
                                                },
                                                "disabled":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"v.disabled"
                                                },
                                                "onclick":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"c.inputDateClick"
                                                },
                                                "placeholder":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"v.placeholder"
                                                },
                                                "id":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:inputDateTime",
                                                  "path":"v.domId"
                                                }
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"input"
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:if"
                                        },
                                        "attributes":{
                                          "values":{
                                            "isTrue":{
                                              "descriptor":"isTrue",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:inputDateTime",
                                                "path":"v.displayDatePicker"
                                              }
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "localId":"datePickerOpener",
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"datePicker-openIcon display",
                                                          "onkeydown":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"c.pickerKeydown"
                                                          },
                                                          "aria-haspopup":"true",
                                                          "onclick":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"c.openDatePicker"
                                                          }
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"a"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"assistiveText"
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"span"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:text"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "value":{
                                                                            "descriptor":"value",
                                                                            "value":"Date Picker"
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDateTime",
                                      "path":"v.loadDatePicker"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://ui:datePicker"
                                        },
                                        "localId":"datePicker",
                                        "attributes":{
                                          "values":{
                                            "closeOnClickOut":{
                                              "descriptor":"closeOnClickOut",
                                              "value":true
                                            },
                                            "hideOnSelect":{
                                              "descriptor":"hideOnSelect",
                                              "value":true
                                            },
                                            "showToday":{
                                              "descriptor":"showToday",
                                              "value":true
                                            },
                                            "selectDate":{
                                              "descriptor":"selectDate",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:inputDateTime",
                                                "path":"c.setDateTime"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"dateTime-inputTime form-element form-element__control"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"div"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"input-has-icon input-has-icon--right"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"div"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":"form-element__label",
                                                          "for":{
                                                            "exprType":"FUNCTION",
                                                            "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.domId\"),\"-time\"); }",
                                                            "args":[
                                                              {
                                                                "exprType":"PROPERTY",
                                                                "byValue":false,
                                                                "target":"ui:inputDateTime",
                                                                "path":"v.domId"
                                                              }
                                                            ],
                                                            "byValue":false
                                                          }
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"label"
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:expression"
                                                            },
                                                            "attributes":{
                                                              "values":{
                                                                "value":{
                                                                  "descriptor":"value",
                                                                  "value":{
                                                                    "exprType":"PROPERTY",
                                                                    "byValue":false,
                                                                    "target":"ui:inputDateTime",
                                                                    "path":"v.timeLabel"
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                },
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:html"
                                                  },
                                                  "localId":"inputTime",
                                                  "attributes":{
                                                    "values":{
                                                      "HTMLAttributes":{
                                                        "descriptor":"HTMLAttributes",
                                                        "value":{
                                                          "class":{
                                                            "exprType":"FUNCTION",
                                                            "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                                                            "args":[
                                                              {
                                                                "exprType":"PROPERTY",
                                                                "byValue":false,
                                                                "target":"ui:inputDateTime",
                                                                "path":"v.class"
                                                              }
                                                            ],
                                                            "byValue":false
                                                          },
                                                          "type":"text",
                                                          "aria-describedby":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"v.ariaDescribedBy"
                                                          },
                                                          "disabled":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"v.disabled"
                                                          },
                                                          "onclick":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"c.inputTimeFocus"
                                                          },
                                                          "placeholder":{
                                                            "exprType":"PROPERTY",
                                                            "byValue":false,
                                                            "target":"ui:inputDateTime",
                                                            "path":"v.timePlaceholder"
                                                          },
                                                          "id":{
                                                            "exprType":"FUNCTION",
                                                            "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.domId\"),\"-time\"); }",
                                                            "args":[
                                                              {
                                                                "exprType":"PROPERTY",
                                                                "byValue":false,
                                                                "target":"ui:inputDateTime",
                                                                "path":"v.domId"
                                                              }
                                                            ],
                                                            "byValue":false
                                                          }
                                                        }
                                                      },
                                                      "tag":{
                                                        "descriptor":"tag",
                                                        "value":"input"
                                                      }
                                                    }
                                                  }
                                                },
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:if"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "isTrue":{
                                                        "descriptor":"isTrue",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:inputDateTime",
                                                          "path":"v.displayDatePicker"
                                                        }
                                                      },
                                                      "body":{
                                                        "descriptor":"body",
                                                        "value":[
                                                          {
                                                            "componentDef":{
                                                              "descriptor":"markup://aura:html"
                                                            },
                                                            "localId":"timePickerOpener",
                                                            "attributes":{
                                                              "values":{
                                                                "HTMLAttributes":{
                                                                  "descriptor":"HTMLAttributes",
                                                                  "value":{
                                                                    "class":"timePicker-openIcon display",
                                                                    "aria-haspopup":"true",
                                                                    "onclick":{
                                                                      "exprType":"PROPERTY",
                                                                      "byValue":false,
                                                                      "target":"ui:inputDateTime",
                                                                      "path":"c.openTimePicker"
                                                                    }
                                                                  }
                                                                },
                                                                "tag":{
                                                                  "descriptor":"tag",
                                                                  "value":"a"
                                                                },
                                                                "body":{
                                                                  "descriptor":"body",
                                                                  "value":[
                                                                    {
                                                                      "componentDef":{
                                                                        "descriptor":"markup://aura:html"
                                                                      },
                                                                      "attributes":{
                                                                        "values":{
                                                                          "HTMLAttributes":{
                                                                            "descriptor":"HTMLAttributes",
                                                                            "value":{
                                                                              "class":"assistiveText"
                                                                            }
                                                                          },
                                                                          "tag":{
                                                                            "descriptor":"tag",
                                                                            "value":"span"
                                                                          },
                                                                          "body":{
                                                                            "descriptor":"body",
                                                                            "value":[
                                                                              {
                                                                                "componentDef":{
                                                                                  "descriptor":"markup://aura:text"
                                                                                },
                                                                                "attributes":{
                                                                                  "values":{
                                                                                    "value":{
                                                                                      "descriptor":"value",
                                                                                      "value":"Time Picker"
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            ]
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:if"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDateTime",
                                      "path":"v.loadTimePicker"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://ui:inputTimePicker"
                                        },
                                        "localId":"timePicker",
                                        "attributes":{
                                          "values":{
                                            "selectDate":{
                                              "descriptor":"selectDate",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:inputDateTime",
                                                "path":"c.setDateTime"
                                              }
                                            },
                                            "timeFormat":{
                                              "descriptor":"timeFormat",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:inputDateTime",
                                                "path":"v.timeFormat"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"inputDate",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:inputDateTime",
                                  "path":"v.class"
                                }
                              ],
                              "byValue":false
                            },
                            "readonly":{
                              "exprType":"FUNCTION",
                              "code":"function(cmp, fn) { return !(cmp.get(\"v.useSingleInput\")); }",
                              "args":[
                                {
                                  "exprType":"PROPERTY",
                                  "byValue":false,
                                  "target":"ui:inputDateTime",
                                  "path":"v.useSingleInput"
                                }
                              ],
                              "byValue":false
                            },
                            "type":"text",
                            "aria-describedby":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"v.ariaDescribedBy"
                            },
                            "disabled":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"v.disabled"
                            },
                            "placeholder":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"v.placeholder"
                            },
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"c.openDatePicker"
                            },
                            "id":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"v.domId"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"input"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputDateTime",
                            "path":"v.displayDatePicker"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "localId":"datePickerOpener",
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"datePicker-openIcon display",
                                      "aria-haspopup":"true",
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:inputDateTime",
                                        "path":"c.openDatePicker"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"a"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:text"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":"Date Picker"
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"clear",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"clearIcon hide",
                            "onclick":{
                              "exprType":"PROPERTY",
                              "byValue":false,
                              "target":"ui:inputDateTime",
                              "path":"c.clearValue"
                            }
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"a"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"assistiveText"
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"span"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:text"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":"Clear Button"
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:inputDateTime",
                            "path":"v.loadDatePicker"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:datePicker"
                              },
                              "localId":"datePicker",
                              "attributes":{
                                "values":{
                                  "closeOnClickOut":{
                                    "descriptor":"closeOnClickOut",
                                    "value":true
                                  },
                                  "hideOnSelect":{
                                    "descriptor":"hideOnSelect",
                                    "value":true
                                  },
                                  "showToday":{
                                    "descriptor":"showToday",
                                    "value":false
                                  },
                                  "selectDate":{
                                    "descriptor":"selectDate",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:inputDateTime",
                                      "path":"c.setDateTime"
                                    }
                                  },
                                  "hasTime":{
                                    "descriptor":"hasTime",
                                    "value":true
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input, datetime",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputEmail", (function (){/*$A.componentService.addComponentClass("markup://ui:inputEmail",function() {
return {
  "meta":{
    "name":"ui$inputEmail",
    "extends":"markup://ui:input"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputEmail",
  "st":{
    "descriptor":"css://ui.inputEmail",
    "cl":"uiInputEmail"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"txt",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputEmail",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "size":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.size"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.value"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.maxlength"
                  },
                  "type":"email",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.disabled"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputEmail",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputNumber", (function (){/*$A.componentService.addComponentClass("markup://ui:inputNumber",function() {
return {
  "meta":{
    "name":"ui$inputNumber",
    "extends":"markup://ui:input"
  },
  "controller":{
    "initialize":function(cmp, event, helper) {
        helper.setDefaultAttrs(cmp);
    },
    "handleChange":function(cmp, event) {
        event.stopPropagation();
        cmp.getEvent('change').fire();
    }
  },
  "helper":{
    "setDefaultAttrs":function(cmp) {
        cmp.set('v.updateOnDisabled', true);
    },
    "handleUpdate":function() {
        
        
        
        
    },
    "fireEvent":function(component, event) {
        
        
        
        
        if (event.type !== 'change') {
            this.lib.interactive.fireEvent(component, event);
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputNumber",
  "st":{
    "descriptor":"css://ui.inputNumber",
    "cl":"uiInputNumber"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Decimal","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false],
    ["max","aura://Decimal","PP",false,99999999999999],
    ["min","aura://Decimal","PP",false,-99999999999999],
    ["step","aura://Decimal","I",false,1],
    ["format","aura://String","G",false],
    ["valueScale","aura://Integer","I",false,0],
    ["doFormat","aura://Boolean","I",false,true]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent",
    "markup://ui:inputNumberComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.initialize"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://ui:inputSmartNumber"
          },
          "attributes":{
            "values":{
              "class":{
                "descriptor":"class",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.class"
                }
              },
              "min":{
                "descriptor":"min",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.min"
                }
              },
              "disabled":{
                "descriptor":"disabled",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.disabled"
                }
              },
              "id":{
                "descriptor":"id",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.domId"
                }
              },
              "updateOn":{
                "descriptor":"updateOn",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.updateOn"
                }
              },
              "style":{
                "descriptor":"style",
                "value":"number"
              },
              "format":{
                "descriptor":"format",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.format"
                }
              },
              "max":{
                "descriptor":"max",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.max"
                }
              },
              "step":{
                "descriptor":"step",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.step"
                }
              },
              "value":{
                "descriptor":"value",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.value"
                }
              },
              "ariaDescribedBy":{
                "descriptor":"ariaDescribedBy",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.ariaDescribedBy"
                }
              },
              "change":{
                "descriptor":"change",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"c.handleChange"
                }
              },
              "placeholder":{
                "descriptor":"placeholder",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.placeholder"
                }
              },
              "required":{
                "descriptor":"required",
                "value":{
                  "exprType":"PROPERTY",
                  "byValue":false,
                  "target":"ui:inputNumber",
                  "path":"v.required"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default,input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputPhone", (function (){/*$A.componentService.addComponentClass("markup://ui:inputPhone",function() {
return {
  "meta":{
    "name":"ui$inputPhone",
    "extends":"markup://ui:input"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputPhone",
  "st":{
    "descriptor":"css://ui.inputPhone",
    "cl":"uiInputPhone"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"txt",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputPhone",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "size":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.size"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.value"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.maxlength"
                  },
                  "type":"tel",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.disabled"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputPhone",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputRadio", (function (){/*$A.componentService.addComponentClass("markup://ui:inputRadio",function() {
return {
  "meta":{
    "name":"ui$inputRadio",
    "extends":"markup://ui:input"
  },
  "controller":{
    "handleOnBlur":function(cmp, event) {
        var elem = event.target || event.srcElement;
        var checked = elem.checked;
        cmp.set('v.value', checked);
    }
  },
  "helper":{
    "getDomElementValue":function(element) {
        return element.checked;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputRadio",
  "st":{
    "descriptor":"css://ui.inputRadio",
    "cl":"uiInputRadio"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","I",false,""],
    ["value","aura://Boolean","G",false,false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["name","aura://String","G",false],
    ["text","aura://String","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputBaseOption"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "ld":{
    "radio":{
      "description":"Radio button",
      "isPrimitive":true
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"radio",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.class"
                  },
                  "onblur":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"c.handleOnBlur"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.text"
                  },
                  "type":"radio",
                  "name":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.name"
                  },
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.disabled"
                  },
                  "checked":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.value"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputRadio",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, radio",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputRichText", (function (){/*$A.componentService.addComponentClass("markup://ui:inputRichText",function() {
return {
  "meta":{
    "name":"ui$inputRichText",
    "extends":"markup://ui:inputTextArea"
  },
  "controller":{
    "init":function() {
        $A.clientService.loadClientLibrary('CKEditor', function (error) {
            if (error) {
                $A.error('Error loading CKEditor');
            }
        });
    },
    "toggle":function(cmp, evt, helper) {
		helper.toggle(cmp, evt.getParam('isRichText'));		
	}
  },
  "helper":{
    "addDomHandler":function(cmp, event) {
        var editorInstance = this.getEditorInstance(cmp);

        if (editorInstance && $A.util.isFunction(editorInstance.on)) {
            editorInstance.on(event, $A.getCallback(this.editorEventHandler), cmp);
        } else {
            var element = this.getInputElement(cmp);
            this.lib.interactive.attachDomHandlerToElement(cmp, element, event);
        }
    },
    "handleUpdate":function(cmp, event) {
        var helper = cmp.getDef().getHelper();
        var updateOn = helper.getUpdateOn(cmp);
        
        if (updateOn.indexOf(event.name || event.type) > -1) {
            var value = cmp.get('v.value');
            
            var content = helper.getContent(cmp);
            if (value !== content) {
                
                
                
                
                cmp.set('v.value', content);
            }
        }
    },
    "editorEventHandler":function(event) {
        var cmp;

        
        
        
        if($A.util.isComponent(this) && this.isValid()) {
            cmp = this.getConcreteComponent();
        }

        if (cmp && cmp.isValid()) {
            var helper = cmp.getDef().getHelper();

            if (!helper) {
                return;
            }
            
            if (helper.preEventFiring) {
                helper.preEventFiring(cmp, event);
            }

            
            var e = cmp.getEvent(event.name);
            if (e) {
                e.fire();
            }
        }
    },
    "initEditor":function(cmp, callback) {
        if ($A.util.getBooleanValue(cmp.get('v.isRichText'))) {
            $A.clientService.loadClientLibrary('CKEditor', function () {

                var editorInstance = this.getEditorInstance(cmp);
                if (!editorInstance) {
                    var helper = cmp.getConcreteComponent().getDef().getHelper() || this;
                    editorInstance = CKEDITOR.replace(helper.getEditorId(cmp),  helper.getEditorConfig(cmp));
                }

                if(editorInstance && $A.util.isFunction(editorInstance.on)) {
                    editorInstance.on("loaded", $A.getCallback(function() {
                        if (cmp.isValid()) {
                            cmp.getEvent("editorInstanceReady").fire();
                        }
                        callback();
                    }));
                }
                
            }.bind(this));
        }
    },
    "isLibraryLoaded":function() {
        return typeof CKEDITOR !== "undefined";
    },
    "toggle":function(cmp, isRichText) {
        var editorInstance = this.getEditorInstance(cmp);

        if (isRichText && !cmp.get('v.isRichText')) {
            cmp.set('v.isRichText', isRichText);
            if (!editorInstance) {
                this.initEditor(cmp);
            }
        }
        else if (!isRichText && cmp.get('v.isRichText')) {
            var plainText;

            cmp.set('v.isRichText', isRichText);

            if (editorInstance) {
                
                plainText = editorInstance.document.getBody().getText();
                editorInstance.destroy();
            } else {
                plainText = cmp.get('v.value');
            }

            
            
            document.getElementById(this.getEditorId(cmp)).value = plainText;
            cmp.set('v.value', plainText);
        }
    },
    "getEditorId":function(cmp) {
        return cmp.getConcreteComponent().get('v.domId');
    },
    "getEditorInstance":function(cmp) {
        return typeof CKEDITOR === "undefined" ? null : CKEDITOR.instances[this.getEditorId(cmp)];
    },
    "getContent":function(cmp) {
        var editorInstance = this.getEditorInstance(cmp);
        return editorInstance ? editorInstance.getData() : this.getDomElementValue(this.getInputElement(cmp)) || '';
    },
    "setContent":function(cmp, content) {
        var editorInstance = this.getEditorInstance(cmp);
        if (editorInstance) {
            
            
            
            if (content === this.getContent(cmp).replace(/(\r\n)|\n/g,'\r\n')) {
                return;
            }
            

            if (editorInstance._settingContent) {
                if (!editorInstance._nextContent) {
                    editorInstance._nextContent = [];
                }
                editorInstance._nextContent.push(content);
            } else {
                editorInstance._settingContent = true;
                this._setData(editorInstance, content);
            }
        }
    },
    "_setData":function(editorInstance, content) {
        var helper = this;
        var options = {};
        options.callback = function() {
            if (!$A.util.isEmpty(editorInstance._nextContent)) {
                helper._setData(editorInstance,editorInstance._nextContent.shift());
            } else {
                editorInstance._settingContent = false;
            }
        };
        if ($A.util.isUndefinedOrNull(content)) {
            options.noSnapshot = true;
        }
        editorInstance.setData(content, options);
    },
    "getLocale":function() {
        return $A.get("$Locale.langLocale");
    },
    "_HTMLEntities":function(str) {
        var ret;
        var cleanerEl = document.createElement('div');
        cleanerEl.innerText = str;
        ret = cleanerEl.innerHTML;
        cleanerEl = null; 
        return ret;
    },
    "getEditorConfig":function(cmp) {
        var toolbarConfig = this.getToolbarConfig(cmp),
            locale = this.getLocale(cmp),
            width = cmp.get('v.width'),
            height = cmp.get('v.height'),
            toolbarLocation = cmp.get('v.toolbarLocation'),
            placeholder = cmp.get("v.placeholder"),
            extraAllowedContent = this.getExtraAllowedContent(),
            label = this._HTMLEntities(cmp.get('v.label'));

        var config = {
                language : locale,
                width: width,
                height: height,
                bodyClass: 'inputRichTextBody',
                toolbar : toolbarConfig,
                toolbarLocation : toolbarLocation,
                toolbarCanCollapse : false,
                resize_enabled : false,
                

                removePlugins : 'elementspath,maximize,resize,about,liststyle,tabletools,scayt,contextmenu',
                

                removeDialogTabs : 'link:advanced;image:advanced;table:advanced;tableProperties:advanced',
                enterMode : CKEDITOR.ENTER_BR, 
                shiftEnterMode : CKEDITOR.ENTER_P,

                forcePasteAsPlainText : false,
                forceSimpleAmpersand : true,
                title : label,
                customConfig: false, 
                stylesSet : false, 
                extraAllowedContent : extraAllowedContent
            };

        
        if (placeholder) {
            config.placeholder = placeholder;
            config.extraPlugins = 'confighelper';
        }

        return config;
    },
    "merge":function(target, source) {
        var property;

        if (target && source) {
            for (property in source) {
                target[property] = source[property];
            }
        }

        return target;
    },
    "getToolbarConfig":function(cmp) {
        var toolbar = cmp.get("v.toolbar");
        var toolbarConfig;
        switch (toolbar) {
        case 'basic':
            if (!this.basicToolbarConfig) {
                this.basicToolbarConfig = [
                        {name: 'basicstyles', items : ['Bold', 'Italic', 'Underline', 'Strike']},
                        {name: 'links', items : ['Link']},
                        {name: 'insert', items : ['Image']},
                        {name: 'paragraph', items : ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'Indent', 'Outdent']},
                        {name: 'list', items : ['BulletedList', 'NumberedList']}
                    ];
            }
            toolbarConfig = this.basicToolbarConfig;
            break;
        case 'standard':
            if (!this.standardToolbarConfig) {
                this.standardToolbarConfig = [
                        {name: 'basicstyles', items : ['Bold', 'Italic']},
                        {name: 'links',       items : [ 'Link','Unlink','Anchor']},
                        {name: 'insert', items : ['Image']},
                        {name: 'paragraph', items : ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'Indent', 'Outdent', 'BulletedList', 'NumberedList']},
                        {name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] }
                ];
            }
            toolbarConfig = this.standardToolbarConfig;
            break;
        case 'full' :
            if (!this.fullToolbarConfig) {
                this.fullToolbarConfig = [
                    { name: 'clipboard',   items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                    { name: 'editing',     items : [ 'Find','Replace','-','SelectAll'] },
                    { name: 'forms',       items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
                    '/',
                    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
                    { name: 'paragraph',   items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
                    { name: 'links',       items : [ 'Link','Unlink','Anchor' ] },
                    { name: 'insert',      items : [ 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak' ] },
                    '/',
                    { name: 'styles',      items : [ 'Styles','Format','Font','FontSize' ] },
                    { name: 'colors',      items : [ 'TextColor','BGColor' ] },
                    { name: 'tools',       items : [ 'Maximize', 'ShowBlocks'] }
                ];
            }
            toolbarConfig = this.fullToolbarConfig;
            break;
        case 'email':
            if (!this.emailToolbarConfig) {
                this.emailToolbarConfig = [
                        {name: 'format', items : ['Font', 'FontSize']},
                        {name: 'basicstyles', items : ['Bold','Italic','Underline']},
                        {name: 'paragraph', items : ['JustifyLeft','JustifyCenter', 'JustifyRight','BulletedList', 'NumberedList', 'Indent', 'Outdent']}
                ];
            }
            toolbarConfig = this.emailToolbarConfig;
            break;
        case 'custom':
            var config = cmp.get("v.customToolbarConfig");
            
            var customToolbarConfig = toolbar;
            if (config != null && !$A.util.isEmpty(config)) {
                if ($A.util.isString(config)) {
                    try {
                        
                        customToolbarConfig = JSON.parse(config);
                    } catch (e) { 
                        
                        
                    }
                } else if ($A.util.isArray(config)) {
                    customToolbarConfig = config;
                }
            }
            toolbarConfig = customToolbarConfig;
            break;
        default:
            toolbarConfig = toolbar;
        }
        return toolbarConfig;
    },
    "getExtraAllowedContent":function() {
        
        
        
        
        var tags = [];
        tags.push('div{*}(*); span{*}(*); p{*}(*); br{*}(*); hr{*}(*);');
        tags.push('h1{*}(*); h2{*}(*); h3{*}(*); h4{*}(*); h5{*}(*); h6{*}(*);');
        tags.push('a[!href]{*}(*);');
        tags.push('img[!src,alt,width,height,border]{*}(*);');
        tags.push('font[face,size,color];');
        tags.push('strike; s; b; em; strong; i; big; small; sub; sup; blockquote; ins; kbd; pre; tt;');
        tags.push('abbr; acronym; address; bdo; caption; cite; code; col; colgroup;');
        tags.push('dd; del; dfn; dl; dt; q; samp; var;');
        tags.push('table{*}(*)[align,border,cellpadding,cellspacing,summary];');
        tags.push('caption{*}(*); tbody{*}(*); thead{*}(*); tfoot{*}(*); th{*}(*)[scope]; tr{*}(*); td{*}(*)[scope];');
        return tags.join(' ');
    },
    "unrender":function(cmp) {
        var editorInstance = this.getEditorInstance(cmp);
        try {
            editorInstance.destroy();
        } catch (e) {
            return;
        }
    }
  },
  "renderer":{
    "afterRender":function(cmp, helper) {
		helper.initEditor(cmp, function () {
			var value = cmp.get('v.value');
			
			if(!$A.util.isEmpty(value)) {
				helper.setContent(cmp, cmp.get("v.value"));
			}
		});
		cmp.superAfterRender();
	},
    "rerender":function(cmp, helper) {
		if (cmp.getConcreteComponent()._updatingValue) {
			
			return;
		}
		var shouldRender = false;
		var attributes = cmp.getDef().getAttributeDefs();
		attributes.each(function (attributeDef) {
			var name = attributeDef.getDescriptor().getName();
			if (name !== "value" && cmp.isDirty("v." + name)) {
				shouldRender = true;
			} else if (name === "value" && cmp.isDirty("v.value")) {
				
				
				helper.setContent(cmp, cmp.get("v.value"));
			}
		});
		if (shouldRender) {
			cmp.superRerender();
		}
	},
    "unrender":function(cmp, helper) {
		helper.unrender(cmp);
		cmp.superUnrender();
	}
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputRichText",
  "st":{
    "descriptor":"css://ui.inputRichText",
    "cl":"uiInputRichText"
  },
  "su":"markup://ui:inputTextArea",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["rows","aura://Integer","G",false,2],
    ["cols","aura://Integer","G",false,20],
    ["readonly","aura://Boolean","G",false,false],
    ["placeholder","aura://String","G",false,""],
    ["resizable","aura://Boolean","G",false,true],
    ["maxlength","aura://Integer","G",false],
    ["toolbar","aura://String","I",false,"basic"],
    ["customToolbarConfig","aura://Object","I",false,null],
    ["toolbarLocation","aura://String","I",false,"top"],
    ["width","aura://String","G",false],
    ["height","aura://String","G",false,"200"],
    ["isRichText","aura://Boolean","I",false,true]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    },
    {
      "ed":"markup://ui:load",
      "n":"editorInstanceReady",
      "xs":"I"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    },
    {
      "ed":{
        "descriptor":"markup://ui:toggleRichText"
      },
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.toggle"
      }
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputSecret", (function (){/*$A.componentService.addComponentClass("markup://ui:inputSecret",function() {
return {
  "meta":{
    "name":"ui$inputSecret",
    "extends":"markup://ui:input"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputSecret",
  "st":{
    "descriptor":"css://ui.inputSecret",
    "cl":"uiInputSecret"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"txt",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputSecret",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "size":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.size"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.value"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.maxlength"
                  },
                  "type":"password",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.disabled"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputSecret",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default,input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:inputURL", (function (){/*$A.componentService.addComponentClass("markup://ui:inputURL",function() {
return {
  "meta":{
    "name":"ui$inputURL",
    "extends":"markup://ui:input"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:inputURL",
  "st":{
    "descriptor":"css://ui.inputURL",
    "cl":"uiInputURL"
  },
  "su":"markup://ui:input",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["showErrors","aura://Boolean","PP",false,true],
    ["errors","aura://Object[]","G",false,[]],
    ["errorComponent","aura://Aura.Component[]","I",false,[]],
    ["fieldHelpComponent","aura://Aura.Component[]","I",false,[]],
    ["type","aura://String","PP",false,"text"],
    ["isCompound","aura://Boolean","I",false,false],
    ["required","aura://Boolean","G",false,false],
    ["updateOn","aura://String","G",false,"change"],
    ["updateOnDisabled","aura://Boolean","I",false,false],
    ["label","aura://String","G",false],
    ["labelClass","aura://String","G",false,""],
    ["labelPosition","aura://String","PP",false,"left"],
    ["labelTitle","aura://String","I",false],
    ["useSpanLabel","aura://Boolean","I",false,false],
    ["requiredIndicatorClass","aura://String","G",false,""],
    ["disabled","aura://Boolean","G",false,false],
    ["domId","aura://String","PP",false],
    ["requiredIndicator","aura://Aura.Component[]","I",false,[
      {
        "componentDef":{
          "descriptor":"markup://aura:html"
        },
        "attributes":{
          "values":{
            "HTMLAttributes":{
              "descriptor":"HTMLAttributes",
              "value":{
                "class":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return fn.add(\"required \",cmp.get(\"v.requiredIndicatorClass\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:input",
                      "path":"v.requiredIndicatorClass"
                    }
                  ],
                  "byValue":false
                }
              }
            },
            "tag":{
              "descriptor":"tag",
              "value":"span"
            },
            "body":{
              "descriptor":"body",
              "value":[
                {
                  "componentDef":{
                    "descriptor":"markup://aura:text"
                  },
                  "attributes":{
                    "values":{
                      "value":{
                        "descriptor":"value",
                        "value":"*"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]],
    ["placeholder","aura://String","G",false,""],
    ["maxlength","aura://Integer","G",false],
    ["size","aura://Integer","G",false]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:inputTextComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:inputEvent",
      "n":"input",
      "xs":"I"
    },
    {
      "ed":"markup://ui:cut",
      "n":"cut",
      "xs":"G"
    },
    {
      "ed":"markup://ui:validationError",
      "n":"onError",
      "xs":"G"
    },
    {
      "ed":"markup://ui:clearErrors",
      "n":"onClearErrors",
      "xs":"G"
    },
    {
      "ed":"markup://ui:change",
      "n":"change",
      "xs":"G"
    },
    {
      "ed":"markup://ui:copy",
      "n":"copy",
      "xs":"G"
    },
    {
      "ed":"markup://ui:paste",
      "n":"paste",
      "xs":"G"
    },
    {
      "ed":"markup://ui:updateError",
      "n":"updateError",
      "xs":"I"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"txt",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(cmp.get(\"v.class\"),\" input\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:inputURL",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "size":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.size"
                  },
                  "value":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.value"
                  },
                  "maxlength":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.maxlength"
                  },
                  "type":"url",
                  "aria-describedby":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.ariaDescribedBy"
                  },
                  "disabled":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.disabled"
                  },
                  "placeholder":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.placeholder"
                  },
                  "required":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.required"
                  },
                  "id":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:inputURL",
                    "path":"v.domId"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"input"
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default, input",
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:menuTrigger", (function (){/*$A.componentService.addComponentClass("markup://ui:menuTrigger",function() {
return {
  "meta":{
    "name":"ui$menuTrigger",
    "extends":"markup://ui:popupTrigger"
  },
  "controller":{
    "onClick":function(component, event, helper) {
        if (component._recentlyClicked) {
            return false;
        }

        if (event && $A.util.getBooleanValue(component.get("v.stopClickPropagation"))) {
            $A.util.squash(event);
        }

        var concreteCmp = component.getConcreteComponent();
        var concreteHelper = concreteCmp.helper;
        concreteHelper.handleTriggerPress(concreteCmp);
        helper.fireMenuTriggerPress(component);

        if ($A.util.getBooleanValue(component.get("v.disableDoubleClicks"))) {
            component._recentlyClicked = true;
            window.setTimeout($A.getCallback(function() { component._recentlyClicked = false; }), 350);
        }
    },
    "focus":function(component) {
        var concreteCmp = component.getConcreteComponent();
        
        var concreteHelper = concreteCmp.helper;
        if (concreteHelper.focus) {
        	concreteHelper.focus(concreteCmp);
        }
    }
  },
  "helper":{
    "handleClick":function(component) {
        var concreteCmp = component.getConcreteComponent();
        this.handleTriggerPress(concreteCmp);
        this.fireMenuTriggerPress(concreteCmp);
    },
    "fireMenuTriggerPress":function(component, index) {
        if ($A.util.isUndefinedOrNull(index)) {
            index = 0;
        }
        var pressEvent = component.get("e.menuTriggerPress");
        pressEvent.fire();
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.addTriggerDomEvents(component);
        return component.superAfterRender();
    },
    "rerender":function(component, helper) {
        helper.addTriggerDomEvents(component);
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:menuTrigger",
  "su":"markup://ui:popupTrigger",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["disableDoubleClicks","aura://Boolean","I",false,false],
    ["disabled","aura://Boolean","G",false,false],
    ["label","aura://String","G",false],
    ["title","aura://String","G",false,""],
    ["trigger","aura://Aura.Component[]","I",false,[]],
    ["stopClickPropagation","aura://Boolean","I",false,false]
  ],
  "med":[
    {
      "name":"ui:triggerInteraction",
      "xs":"I"
    }
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:select",
      "n":"select",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keypress",
      "n":"keypress",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keyup",
      "n":"keyup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:popupKeyboardEvent",
      "n":"popupKeyboardEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetShow",
      "n":"popupTargetShow",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTargetHide",
      "n":"popupTargetHide",
      "xs":"I"
    },
    {
      "ed":"markup://ui:popupTriggerPress",
      "n":"popupTriggerPress",
      "xs":"I"
    },
    {
      "ed":"markup://ui:menuTriggerPress",
      "n":"menuTriggerPress",
      "xs":"G"
    }
  ],
  "ld":{
    "menuTrigger":{
      "description":"Menu Trigger",
      "alias":"menu-trigger"
    }
  },
  "fa":[
    {
      "descriptor":"trigger",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"menuTrigger",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "onclick":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:menuTrigger",
                    "path":"c.onClick"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:menuTrigger",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:message", (function (){/*$A.componentService.addComponentClass("markup://ui:message",function() {
return {
  "meta":{
    "name":"ui$message",
    "extends":"markup://aura:component"
  },
  "controller":{
    "press":function(cmp) {
        var theMessage = cmp.getElement();
        $A.util.addClass(theMessage,"hide");
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:message",
  "st":{
    "descriptor":"css://ui.message",
    "cl":"uiMessage"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["title","aura://String","G",false],
    ["severity","aura://String","G",false,"message"],
    ["closable","aura://Boolean","G",false,false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.severity\"),\" \"),cmp.get(\"v.class\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:message",
                        "path":"v.severity"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:message",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "role":"alert"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:block"
                    },
                    "attributes":{
                      "values":{
                        "left":{
                          "descriptor":"left",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:image"
                              },
                              "localId":"messageIcon",
                              "attributes":{
                                "values":{
                                  "class":{
                                    "descriptor":"class",
                                    "value":"icon"
                                  },
                                  "alt":{
                                    "descriptor":"alt",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:message",
                                      "path":"v.severity"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "right":{
                          "descriptor":"right",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:renderIf"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:message",
                                      "path":"v.closable"
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "localId":"closeMessageLink",
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"close",
                                                "onclick":{
                                                  "exprType":"PROPERTY",
                                                  "byValue":false,
                                                  "target":"ui:message",
                                                  "path":"c.press"
                                                }
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"a"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:text"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":"×"
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:renderIf"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"FUNCTION",
                                      "code":"function(cmp, fn) { return (cmp.get(\"v.title\")&&fn.ne(cmp.get(\"v.title\"),\"\")); }",
                                      "args":[
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:message",
                                          "path":"v.title"
                                        }
                                      ],
                                      "byValue":false
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "localId":"h4Title",
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{

                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"h4"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:message",
                                                          "path":"v.title"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            },
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:renderIf"
                              },
                              "attributes":{
                                "values":{
                                  "isTrue":{
                                    "descriptor":"isTrue",
                                    "value":{
                                      "exprType":"FUNCTION",
                                      "code":"function(cmp, fn) { return (cmp.get(\"v.body.length\")>0); }",
                                      "args":[
                                        {
                                          "exprType":"PROPERTY",
                                          "byValue":false,
                                          "target":"ui:message",
                                          "path":"v.body.length"
                                        }
                                      ],
                                      "byValue":false
                                    }
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:expression"
                                        },
                                        "attributes":{
                                          "values":{
                                            "value":{
                                              "descriptor":"value",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:message",
                                                "path":"v.body"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputCheckbox", (function (){/*$A.componentService.addComponentClass("markup://ui:outputCheckbox",function() {
return {
  "meta":{
    "name":"ui$outputCheckbox",
    "extends":"markup://aura:component"
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputCheckbox",
  "st":{
    "descriptor":"css://ui.outputCheckbox",
    "cl":"uiOutputCheckbox"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Boolean","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["altChecked","aura://String","G",false,"True"],
    ["altUnchecked","aura://String","G",false,"False"]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://ui:image"
          },
          "localId":"img1",
          "attributes":{
            "values":{
              "class":{
                "descriptor":"class",
                "value":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return (fn.eq(cmp.get(\"v.value\"),true)?fn.add(cmp.get(\"v.class\"),\" checked\"):fn.add(cmp.get(\"v.class\"),\" unchecked\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:outputCheckbox",
                      "path":"v.value"
                    },
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:outputCheckbox",
                      "path":"v.class"
                    }
                  ],
                  "byValue":false
                }
              },
              "alt":{
                "descriptor":"alt",
                "value":{
                  "exprType":"FUNCTION",
                  "code":"function(cmp, fn) { return (fn.eq(cmp.get(\"v.value\"),true)?cmp.get(\"v.altChecked\"):cmp.get(\"v.altUnchecked\")); }",
                  "args":[
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:outputCheckbox",
                      "path":"v.altUnchecked"
                    },
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:outputCheckbox",
                      "path":"v.altChecked"
                    },
                    {
                      "exprType":"PROPERTY",
                      "byValue":false,
                      "target":"ui:outputCheckbox",
                      "path":"v.value"
                    }
                  ],
                  "byValue":false
                }
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputCurrency", (function (){/*$A.componentService.addComponentClass("markup://ui:outputCurrency",function() {
return {
  "meta":{
    "name":"ui$outputCurrency",
    "extends":"markup://aura:component"
  },
  "renderer":{
    "render":function(cmp) {
        var span = cmp.superRender()[0];
        var f = cmp.get("v.format");
        var num = cmp.get("v.value");
        var currencyCode = cmp.get("v.currencyCode");
        var currencySymbol = cmp.get("v.currencySymbol") || currencyCode;
        var formatted;
        if (($A.util.isNumber(num) || $A.util.isString(num)) && !$A.util.isEmpty(num) && !isNaN(num)) {
            var hasFormat = !$A.util.isEmpty(f);
            if (hasFormat || currencySymbol) {
                var nf;
                try {
                    var symbols;
                    if (currencySymbol) {
                        symbols = {
                            currencyCode: currencyCode,
                            currency: currencySymbol,
                            decimalSeparator: $A.get("$Locale.decimal"),
                            groupingSeparator: $A.get("$Locale.grouping"),
                            zeroDigit: $A.get("$Locale.zero")
                        };
                    }
                    if (!hasFormat) {
                        f = $A.get("$Locale.currencyFormat");
                    }
                    nf = $A.localizationService.getNumberFormat(f, symbols);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(num);
                }
            } else {
                formatted = $A.localizationService.formatCurrency(num);
            }
            span.textContent = span.innerText = formatted;
        }
        return span;
    },
    "rerender":function(cmp) {
        if (cmp.isDirty("v.value") || cmp.isDirty("v.format") || cmp.isDirty("v.currencyCode") || cmp.isDirty("v.currencySymbol")) {
        	var formatted = '';
            var f = cmp.get("v.format");
            var val = cmp.get("v.value");
            var currencyCode = cmp.get("v.currencyCode");
            var currencySymbol = cmp.get("v.currencySymbol") || currencyCode;
            if (($A.util.isNumber(val) || $A.util.isString(val)) && !$A.util.isEmpty(val) && !isNaN(val)) {
                var hasFormat = !$A.util.isEmpty(f);
                if (hasFormat || currencySymbol) {
                    var nf;
                    try {
                        var symbols;
                        if (currencySymbol) {
                            symbols = {
                                currencyCode: currencyCode,
                                currency: currencySymbol,
                                decimalSeparator: $A.get("$Locale.decimal"),
                                groupingSeparator: $A.get("$Locale.grouping"),
                                zeroDigit: $A.get("$Locale.zero")
                            };
                        }
                        if (!hasFormat) {
                            f = $A.get("$Locale.currencyFormat");
                        }
                        nf = $A.localizationService.getNumberFormat(f, symbols);
                    } catch (e) {
                        formatted = "Invalid format attribute";
                        $A.log(e);
                    }
                    if (nf) {
                        formatted = nf.format(val);
                    }
                } else {
                    formatted = $A.localizationService.formatCurrency(val);
                }
            }
            var span = cmp.find("span");
            span.getElement().textContent = span.getElement().innerText = formatted;
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputCurrency",
  "st":{
    "descriptor":"css://ui.outputCurrency",
    "cl":"uiOutputCurrency"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Decimal","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["format","aura://String","G",false],
    ["currencyCode","aura://String","G",false],
    ["currencySymbol","aura://String","G",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputCurrency",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputDate", (function (){/*$A.componentService.addComponentClass("markup://ui:outputDate",function() {
return {
  "meta":{
    "name":"ui$outputDate",
    "extends":"markup://aura:component",
    "imports":{
      "dateTimeLib":"markup://ui:dateTimeLib"
    }
  },
  "helper":{
    "formatDate":function(component) {

        
        var config = {
            
            langLocale : component.get("v.langLocale"),
            format : component.get("v.format") || $A.get("$Locale.dateFormat"),
            timezone : component.get("v.timezone"),
            validateString : true
        };

        var helper = this;
        var displayValue = function (returnValue) {
            helper.setOutputValue(component, returnValue.date);
        };

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },
    "setOutputValue":function(component, displayValue) {
        
        if (!component.isValid()) {
            return;
        }
        var outputElement = component.find("span").getElement();
        if (!$A.util.isUndefinedOrNull(outputElement)) {
            var textContent = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : "";
            outputElement.textContent = textContent;

            
            outputElement.innerText = textContent;
        }
    }
  },
  "renderer":{
    "afterRender":function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.formatDate(concreteCmp);
        return component.superAfterRender();
    },
    "rerender":function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.formatDate(concreteCmp);
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputDate",
  "st":{
    "descriptor":"css://ui.outputDate",
    "cl":"uiOutputDate"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["format","aura://String","G",false],
    ["langLocale","aura://String","G",false],
    ["timezone","aura://String","I",false,{
      "exprType":"PROPERTY",
      "byValue":false,
      "target":"ui:outputDate",
      "path":"$Locale.timezone"
    }]
  ],
  "i":[
    "markup://ui:visible",
    "markup://ui:outputDateComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputDate",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputDateTime", (function (){/*$A.componentService.addComponentClass("markup://ui:outputDateTime",function() {
return {
  "meta":{
    "name":"ui$outputDateTime",
    "extends":"markup://aura:component"
  },
  "helper":{
    "displayDateTime":function(component, displayValue) {
        
        if (!component.isValid()) {
            return;
        }
        var outputCmp = component.find("span");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.textContent = elem.innerText = $A.localizationService.translateToLocalizedDigits(displayValue);
        }
    },
    "getFormat":function(component) {
        return component.get("v.format");
    },
    "getTimeZone":function(component) {
        return component.get("v.timezone");
    },
    "formatDateTime":function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        var value = component.get("v.value");
        if (!value) { 
            _helper.displayDateTime(concreteCmp, "");
            return;
        }

        var format = _helper.getFormat(concreteCmp);
        
        var langLocale = concreteCmp.get("v.langLocale");

        var d = $A.localizationService.parseDateTimeISO8601(value);
        if (!this.isValidDate(d)) {
            _helper.displayDateTime(concreteCmp, "Invalid date time value");
            return;
        }

        var timezone = _helper.getTimeZone(concreteCmp);
        $A.localizationService.UTCToWallTime(d, timezone, function(walltime) {
            try {
                walltime = $A.localizationService.translateToOtherCalendar(walltime);
                var displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
                _helper.displayDateTime(concreteCmp, displayValue);
            } catch (e) {
                _helper.displayDateTime(concreteCmp, e.message);
            }
        });
    },
    "isValidDate":function(date) {
        return (date instanceof Date) && !isNaN(date.getTime());
    }
  },
  "renderer":{
    "afterRender":function(component) {
        var ret = component.superAfterRender();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.formatDateTime(concreteCmp);
        return ret; 
    },
    "rerender":function(component) {
        var ret = component.superRerender();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.formatDateTime(concreteCmp);
        return ret;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputDateTime",
  "st":{
    "descriptor":"css://ui.outputDateTime",
    "cl":"uiOutputDateTime"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["format","aura://String","G",false],
    ["langLocale","aura://String","G",false],
    ["timezone","aura://String","G",false,{
      "exprType":"PROPERTY",
      "byValue":false,
      "target":"ui:outputDateTime",
      "path":"$Locale.timezone"
    }]
  ],
  "i":[
    "markup://ui:visible",
    "markup://ui:outputDateComponent"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputDateTime",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputEmail", (function (){/*$A.componentService.addComponentClass("markup://ui:outputEmail",function() {
return {
  "meta":{
    "name":"ui$outputEmail",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib"
    }
  },
  "helper":{
    "buildBody":function(cmp) {
        var body = cmp.find("body");

        if (body) {
            var bodyElement = body.getElement();
            $A.util.clearNode(bodyElement);

            var actionable = $A.util.getBooleanValue(cmp.get("v.actionable"));
            var value = $A.util.trim(cmp.get("v.value") || '');

            if (!$A.util.isEmpty(value)) {
                var label = $A.util.trim(cmp.get("v.label") || '');

                var node;
                if (actionable) {
                    node = $A.util.createHtmlElement("a", {"href": "mailto:" + value});
                    var text = label === "" ? value : label;

                    node.appendChild(document.createTextNode(text));
                } else {
                    node = document.createTextNode(value);
                }
                bodyElement.appendChild(node);
            }

        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.buildBody(cmp);

        return ret;
    },
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomEvents(component);
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        if (cmp.isDirty("v.value") || cmp.isDirty("v.label")) {
            helper.buildBody(cmp);
        }
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputEmail",
  "st":{
    "descriptor":"css://ui.outputEmail",
    "cl":"uiOutputEmail"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["label","aura://String","I",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"body",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputEmail",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputNumber", (function (){/*$A.componentService.addComponentClass("markup://ui:outputNumber",function() {
return {
  "meta":{
    "name":"ui$outputNumber",
    "extends":"markup://aura:component"
  },
  "renderer":{
    "render":function(cmp) {
        var span = cmp.superRender()[0];
        var f = cmp.get("v.format");
        var num = cmp.get("v.value");
        var formatted;
        if (($A.util.isNumber(num) || $A.util.isString(num)) && !$A.util.isEmpty(num)) {    		
            if (!$A.util.isEmpty(f)) {
                var nf;
                try {
                    nf = $A.localizationService.getNumberFormat(f);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(num);
                }
            } else {
                formatted = $A.localizationService.formatNumber(num);
            }
            span.textContent = span.innerText = formatted;
        }
        return span;
    },
    "rerender":function(cmp) {
        var val = cmp.get("v.value");
        var f = cmp.get("v.format");
        var formatted = '';
        if (($A.util.isNumber(val) || $A.util.isString(val)) && !$A.util.isEmpty(val)) {
            if (!$A.util.isEmpty(f)) {
                var nf;
                try {
                    nf = $A.localizationService.getNumberFormat(f);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(val);
                }
            } else {
                formatted = $A.localizationService.formatNumber(val);
            }
        }
        var span = cmp.find("span");
        span.getElement().textContent = span.getElement().innerText = formatted;
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputNumber",
  "st":{
    "descriptor":"css://ui.outputNumber",
    "cl":"uiOutputNumber"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Decimal","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["format","aura://String","G",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputNumber",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputPhone", (function (){/*$A.componentService.addComponentClass("markup://ui:outputPhone",function() {
return {
  "meta":{
    "name":"ui$outputPhone",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib"
    }
  },
  "helper":{
    "updateValue":function(cmp) {
        var bodyElement = cmp.find("body").getElement();

        $A.util.clearNode(bodyElement);

        var value = cmp.get("v.value") || "";

        var isCallable = $A.get("$Browser.formFactor") === 'PHONE' &&
            !$A.util.isEmpty(value) && !value.match(/[a-zA-Z]/g) && value.indexOf("*") === -1 && value.indexOf("#") === -1;

        var phoneNumberNode = bodyElement;

        if (isCallable) {
            phoneNumberNode = $A.util.createHtmlElement("a", {
                "class": cmp.get("v.class"),
                "href": "tel:" + this.removeSpaces(value)
            });
            bodyElement.appendChild(phoneNumberNode);
        }
        if (!$A.util.isEmpty(value)) {
            phoneNumberNode.appendChild(document.createTextNode(this.formatPhoneNumber(value)));
        }
    },
    "removeSpaces":function(value) {
        return (value || "").replace(/\s/g, "");
    },
    "formatPhoneNumber":function(rawPhoneNumber) {
        if (!rawPhoneNumber) {
            return null;
        }
        var userLocale = $A.get("$Locale.userLocaleCountry");
        if (userLocale !== "US" && userLocale !== "CA") {
            return rawPhoneNumber;
        }

        if (rawPhoneNumber.length === 0 || rawPhoneNumber[0] === '+') {
            
            return rawPhoneNumber;
        }

        var formattedPhoneNumber = "";
        var count = 0;
        var extensionStart = -1;

        var startIndex = 0;
        
        if (rawPhoneNumber[0] === '1') {
            startIndex = 1;
        }
        for (var i = startIndex; i < rawPhoneNumber.length; i++) {
            var character = rawPhoneNumber[i];

            
            if (character >= '0' && character <= '9') {
                switch (count) {
                    case 0:
                        formattedPhoneNumber += "(";
                        break;
                    case 3:
                        formattedPhoneNumber += ") ";
                        break;
                    case 6:
                        formattedPhoneNumber += "-";
                        break;
                }
                formattedPhoneNumber += character;
                count++;
                if (count > 10) {
                    break;
                }
            }

            
            if (isNaN(character)) {
                extensionStart = i;
                break;
            }
        }

        
        if (extensionStart >= 0) {
            formattedPhoneNumber += " " + rawPhoneNumber.substring(extensionStart);
        }

        
        
        if (count !== 10 || formattedPhoneNumber.length > 40) {
            
            return rawPhoneNumber;
        } else {
            return formattedPhoneNumber;
        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var ret = cmp.superRender();

        helper.updateValue(cmp);

        return ret;
    },
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomEvents(component);
    },
    "rerender":function(cmp, helper) {
        cmp.superRerender();

        if (cmp.isDirty("v.value")) {
            helper.updateValue(cmp);
        }
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputPhone",
  "st":{
    "descriptor":"css://ui.outputPhone",
    "cl":"uiOutputPhone"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"body",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputPhone",
                    "path":"v.class"
                  },
                  "dir":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputPhone",
                    "path":"v.dir"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputRichText", (function (){/*$A.componentService.addComponentClass("markup://ui:outputRichText",function() {
return {
  "meta":{
    "name":"ui$outputRichText",
    "extends":"markup://aura:component",
    "imports":{
      "urlLib":"markup://ui:urlLib"
    }
  },
  "helper":{
    "SUPPORTED_HTML_TAGS":[
      "a",
      "b",
      "br",
      "big",
      "blockquote",
      "caption",
      "cite",
      "code",
      "col",
      "colgroup",
      "del",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "hr",
      "i",
      "img",
      "ins",
      "kbd",
      "li",
      "ol",
      "p",
      "param",
      "pre",
      "q",
      "s",
      "samp",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr",
      "tt",
      "u",
      "ul",
      "var",
      "strike"
    ],
    "SUPPORTED_ATTRS":[
      "accept",
      "action",
      "align",
      "alt",
      "autocomplete",
      "background",
      "bgcolor",
      "border",
      "cellpadding",
      "cellspacing",
      "checked",
      "cite",
      "class",
      "clear",
      "color",
      "cols",
      "colspan",
      "coords",
      "datetime",
      "default",
      "dir",
      "disabled",
      "download",
      "enctype",
      "face",
      "for",
      "headers",
      "height",
      "hidden",
      "high",
      "href",
      "hreflang",
      "id",
      "ismap",
      "label",
      "lang",
      "list",
      "loop",
      "low",
      "max",
      "maxlength",
      "media",
      "method",
      "min",
      "multiple",
      "name",
      "noshade",
      "novalidate",
      "nowrap",
      "open",
      "optimum",
      "pattern",
      "placeholder",
      "poster",
      "preload",
      "pubdate",
      "radiogroup",
      "readonly",
      "rel",
      "required",
      "rev",
      "reversed",
      "rows",
      "rowspan",
      "spellcheck",
      "scope",
      "selected",
      "shape",
      "size",
      "span",
      "srclang",
      "start",
      "src",
      "step",
      "style",
      "summary",
      "tabindex",
      "target",
      "title",
      "type",
      "usemap",
      "valign",
      "value",
      "width",
      "xmlns"
    ],
    "removeEventHandlers":function(element) {
        var attributes = element.attributes || [];
        for (var i = 0; i < attributes.length; i++) {
            if ($A.util.isIE && !attributes[i].specified) {
                continue;
            }
            if (attributes[i].nodeName.substring(0, 2) === "on") { 
                attributes[i].nodeValue = null;
            }
        }
    },
    "sanitize":function(component, value) {
        if ($A.util.isEmpty(value)) {
            component.set("v.displayValue", '');
            return;
        }

        var supportedTags = this.getSupportedTags(component);
        var supportedAttrs = this.getSupportedAttributes(component);

        try {
            var cfg = {
                ALLOWED_TAGS: supportedTags,
                ALLOWED_ATTR: supportedAttrs,
                ALLOW_UNKNOWN_PROTOCOLS: true
            };
            var sanitizedValue = $A.util.sanitizeDOM(value, cfg);
            if (sanitizedValue !== component.get("v.displayValue")) {
                component.set("v.displayValue", sanitizedValue);
            }
        } catch (e) {
            $A.warning("Exception caught while attempting to sanitize " + component.getGlobalId() + "; " + e);
            component.set("v.displayValue", $A.util.sanitizeHtml(value));
        }
    },
    "validateElement":function(element, supportedTags) {
        if (element.nodeType === 3) { 
            return;
        }
        if (element.tagName && supportedTags.indexOf(element.tagName.toLowerCase()) < 0) {
            
            $A.util.removeElement(element);
            return;
        }
        this.removeEventHandlers(element);
        var nodes = element.childNodes;

        if (nodes) {
        	var len = nodes.length;
            for (var i = 0; i < len; i++) {
                this.validateElement(nodes[i], supportedTags);
                if (len > nodes.length) { 
                    len = nodes.length;
                    i--;
                }
            }
        }
    },
    "getSupportedTags":function(component) {
    	var supportedTags = component.get("v.supportedTags");

    	return supportedTags ? supportedTags.replace(/ /g,'').toLowerCase().split(",")
                : this.getDefaultSupportedTags(component);
    },
    "getSupportedAttributes":function(component) {
    	var supportedAttrs = component.get("v.supportedAttrs");

    	return supportedAttrs ? supportedAttrs.replace(/ /g,'').toLowerCase().split(",")
    						  : this.getDefaultSupportedAttributes(component);
    },
    "getDefaultSupportedTags":function() {
        return this.SUPPORTED_HTML_TAGS;
    },
    "getDefaultSupportedAttributes":function() {
        return this.SUPPORTED_ATTRS;
    },
    "escapeAndLinkifyText":function(component) {
        var value = component.get("v.value");

        if (component.get("v.linkify")) {
            value = this.urlLib.linkify.linkifyText(value);
        }

        this.sanitize(component, value);
    }
  },
  "renderer":{
    "render":function(component) {
        if (component) {
            var concreteHelper = component.getConcreteComponent().getDef().getHelper();
            concreteHelper.escapeAndLinkifyText(component, concreteHelper);
        }
        return component.superRender();
    },
    "rerender":function(component) {
        if (component &&
            (component.isDirty("v.value") || component.isDirty("v.dir"))) {
            var concreteHelper = component.getConcreteComponent().getDef().getHelper();
            concreteHelper.escapeAndLinkifyText(component, concreteHelper);
        }
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputRichText",
  "st":{
    "descriptor":"css://ui.outputRichText",
    "cl":"uiOutputRichText"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",false],
    ["visible","aura://Boolean","I",false,true],
    ["linkify","aura://Boolean","G",false,true],
    ["displayValue","aura://String","p",false],
    ["supportedTags","aura://String","I",false],
    ["supportedAttrs","aura://String","I",false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"div",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputRichText",
                    "path":"v.class"
                  },
                  "dir":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputRichText",
                    "path":"v.dir"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:unescapedHtml"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:outputRichText",
                            "path":"v.displayValue"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputTextArea", (function (){/*$A.componentService.addComponentClass("markup://ui:outputTextArea",function() {
return {
  "meta":{
    "name":"ui$outputTextArea",
    "extends":"markup://aura:component",
    "imports":{
      "urlLib":"markup://ui:urlLib"
    }
  },
  "helper":{
    "linkifyText":function(component) {
        var value = component.get("v.value");

        if (component.get("v.linkify")) {
            value = this.urlLib.linkify.escapeAndLinkifyText(value);
        }

        component.set("v.displayValue", value);
    }
  },
  "renderer":{
    "render":function(component, helper) {
        helper.linkifyText(component);
        return component.superRender();
    },
    "rerender":function(component, helper) {
        if (component.isDirty("v.value")) {
            helper.linkifyText(component);
        }
        return component.superRerender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputTextArea",
  "st":{
    "descriptor":"css://ui.outputTextArea",
    "cl":"uiOutputTextArea"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["displayValue","aura://String","p",false],
    ["linkify","aura://Boolean","G",false,true]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"span",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputTextArea",
                    "path":"v.class"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"span"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:outputTextArea",
                            "path":"v.linkify"
                          }
                        },
                        "else":{
                          "descriptor":"else",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:outputTextArea",
                                      "path":"v.displayValue"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:unescapedHtml"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:outputTextArea",
                                      "path":"v.displayValue"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:outputURL", (function (){/*$A.componentService.addComponentClass("markup://ui:outputURL",function() {
return {
  "meta":{
    "name":"ui$outputURL",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib",
      "urlLib":"markup://ui:urlLib"
    }
  },
  "controller":{
    "click":function(cmp, event) {
        if ($A.util.getBooleanValue(cmp.get("v.stopPropagation"))) {
            
            if (event.stopPropagation) {
              event.stopPropagation();
            }
            
            else {
              event.cancelBubble = true;
            }
        }

        if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
            event.preventDefault();
            return false;
        }

        var clickEvent = cmp.getEvent("click");
        clickEvent.setParams({ "domEvent" : event });
        clickEvent.fire();

        var navigateToUrl = !$A.util.getBooleanValue(cmp.get("v.stopNavigation"));
        if (!navigateToUrl) {
            event.preventDefault();
        }

        return navigateToUrl;
    }
  },
  "helper":{
    "buildLinkBody":function(cmp) {
        var link = cmp.find("link");

        if (link) {
            var linkElement = link.getElement();

            $A.util.clearNode(linkElement);

            var iconClass = cmp.get("v.iconClass");
            var label = cmp.get("v.label") || '';

            if (!$A.util.isEmpty(iconClass)) {
                var alt = cmp.get("v.alt");
                if (!$A.util.isEmpty(label)) {
                    alt = '';
                } else if ($A.util.isEmpty(alt)) {
                    $A.warning('component: ' + (cmp.getLocalId() || cmp.getGlobalId() || '') + ' "alt" attribute should not be empty');
                }

                var imageNode = $A.util.createHtmlElement("img", {
                    "src": "/auraFW/resources/aura/s.gif",
                    "class": iconClass,
                    "alt": alt
                });

                linkElement.appendChild(imageNode);
            }

            linkElement.appendChild(document.createTextNode(label));
        }
    },
    "handleDisabled":function(cmp) {
        var link = cmp.find("link");
        if (link) {
            var element = link.getElement();
            if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
                $A.util.addClass(element, "disabled");
            } else {
                $A.util.removeClass(element, "disabled");
            }

        }
    }
  },
  "renderer":{
    "render":function(cmp, helper) {
        var url = cmp.get("v.value");
        if ($A.util.getBooleanValue(cmp.get("v.fixURL"))) {
            url = helper.urlLib.urlUtil.makeAbsolute(url);
        }

        cmp.set("v.absoluteURL", url);

        var ret = cmp.superRender();

        helper.buildLinkBody(cmp);

        helper.handleDisabled(cmp);

        return ret;
    },
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomHandler(component, "mouseover");
        helper.lib.interactive.addDomHandler(component, "mouseout");
    },
    "rerender":function(cmp, helper) {
        var url = cmp.get("v.value");
        if (cmp.isDirty("v.value") && $A.util.getBooleanValue(cmp.get("v.fixURL"))) {
            url = helper.urlLib.urlUtil.makeAbsolute(url);
        }

        cmp.set("v.absoluteURL", url);

        cmp.superRerender();

        if (cmp.isDirty("v.label") || cmp.isDirty("v.iconClass") || cmp.isDirty("v.alt")) {
            helper.buildLinkBody(cmp);
        }

        if (cmp.isDirty("v.disabled")) {
            helper.handleDisabled(cmp);
        }
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:outputURL",
  "st":{
    "descriptor":"css://ui.outputURL",
    "cl":"uiOutputURL"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://String","G",true],
    ["visible","aura://Boolean","I",false,true],
    ["iconClass","aura://String","G",false],
    ["title","aura://String","G",false,""],
    ["target","aura://String","G",false],
    ["alt","aura://String","G",false],
    ["label","aura://String","G",false],
    ["disabled","aura://Boolean","G",false,false],
    ["absoluteURL","aura://String","p",false],
    ["stopPropagation","aura://Boolean","I",false,false],
    ["fixURL","aura://Boolean","I",false,false],
    ["stopNavigation","aura://Boolean","I",false,false]
  ],
  "i":[
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    }
  ],
  "ld":{
    "link":{
      "description":"Url link",
      "isPrimitive":true
    }
  },
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"link",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"v.class"
                  },
                  "href":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"v.absoluteURL"
                  },
                  "dir":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"v.dir"
                  },
                  "target":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"v.target"
                  },
                  "onclick":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"c.click"
                  },
                  "title":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:outputURL",
                    "path":"v.title"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"a"
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:pill", (function (){/*$A.componentService.addComponentClass("markup://ui:pill",function() {
return {
  "meta":{
    "name":"ui$pill",
    "extends":"markup://aura:component",
    "imports":{
      "lib":"markup://ui:eventLib"
    }
  },
  "controller":{
    "deleteItem":function(component, event, helper) {
        helper.fireHandleEvent(component, 'delete');
    },
    "getHandledDOMEvents":function() {
        return ["click", "keydown", "mouseover"];
    },
    "handleInteraction":function(component, event, helper) {
        helper.handledInteraction(component, event);
    },
    "onBlur":function(component, event, helper) {
        helper.removeFocus(component);
    },
    "onMouseEnter":function(component) {
        
        var label = component.get("v.label");
        if (label) {
            var innerLabel = component.find("label");
            if (innerLabel) {
                var innerLabelElement = innerLabel.getElement();
                if (innerLabelElement && innerLabelElement.offsetWidth < innerLabelElement.scrollWidth) {
                    component.getElement().setAttribute("title", label);
                } else {
                    component.getElement().removeAttribute("title");
                }
            }
        }
    },
    "onFocus":function() {
    },
    "focus":function(component, event, helper) {
        helper.setFocus(component);
    },
    "onIconError":function(component) {
        $A.util.addClass(component.find("icon").getElement(), 'invisible');
    }
  },
  "helper":{
    "handledInteraction":function(component, event) {
        var params = event.getParams();
        var domEvent = params.domEvent;
        var action;
        if (params.keyCode === 37) {  
            action = 'focusPrevItem';
        } else if (params.keyCode === 39) { 
            action = 'focusNextItem';
        } else if (params.keyCode === 46) { 
            action = 'delete';
        } else if (params.keyCode === 8) { 
            action = 'delete';
        }
        if (action) {
            if (domEvent) {
                domEvent.preventDefault();
            }
            this.fireHandleEvent(component, action);
        }
    },
    "fireHandleEvent":function(component, action) {
        var ev = component.getEvent("onHandledEvent");

        var params = {
            id: component.get('v.id'),
            label: component.get('v.label'),
            action: action
        };
        ev.setParams({ value : params }).fire();
    },
    "setFocus":function(component) {
        var linkCmp = component.find('link');
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem) {
            elem.focus();
            $A.util.addClass(elem, "focused");
        }
    },
    "removeFocus":function(component) {
        var linkCmp = component.find('link');
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem) {
            $A.util.removeClass(elem, "focused");
        }
    }
  },
  "renderer":{
    "afterRender":function(component, helper) {
        helper.lib.interactive.addDomEvents(component);

        return component.superAfterRender();
    },
    "unrender":function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://ui:pill",
  "st":{
    "descriptor":"css://ui.pill",
    "cl":"uiPill"
  },
  "fst":{
    "descriptor":"css://ui.pill"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["class","aura://String","G",false],
    ["dir","aura://String","I",false,"ltr"],
    ["namespaceOverride","aura://String","I",false],
    ["actionable","aura://Boolean","I",false,true],
    ["role","aura://String","I",false],
    ["ariaDescribedBy","aura://String","PP",false,""],
    ["value","aura://Object","PP",false,null],
    ["visible","aura://Boolean","I",false,true],
    ["label","aura://String","I",false],
    ["id","aura://String","I",false],
    ["showDelete","aura://Boolean","I",false,true],
    ["iconUrl","aura://String","I",false],
    ["iconBackgroundColor","aura://String","I",false],
    ["iconAlt","aura://String","I",false],
    ["accessibleDeleteLabel","aura://String","I",false,"Press Delete to Remove"],
    ["maxCharacters","aura://Integer","I",false,30],
    ["active","aura://Boolean","I",false,true]
  ],
  "med":[
    {
      "name":"ui:focus",
      "xs":"I"
    }
  ],
  "i":[
    "markup://ui:focusable",
    "markup://ui:visible"
  ],
  "re":[
    {
      "ed":"markup://ui:focus",
      "n":"focus",
      "xs":"G"
    },
    {
      "ed":"markup://ui:blur",
      "n":"blur",
      "xs":"G"
    },
    {
      "ed":"markup://ui:dblclick",
      "n":"dblclick",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseover",
      "n":"mouseover",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseout",
      "n":"mouseout",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mouseup",
      "n":"mouseup",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousemove",
      "n":"mousemove",
      "xs":"G"
    },
    {
      "ed":"markup://ui:click",
      "n":"click",
      "xs":"G"
    },
    {
      "ed":"markup://ui:mousedown",
      "n":"mousedown",
      "xs":"G"
    },
    {
      "ed":"markup://ui:response",
      "n":"onHandledEvent",
      "xs":"I"
    },
    {
      "ed":"markup://ui:keydown",
      "n":"keydown",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.handleInteraction"
      },
      "n":"keydown"
    },
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.onBlur"
      },
      "n":"blur"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"link",
          "flavorable":true,
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return (cmp.get(\"v.active\")?\"pill focused\":\"pill\"); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:pill",
                        "path":"v.active"
                      }
                    ],
                    "byValue":false
                  },
                  "tabindex":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return (cmp.get(\"v.active\")?0: -(1)); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:pill",
                        "path":"v.active"
                      }
                    ],
                    "byValue":false
                  },
                  "onmouseenter":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:pill",
                    "path":"c.onMouseEnter"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"a"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"FUNCTION",
                            "code":"function(cmp, fn) { return !(fn.empty(cmp.get(\"v.iconUrl\"))); }",
                            "args":[
                              {
                                "exprType":"PROPERTY",
                                "byValue":false,
                                "target":"ui:pill",
                                "path":"v.iconUrl"
                              }
                            ],
                            "byValue":false
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "class":"pillIcon",
                                      "style":{
                                        "exprType":"FUNCTION",
                                        "code":"function(cmp, fn) { return fn.add(\"background-color: \",(fn.empty(cmp.get(\"v.iconBackgroundColor\"))?\"transparent\":fn.add(\"#\",cmp.get(\"v.iconBackgroundColor\")))); }",
                                        "args":[
                                          {
                                            "exprType":"PROPERTY",
                                            "byValue":false,
                                            "target":"ui:pill",
                                            "path":"v.iconBackgroundColor"
                                          }
                                        ],
                                        "byValue":false
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"span"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://ui:image"
                                        },
                                        "localId":"icon",
                                        "attributes":{
                                          "values":{
                                            "alt":{
                                              "descriptor":"alt",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:pill",
                                                "path":"v.iconAlt"
                                              }
                                            },
                                            "src":{
                                              "descriptor":"src",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:pill",
                                                "path":"v.iconUrl"
                                              }
                                            },
                                            "imageType":{
                                              "descriptor":"imageType",
                                              "value":{
                                                "exprType":"FUNCTION",
                                                "code":"function(cmp, fn) { return (fn.empty(cmp.get(\"v.iconAlt\"))?\"decorative\":\"informational\"); }",
                                                "args":[
                                                  {
                                                    "exprType":"PROPERTY",
                                                    "byValue":false,
                                                    "target":"ui:pill",
                                                    "path":"v.iconAlt"
                                                  }
                                                ],
                                                "byValue":false
                                              }
                                            },
                                            "onerror":{
                                              "descriptor":"onerror",
                                              "value":{
                                                "exprType":"PROPERTY",
                                                "byValue":false,
                                                "target":"ui:pill",
                                                "path":"c.onIconError"
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "localId":"label",
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"pillText"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"span"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:expression"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":{
                                      "exprType":"PROPERTY",
                                      "byValue":false,
                                      "target":"ui:pill",
                                      "path":"v.label"
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:pill",
                            "path":"v.showDelete"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:html"
                              },
                              "attributes":{
                                "values":{
                                  "HTMLAttributes":{
                                    "descriptor":"HTMLAttributes",
                                    "value":{
                                      "tabindex":"-1",
                                      "onclick":{
                                        "exprType":"PROPERTY",
                                        "byValue":false,
                                        "target":"ui:pill",
                                        "path":"c.deleteItem"
                                      }
                                    }
                                  },
                                  "tag":{
                                    "descriptor":"tag",
                                    "value":"a"
                                  },
                                  "body":{
                                    "descriptor":"body",
                                    "value":[
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"deleteIcon"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "componentDef":{
                                          "descriptor":"markup://aura:html"
                                        },
                                        "attributes":{
                                          "values":{
                                            "HTMLAttributes":{
                                              "descriptor":"HTMLAttributes",
                                              "value":{
                                                "class":"assistiveText"
                                              }
                                            },
                                            "tag":{
                                              "descriptor":"tag",
                                              "value":"span"
                                            },
                                            "body":{
                                              "descriptor":"body",
                                              "value":[
                                                {
                                                  "componentDef":{
                                                    "descriptor":"markup://aura:expression"
                                                  },
                                                  "attributes":{
                                                    "values":{
                                                      "value":{
                                                        "descriptor":"value",
                                                        "value":{
                                                          "exprType":"PROPERTY",
                                                          "byValue":false,
                                                          "target":"ui:pill",
                                                          "path":"v.accessibleDeleteLabel"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "df":"default",
  "fc":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:scrollerWrapper", (function (){/*$A.componentService.addComponentClass("markup://ui:scrollerWrapper",function() {
return {
  "meta":{
    "name":"ui$scrollerWrapper",
    "extends":"markup://aura:component"
  },
  "controller":{
    "scrollTo":function(cmp, event, helper) {
        helper.handleScrollTo(cmp, event);
    },
    "handleTouchstart":function(cmp, event) {
        var startY = event.touches ? event.touches[0].screenY : event.screenY;
        cmp.set('v.privateStartY',startY);
    },
    "handleTouchmove":function(cmp, event, helper) {
        var el     = event.currentTarget;
        var target = event.target;
        var startY = cmp.get('v.privateStartY');
        var canScrollCurrent, canScrollTarget;

        
        
        if (event.cancelScrolling) {
            return;
        }

        
        
        
        if (helper.isElementThatScrollAlways(target)) {
            helper.skipUIScroller(event);
            return;
        }

        canScrollCurrent = helper.canScroll(el);
        
        canScrollTarget  = helper.isElementWithNativeScroll(target) && helper.canScroll(target);

        if (canScrollTarget || canScrollCurrent) {

            var curY = event.touches ? event.touches[0].screenY : event.screenY;

            
            var isAtTop = (startY < curY && helper.isAtTop(el));
            var isAtBottom = (startY > curY && helper.isAtBottom(el));

            
            
            if (canScrollTarget && !event.preventBounce) {
                isAtTop = (isAtTop && helper.isAtTop(target));
                isAtBottom = (isAtBottom && helper.isAtBottom(target));
            }

            if (!isAtTop && !isAtBottom) {
                helper.skipUIScroller(event);
            } else {
                helper.enableUIScroller(event);
            }
        }
    }
  },
  "helper":{
    "canScroll":function(el) {
        var canScrollY = el.scrollHeight > el.offsetHeight;
        var canScrollX = el.scrollWidth > el.offsetWidth;
        return canScrollY || canScrollX;
    },
    "isElementThatScrollAlways":function(target) {
        var isInputRange = target.tagName === 'INPUT' && target.type === 'range';
        return isInputRange;
    },
    "isElementWithNativeScroll":function(target) {
        var isTextarea = target.tagName === 'TEXTAREA';
        return isTextarea;
    },
    "isAtTop":function(el) {
        return el.scrollTop === 0;
    },
    "isAtBottom":function(el) {
        return el.scrollHeight - el.scrollTop === el.offsetHeight
                || el.scrollHeight - el.scrollTop === el.clientHeight;
    },
    "skipUIScroller":function(event) {
        event.cancelScrolling = true;
        event.preventBounce = false;
    },
    "enableUIScroller":function(event) {
        event.cancelScrolling = false;
        event.preventBounce = true;
    },
    "getWrapperElement":function(cmp) {
        return cmp.find("scrollerWrapper").getElement();
    },
    "handleScrollTo":function(cmp, event) {
        var params = event.getParam('arguments'),
            dest    = params.destination,
            x       = params.xcoord || 0,
            y       = params.ycoord || 0;

        if (dest) {            
            var wrapper = this.getWrapperElement(cmp);

            dest = dest.toLowerCase();
            if (dest === 'custom') {
                wrapper.scrollTop  = Math.abs(y);
                wrapper.scrollLeft =  Math.abs(x);
            } else if (dest === 'top') {
                wrapper.scrollTop = 0;
            } else if (dest === 'left') {
                wrapper.scrollLeft = 0;
            } else if (dest === 'bottom') {
                wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight;
            } else if (dest === 'right') {
                wrapper.scrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
            }
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:scrollerWrapper",
  "st":{
    "descriptor":"css://ui.scrollerWrapper",
    "cl":"uiScrollerWrapper"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["privateStartY","aura://Integer","p",false],
    ["class","aura://String","G",false]
  ],
  "med":[
    {
      "name":"ui:scrollTo",
      "xs":"G",
      "action":"{!c.scrollTo}",
      "attributes":[
        ["destination","aura://String","I",false],
        ["xcoord","aura://Integer","I",false,"0"],
        ["ycoord","aura://Integer","I",false,"0"]
      ]
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"scrollerWrapper",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.join(\" \",\"scrollable\",($A.get(\"$Browser.isIOS\")?\"scrollingOnIOS\":\"\"),cmp.get(\"v.class\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:scrollerWrapper",
                        "path":"$Browser.isIOS"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:scrollerWrapper",
                        "path":"v.class"
                      }
                    ],
                    "byValue":false
                  },
                  "ontouchstart":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:scrollerWrapper",
                    "path":"c.handleTouchstart"
                  },
                  "ontouchmove":{
                    "exprType":"PROPERTY",
                    "byValue":false,
                    "target":"ui:scrollerWrapper",
                    "path":"c.handleTouchmove"
                  }
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:expression"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"ui:scrollerWrapper",
                            "path":"v.body"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://ui:spinner", (function (){/*$A.componentService.addComponentClass("markup://ui:spinner",function() {
return {
  "meta":{
    "name":"ui$spinner",
    "extends":"markup://aura:component"
  },
  "controller":{
    "toggleSpinner":function(cmp, event) {
        var isVisible = event.getParam("isVisible");
        if (isVisible) {
            $A.util.removeClass(cmp.find("spinner").getElement(), "hideEl");
        } else {
            $A.util.addClass(cmp.find("spinner").getElement(), "hideEl");
        }
    }
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://ui:spinner",
  "st":{
    "descriptor":"css://ui.spinner",
    "cl":"uiSpinner"
  },
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["isVisible","aura://Boolean","G",false,true],
    ["class","aura://String","G",false]
  ],
  "re":[
    {
      "ed":"markup://ui:toggleLoadingIndicator",
      "n":"toggle",
      "xs":"G"
    }
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.toggleSpinner"
      },
      "n":"toggle"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"spinner",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":{
                    "exprType":"FUNCTION",
                    "code":"function(cmp, fn) { return fn.add(fn.add(cmp.get(\"v.class\"),\" spinner \"),(fn.eq(cmp.get(\"v.isVisible\"),true)?\"\":\"hideEl\")); }",
                    "args":[
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:spinner",
                        "path":"v.class"
                      },
                      {
                        "exprType":"PROPERTY",
                        "byValue":false,
                        "target":"ui:spinner",
                        "path":"v.isVisible"
                      }
                    ],
                    "byValue":false
                  },
                  "role":"alert"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"div"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{
                            "class":"loading"
                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"div"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://ui:image"
                              },
                              "attributes":{
                                "values":{
                                  "class":{
                                    "descriptor":"class",
                                    "value":"spinner-img"
                                  },
                                  "alt":{
                                    "descriptor":"alt",
                                    "value":"Loading"
                                  },
                                  "src":{
                                    "descriptor":"src",
                                    "value":"/auraFW/resources/aura/images/spinner.gif"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "css":true
};*/}));
$A.componentService.addComponent("markup://appJsGenerator:generatorComponent", (function (){/*$A.componentService.addComponentClass("markup://appJsGenerator:generatorComponent",function() {
return {
  "meta":{
    "name":"appJsGenerator$generatorComponent",
    "extends":"markup://aura:component"
  },
  "controller":{
    "init":function(cmp) {
        return
    },
    "getInput":function(cmp) {
		var textI = cmp.find("textI");

		
		var textvalue = textI.get("v.value");
		var textO = cmp.find("textO");

		
		textO.set("v.value", textvalue);
	},
    "getDate":function(cmp) {
		
		var newdate = new Date();
		cmp.set("v.myDate", newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate());
	},
    "inspectKeyEvent":function(cmp, event) {
		
		var keyCodeValue = event.getParam("keyCode");
		cmp.find("outputValue").set("v.value", keyCodeValue);
	},
    "inspectMouseEvent":function(cmp, event) {
		
		
		
		var buttonValue = event.getParam("button");
		cmp.find("outputValue").set("v.value", buttonValue);
	}
  }
};
});
return {
  "xs":"I",
  "descriptor":"markup://appJsGenerator:generatorComponent",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]],
    ["ifTest","aura://Boolean","I",false,true],
    ["myDate","aura://Date","I",false,"2013-02-27T13:00:00.000Z"],
    ["myCurrency","aura://Integer","I",false,50]
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{

                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"section"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:if"
                    },
                    "attributes":{
                      "values":{
                        "isTrue":{
                          "descriptor":"isTrue",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"v.ifTest"
                          }
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:text"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":"True"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{

                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"section"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputRichText"
                    },
                    "localId":"RICH_TEXT",
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"label For Rich Text"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"rich text"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputText"
                    },
                    "localId":"keyup",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"keyup"
                        },
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputText with events"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"Click here with left or right mouse button"
                        },
                        "mousedown":{
                          "descriptor":"mousedown",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"c.inspectMouseEvent"
                          }
                        },
                        "keypress":{
                          "descriptor":"keypress",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"c.inspectKeyEvent"
                          }
                        },
                        "updateOn":{
                          "descriptor":"updateOn",
                          "value":"keyup"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputPhone"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputPhone"
                        },
                        "placeholder":{
                          "descriptor":"placeholder",
                          "value":"000-000-0000"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputEmail"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputEmail"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"email field in disabled state"
                        },
                        "disabled":{
                          "descriptor":"disabled",
                          "value":true
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputSecret"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputSecret"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"secret field"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputURL"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputURL"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"http://"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputURL"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:outputURL demo"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":"/auradocs"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{

                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"br"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:html"
                    },
                    "attributes":{
                      "values":{
                        "HTMLAttributes":{
                          "descriptor":"HTMLAttributes",
                          "value":{

                          }
                        },
                        "tag":{
                          "descriptor":"tag",
                          "value":"br"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:label"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputDate"
                        },
                        "for":{
                          "descriptor":"for",
                          "value":"dateInput"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputDate"
                    },
                    "localId":"dateInput",
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"v.myDate"
                          }
                        },
                        "displayDatePicker":{
                          "descriptor":"displayDatePicker",
                          "value":true
                        },
                        "labelPosition":{
                          "descriptor":"labelPosition",
                          "value":"top"
                        },
                        "mouseup":{
                          "descriptor":"mouseup",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"c.getDate"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputNumber"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"ui:inputNumber"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":42
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputRichText"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"<p>This is a paragraph rendered by <span style=\"color:red;\" >ui:outputRichText<\/span>.<\/p>"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputPhone"
                    },
                    "localId":"oPhone",
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":""
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputCurrency"
                    },
                    "localId":"amount",
                    "attributes":{
                      "values":{
                        "class":{
                          "descriptor":"class",
                          "value":"field"
                        },
                        "label":{
                          "descriptor":"label",
                          "value":"Amount"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"v.myCurrency"
                          }
                        },
                        "updateOn":{
                          "descriptor":"updateOn",
                          "value":"keyup"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputDateTime"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"2013-05-07T00:17:08.997Z"
                        },
                        "langLocale":{
                          "descriptor":"langLocale",
                          "value":"de"
                        },
                        "timezone":{
                          "descriptor":"timezone",
                          "value":"Europe/Berlin"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputCheckbox"
                    },
                    "localId":"output",
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":{
                            "exprType":"PROPERTY",
                            "byValue":false,
                            "target":"appJsGenerator:generatorComponent",
                            "path":"v.ifTest"
                          }
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:menuTrigger"
                    },
                    "attributes":{
                      "values":{
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:text"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":"Menu trigger link"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputEmail"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"Email"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:pill"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"pill"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:message"
                    },
                    "localId":"message",
                    "attributes":{
                      "values":{
                        "title":{
                          "descriptor":"title",
                          "value":"Message"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:spinner"
                    },
                    "localId":"spinner"
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputCurrency"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":10000
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputDateTime"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":""
                        },
                        "displayDatePicker":{
                          "descriptor":"displayDatePicker",
                          "value":true
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:button"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"Button"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputRadio"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":false
                        },
                        "label":{
                          "descriptor":"label",
                          "value":"rad"
                        },
                        "name":{
                          "descriptor":"name",
                          "value":"rad"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:scrollerWrapper"
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputDate"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":""
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:inputCheckbox"
                    },
                    "attributes":{
                      "values":{
                        "label":{
                          "descriptor":"label",
                          "value":"check"
                        },
                        "value":{
                          "descriptor":"value",
                          "value":true
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputNumber"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":1000
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:format"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"format"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:text"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":"Blah"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://ui:outputTextArea"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"outputTextArea"
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://auraStorage:init"
                    },
                    "attributes":{
                      "values":{
                        "secure":{
                          "descriptor":"secure",
                          "value":true
                        },
                        "persistent":{
                          "descriptor":"persistent",
                          "value":false
                        },
                        "name":{
                          "descriptor":"name",
                          "value":"actions"
                        },
                        "maxSize":{
                          "descriptor":"maxSize",
                          "value":4096
                        },
                        "debugLoggingEnabled":{
                          "descriptor":"debugLoggingEnabled",
                          "value":true
                        },
                        "defaultExpiration":{
                          "descriptor":"defaultExpiration",
                          "value":3600
                        },
                        "clearStorageOnInit":{
                          "descriptor":"clearStorageOnInit",
                          "value":false
                        },
                        "defaultAutoRefreshInterval":{
                          "descriptor":"defaultAutoRefreshInterval",
                          "value":3600
                        }
                      }
                    }
                  },
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:label"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"aura label"
                        },
                        "body":{
                          "descriptor":"body",
                          "value":[
                            {
                              "componentDef":{
                                "descriptor":"markup://aura:text"
                              },
                              "attributes":{
                                "values":{
                                  "value":{
                                    "descriptor":"value",
                                    "value":"Label"
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ],
  "hs":true,
  "css":true
};*/}));
$A.componentService.addComponent("markup://aura:application", (function (){/*$A.componentService.addComponentClass("markup://aura:application",function() {
return {
  "meta":{
    "name":"aura$application"
  },
  "renderer":{
    "render":function(component) {
        var rendering = component.getRendering();
        return rendering||$A.renderingService.renderFacet(component,component.get("v.body"));
    },
    "afterRender":function(component) {
        var body = component.get("v.body");
        $A.afterRender(body);
    },
    "rerender":function(component) {
        var body = component.get("v.body");
        return $A.renderingService.rerenderFacet(component,body);
    },
    "unrender":function(component) {
        var body = component.get("v.body");
        $A.renderingService.unrenderFacet(component,body);
    }
  }
};
});
return {
  "descriptor":"markup://aura:application",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]]
  ],
  "i":[
    "markup://aura:rootComponent"
  ],
  "ab":true,
  "lc":{
    "descriptor":"markup://aura:locationChange"
  },
  "css":true
};*/}));
$A.componentService.addComponent("markup://appJsGenerator:generator", (function (){/*$A.componentService.addComponentClass("markup://appJsGenerator:generator",function() {
return {
  "meta":{
    "name":"appJsGenerator$generator",
    "extends":"markup://aura:application",
    "imports":{
      "lib":"markup://appJsGenerator:generatorLib"
    }
  },
  "controller":{
    "init":function(cmp) {
        return
    }
  },
  "helper":{
    "boot":function() {}
  }
};
});
return {
  "xs":"G",
  "descriptor":"markup://appJsGenerator:generator",
  "su":"markup://aura:application",
  "ad":[
    ["body","aura://Aura.Component[]","G",false,[]]
  ],
  "hd":[
    {
      "x":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"c.init"
      },
      "v":{
        "exprType":"PROPERTY",
        "byValue":false,
        "path":"this"
      },
      "n":"init"
    }
  ],
  "fa":[
    {
      "descriptor":"body",
      "value":[
        {
          "componentDef":{
            "descriptor":"markup://aura:html"
          },
          "localId":"container",
          "attributes":{
            "values":{
              "HTMLAttributes":{
                "descriptor":"HTMLAttributes",
                "value":{
                  "class":"container"
                }
              },
              "tag":{
                "descriptor":"tag",
                "value":"section"
              },
              "body":{
                "descriptor":"body",
                "value":[
                  {
                    "componentDef":{
                      "descriptor":"markup://aura:text"
                    },
                    "attributes":{
                      "values":{
                        "value":{
                          "descriptor":"value",
                          "value":"App JS Generator 3"
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        {
          "componentDef":{
            "descriptor":"markup://appJsGenerator:generatorComponent"
          }
        }
      ]
    }
  ],
  "hs":true,
  "lc":{
    "descriptor":"markup://aura:locationChange"
  },
  "css":true
};*/}));
$A.componentService.initEventDefs([
  {
    "descriptor":"markup://aura:applicationEvent",
    "t":"APPLICATION",
    "xs":"G"
  },
  {
    "descriptor":"markup://aura:componentEvent",
    "t":"COMPONENT",
    "xs":"G"
  },
  {
    "descriptor":"markup://aura:valueEvent",
    "t":"VALUE",
    "xs":"G"
  },
  {
    "descriptor":"markup://aura:applicationRefreshed",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://aura:clientOutOfSync",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://aura:clientRedirect",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "url":["url","aura://String","I",false]
    }
  },
  {
    "descriptor":"markup://aura:connectionLost",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://aura:connectionResumed",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://aura:customerError",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "message":["message","aura://String","I",false],
      "error":["error","aura://String","I",false],
      "auraError":["auraError","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://aura:debugLog",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "type":["type","aura://String","I",false],
      "message":["message","aura://String","I",false]
    }
  },
  {
    "descriptor":"markup://aura:doneRendering",
    "t":"APPLICATION",
    "xs":"G"
  },
  {
    "descriptor":"markup://aura:doneWaiting",
    "t":"APPLICATION",
    "xs":"G"
  },
  {
    "descriptor":"markup://aura:initialized",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://aura:invalidSession",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "newToken":["newToken","aura://String","I",false]
    }
  },
  {
    "descriptor":"markup://aura:locationChange",
    "t":"APPLICATION",
    "xs":"G",
    "a":{
      "token":["token","aura://String","G",false],
      "querystring":["querystring","aura://String","G",false]
    }
  },
  {
    "descriptor":"markup://aura:methodCall",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "name":["name","aura://String","G",false],
      "arguments":["arguments","aura://List","G",false,[]]
    }
  },
  {
    "descriptor":"markup://aura:noAccess",
    "t":"APPLICATION",
    "xs":"G",
    "a":{
      "redirectURL":["redirectURL","aura://String","G",false]
    }
  },
  {
    "descriptor":"markup://aura:operationComplete",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "operation":["operation","aura://String","I",false],
      "result":["result","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://aura:systemError",
    "t":"APPLICATION",
    "xs":"G",
    "a":{
      "message":["message","aura://String","G",false],
      "error":["error","aura://String","G",false],
      "auraError":["auraError","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://aura:valueChange",
    "t":"VALUE",
    "xs":"G",
    "su":{
      "descriptor":"markup://aura:valueEvent"
    },
    "a":{
      "expression":["expression","aura://String","G",false],
      "oldValue":["oldValue","aura://Object","G",false,null],
      "value":["value","aura://Object","G",false,null],
      "index":["index","aura://String","G",false]
    }
  },
  {
    "descriptor":"markup://aura:valueDestroy",
    "t":"VALUE",
    "xs":"G",
    "su":{
      "descriptor":"markup://aura:valueEvent"
    },
    "a":{
      "value":["value","aura://Object","G",false,null]
    }
  },
  {
    "descriptor":"markup://aura:valueInit",
    "t":"VALUE",
    "xs":"G",
    "su":{
      "descriptor":"markup://aura:valueEvent"
    },
    "a":{
      "value":["value","aura://Object","G",false,null]
    }
  },
  {
    "descriptor":"markup://aura:valueRender",
    "t":"VALUE",
    "xs":"G",
    "su":{
      "descriptor":"markup://aura:valueEvent"
    },
    "a":{
      "value":["value","aura://Object","G",false,null]
    }
  },
  {
    "descriptor":"markup://aura:waiting",
    "t":"APPLICATION",
    "xs":"G"
  },
  {
    "descriptor":"markup://ui:baseDOMEvent",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:baseMouseEvent",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:baseKeyboardEvent",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "ctrlKey":["ctrlKey","aura://Boolean","I",false],
      "domEvent":["domEvent","aura://Object","I",false,null],
      "shiftKey":["shiftKey","aura://Boolean","I",false],
      "keyCode":["keyCode","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:click",
    "t":"COMPONENT",
    "xs":"PP",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:dblclick",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:mousedown",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:mousemove",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:mouseout",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:mouseover",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:mouseup",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseMouseEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null],
      "button":["button","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:blur",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:command",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "parameters":["parameters","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:focus",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:keydown",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseKeyboardEvent"
    },
    "a":{
      "ctrlKey":["ctrlKey","aura://Boolean","I",false],
      "domEvent":["domEvent","aura://Object","I",false,null],
      "shiftKey":["shiftKey","aura://Boolean","I",false],
      "keyCode":["keyCode","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:keypress",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseKeyboardEvent"
    },
    "a":{
      "ctrlKey":["ctrlKey","aura://Boolean","I",false],
      "domEvent":["domEvent","aura://Object","I",false,null],
      "shiftKey":["shiftKey","aura://Boolean","I",false],
      "keyCode":["keyCode","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:keyup",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseKeyboardEvent"
    },
    "a":{
      "ctrlKey":["ctrlKey","aura://Boolean","I",false],
      "domEvent":["domEvent","aura://Object","I",false,null],
      "shiftKey":["shiftKey","aura://Boolean","I",false],
      "keyCode":["keyCode","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:select",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:collapse",
    "t":"COMPONENT",
    "xs":"G"
  },
  {
    "descriptor":"markup://ui:expand",
    "t":"COMPONENT",
    "xs":"G"
  },
  {
    "descriptor":"markup://ui:menuSelect",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "selectedItem":["selectedItem","aura://Aura.Component[]","G",false,[]],
      "hideMenu":["hideMenu","aura://Boolean","G",false],
      "deselectSiblings":["deselectSiblings","aura://Boolean","G",false],
      "focusTrigger":["focusTrigger","aura://Boolean","G",false]
    }
  },
  {
    "descriptor":"markup://ui:popupKeyboardEvent",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "event":["event","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:popupTargetHide",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "event":["event","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:popupTargetShow",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "event":["event","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:popupTargetToggle",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "component":["component","aura://Aura.Component[]","I",false,[]],
      "show":["show","aura://Boolean","I",false]
    }
  },
  {
    "descriptor":"markup://ui:popupTriggerPress",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:refresh",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:command"
    },
    "a":{
      "parameters":["parameters","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:change",
    "t":"COMPONENT",
    "xs":"PP"
  },
  {
    "descriptor":"markup://ui:clearErrors",
    "t":"COMPONENT",
    "xs":"G"
  },
  {
    "descriptor":"markup://ui:copy",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:cut",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:gridAction",
    "t":"COMPONENT",
    "xs":"PP",
    "a":{
      "index":["index","aura://Integer","I",false],
      "action":["action","aura://String","I",false],
      "payload":["payload","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:inputEvent",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:menuFocusChange",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "previousItem":["previousItem","aura://Aura.Component[]","G",false,[]],
      "currentItem":["currentItem","aura://Aura.Component[]","G",false,[]]
    }
  },
  {
    "descriptor":"markup://ui:menuTriggerPress",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "focusItemIndex":["focusItemIndex","aura://Integer","I",false,0]
    }
  },
  {
    "descriptor":"markup://ui:paste",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:updateError",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:validationError",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "errors":["errors","aura://Object[]","I",false,[]]
    }
  },
  {
    "descriptor":"markup://ui:response",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "value":["value","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:selectDate",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "value":["value","aura://Date","I",false,null],
      "hours":["hours","aura://Integer","I",false],
      "minutes":["minutes","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:updateCalendarTitle",
    "t":"COMPONENT",
    "xs":"I",
    "a":{
      "month":["month","aura://Integer","I",false],
      "year":["year","aura://Integer","I",false]
    }
  },
  {
    "descriptor":"markup://ui:hideDatePicker",
    "t":"APPLICATION",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:load",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:openPicker",
    "t":"COMPONENT",
    "xs":"I"
  },
  {
    "descriptor":"markup://ui:press",
    "t":"COMPONENT",
    "xs":"I",
    "su":{
      "descriptor":"markup://ui:baseDOMEvent"
    },
    "a":{
      "domEvent":["domEvent","aura://Object","I",false,null]
    }
  },
  {
    "descriptor":"markup://ui:registerDatePickerManager",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "sourceComponentId":["sourceComponentId","aura://String","I",false]
    }
  },
  {
    "descriptor":"markup://ui:showDatePicker",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "element":["element","aura://Object","I",false,null],
      "value":["value","aura://String","I",false],
      "sourceComponentId":["sourceComponentId","aura://String","I",false],
      "focusDatePicker":["focusDatePicker","aura://Boolean","I",false,false],
      "toggleVisibility":["toggleVisibility","aura://Boolean","I",false,true]
    }
  },
  {
    "descriptor":"markup://ui:toggleLoadingIndicator",
    "t":"COMPONENT",
    "xs":"G",
    "a":{
      "isVisible":["isVisible","aura://Boolean","G",true]
    }
  },
  {
    "descriptor":"markup://ui:toggleRichText",
    "t":"APPLICATION",
    "xs":"I",
    "a":{
      "isRichText":["isRichText","aura://Boolean","I",false]
    }
  }
]);
$A.componentService.initLibraryDefs([
  {
    "descriptor":"markup://ui:panelPositioningLib",
    "includes":{
      "positioningUtils":"js://ui.panelPositioningLib.positioningUtils",
      "elementProxy":"js://ui.panelPositioningLib.elementProxy",
      "elementProxyFactory":"js://ui.panelPositioningLib.elementProxyFactory",
      "constraint":"js://ui.panelPositioningLib.constraint",
      "panelPositioning":"js://ui.panelPositioningLib.panelPositioning"
    }
  },
  {
    "descriptor":"markup://ui:eventLib",
    "includes":{
      "interactive":"js://ui.eventLib.interactive"
    }
  },
  {
    "descriptor":"markup://ui:dateTimeLib",
    "includes":{
      "dateTimeService":"js://ui.dateTimeLib.dateTimeService"
    }
  },
  {
    "descriptor":"markup://ui:inputNumberLibrary",
    "includes":{
      "number":"js://ui.inputNumberLibrary.number"
    }
  },
  {
    "descriptor":"markup://ui:urlLib",
    "includes":{
      "linkify":"js://ui.urlLib.linkify",
      "urlUtil":"js://ui.urlLib.urlUtil"
    }
  },
  {
    "descriptor":"markup://appJsGenerator:generatorLib",
    "includes":{
      "generatorLib":"js://appJsGenerator.generatorLib.generatorLib"
    }
  }
]);
$A.componentService.initControllerDefs([
  {
    "descriptor":"aura://ComponentController",
    "ac":[
      {
        "n":"getApplication",
        "descriptor":"aura://ComponentController/ACTION$getApplication",
        "at":"SERVER",
        "rt":"java://org.auraframework.instance.Application",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"name",
            "type":"java://java.lang.String"
          },
          {
            "name":"attributes",
            "type":"java://java.util.Map<java.lang.String,java.lang.Object>"
          },
          {
            "name":"chainLoadLabels",
            "type":"java://java.lang.Boolean"
          }
        ]
      },
      {
        "n":"getApplicationDef",
        "descriptor":"aura://ComponentController/ACTION$getApplicationDef",
        "at":"SERVER",
        "rt":"java://org.auraframework.def.ApplicationDef",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"name",
            "type":"java://java.lang.String"
          }
        ]
      },
      {
        "n":"getComponent",
        "descriptor":"aura://ComponentController/ACTION$getComponent",
        "at":"SERVER",
        "rt":"java://org.auraframework.instance.Instance",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"name",
            "type":"java://java.lang.String"
          },
          {
            "name":"attributes",
            "type":"java://java.util.Map<java.lang.String,java.lang.Object>"
          },
          {
            "name":"chainLoadLabels",
            "type":"java://java.lang.Boolean"
          }
        ]
      },
      {
        "n":"getComponentDef",
        "descriptor":"aura://ComponentController/ACTION$getComponentDef",
        "at":"SERVER",
        "rt":"java://org.auraframework.def.ComponentDef",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"name",
            "type":"java://java.lang.String"
          }
        ]
      },
      {
        "n":"getComponents",
        "descriptor":"aura://ComponentController/ACTION$getComponents",
        "at":"SERVER",
        "rt":"java://java.util.List",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"components",
            "type":"java://java.util.List<java.util.Map<java.lang.String,java.lang.Object>>"
          }
        ]
      },
      {
        "n":"getDefinitions",
        "descriptor":"aura://ComponentController/ACTION$getDefinitions",
        "at":"SERVER",
        "rt":"java://java.util.List",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"names",
            "type":"java://java.util.List<java.lang.String>"
          }
        ]
      },
      {
        "n":"getEventDef",
        "descriptor":"aura://ComponentController/ACTION$getEventDef",
        "at":"SERVER",
        "rt":"java://org.auraframework.def.EventDef",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"name",
            "type":"java://java.lang.String"
          }
        ]
      },
      {
        "n":"loadLabels",
        "descriptor":"aura://ComponentController/ACTION$loadLabels",
        "at":"SERVER",
        "rt":"java://java.lang.Boolean",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[

        ]
      },
      {
        "n":"reportDeprecationUsages",
        "descriptor":"aura://ComponentController/ACTION$reportDeprecationUsages",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":true,
        "ag":"aura",
        "pa":[
          {
            "name":"usages",
            "type":"java://java.util.Map<java.lang.String,java.util.List<java.lang.String>>"
          }
        ]
      },
      {
        "n":"reportFailedAction",
        "descriptor":"aura://ComponentController/ACTION$reportFailedAction",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"failedAction",
            "type":"java://java.lang.String"
          },
          {
            "name":"failedId",
            "type":"java://java.lang.String"
          },
          {
            "name":"clientError",
            "type":"java://java.lang.String"
          },
          {
            "name":"clientStack",
            "type":"java://java.lang.String"
          },
          {
            "name":"componentStack",
            "type":"java://java.lang.String"
          },
          {
            "name":"stacktraceIdGen",
            "type":"java://java.lang.String"
          },
          {
            "name":"level",
            "type":"java://java.lang.String"
          }
        ]
      }
    ]
  },
  {
    "descriptor":"aura://LabelController",
    "ac":[
      {
        "n":"getLabel",
        "descriptor":"aura://LabelController/ACTION$getLabel",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"section",
            "type":"java://java.lang.String"
          },
          {
            "name":"name",
            "type":"java://java.lang.String"
          }
        ]
      }
    ]
  },
  {
    "descriptor":"aura://StyleController",
    "ac":[
      {
        "n":"applyTokens",
        "descriptor":"aura://StyleController/ACTION$applyTokens",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "ag":"aura",
        "pa":[
          {
            "name":"descriptors",
            "type":"java://java.util.List<java.lang.String>"
          },
          {
            "name":"extraStyles",
            "type":"java://java.util.List<java.lang.String>"
          }
        ]
      }
    ]
  },
  {
    "descriptor":"aura://TestController",
    "ac":[
      {
        "n":"baseBallDivisions",
        "descriptor":"aura://TestController/ACTION$baseBallDivisions",
        "at":"SERVER",
        "rt":"java://org.auraframework.instance.Component",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"basketBallDivisions",
        "descriptor":"aura://TestController/ACTION$basketBallDivisions",
        "at":"SERVER",
        "rt":"java://org.auraframework.instance.Component",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"currentCallingDescriptor",
        "descriptor":"aura://TestController/ACTION$currentCallingDescriptor",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"doSomething",
        "descriptor":"aura://TestController/ACTION$doSomething",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"getAppCacheUrls",
        "descriptor":"aura://TestController/ACTION$getAppCacheUrls",
        "at":"SERVER",
        "rt":"java://java.util.List",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"getBootstrapPublicCacheExpiration",
        "descriptor":"aura://TestController/ACTION$getBootstrapPublicCacheExpiration",
        "at":"SERVER",
        "rt":"java://int",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"getNamedComponent",
        "descriptor":"aura://TestController/ACTION$getNamedComponent",
        "at":"SERVER",
        "rt":"java://org.auraframework.instance.Component",
        "b":false,
        "ca":false,
        "pa":[
          {
            "name":"componentName",
            "type":"java://java.lang.String"
          },
          {
            "name":"attributes",
            "type":"java://java.util.Map<java.lang.String,java.lang.Object>"
          }
        ]
      },
      {
        "n":"getString",
        "descriptor":"aura://TestController/ACTION$getString",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"getStringWithNonUnicode",
        "descriptor":"aura://TestController/ACTION$getStringWithNonUnicode",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"handleCustomException",
        "descriptor":"aura://TestController/ACTION$handleCustomException",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"handleCustomExceptionWithData",
        "descriptor":"aura://TestController/ACTION$handleCustomExceptionWithData",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"handleException",
        "descriptor":"aura://TestController/ACTION$handleException",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"handleExceptionWithThrownArgument",
        "descriptor":"aura://TestController/ACTION$handleExceptionWithThrownArgument",
        "at":"SERVER",
        "rt":"java://void",
        "b":false,
        "ca":false,
        "pa":[

        ]
      },
      {
        "n":"throwException",
        "descriptor":"aura://TestController/ACTION$throwException",
        "at":"SERVER",
        "rt":"java://java.lang.String",
        "b":false,
        "ca":false,
        "pa":[

        ]
      }
    ]
  }
]);

Aura.appCoreJsReady=true;Aura.appJsReady=true;Aura.appDefsReady&&Aura.appDefsReady();