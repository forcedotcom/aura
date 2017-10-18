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
 * Construct a SecureCanvasRenderingContext2D wrapper.
 *
 * @public
 * @class
 */
function SecureCanvasRenderingContext2D(ctx, key) {
    "use strict";

    var o = ls_getFromCache(ctx, key);
    if (o) {
        return o;
    }
    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureCanvasRenderingContext2D: " + ctx + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    SecureObject.addPrototypeMethodsAndProperties(SecureCanvasRenderingContext2D.metadata, o, ctx, key);

    ls_setRef(o, ctx, key);
    ls_addToCache(ctx, o, key);
    ls_registerProxy(o);

    return o;
}

var DEFAULT = SecureElement.DEFAULT;
var FUNCTION = SecureElement.FUNCTION;
var FUNCTION_RAW_ARGS = SecureElement.FUNCTION_RAW_ARGS;
var RAW = { type: "@raw" };
var READ_ONLY_PROPERTY = { writable : false };

SecureCanvasRenderingContext2D.metadata = {
    "prototypes": {
        "CanvasRenderingContext2D" : {
            "addHitRegion" :            FUNCTION,
            "arc" :                     FUNCTION,
            "arcTo" :                   FUNCTION,
            "beginPath" :               FUNCTION,
            "bezierCurveTo" :           FUNCTION,
            "canvas" :                  READ_ONLY_PROPERTY,
            "clearHitRegions" :         FUNCTION,
            "clearRect" :               FUNCTION,
            "clip" :                    FUNCTION,
            "closePath" :               FUNCTION,
            "createImageData" :         FUNCTION,
            "createLinearGradient" :    FUNCTION,
            "createPattern":            FUNCTION_RAW_ARGS,
            "createRadialGradient" :    FUNCTION,
            "currentTransform" :        RAW,
            "direction" :               DEFAULT,
            "drawFocusIfNeeded" :       FUNCTION_RAW_ARGS,
            "drawImage" :               FUNCTION_RAW_ARGS,
            "ellipse" :                 FUNCTION,
            "fill" :                    FUNCTION_RAW_ARGS,
            "fillRect" :                FUNCTION,
            "fillStyle":                DEFAULT,
            "fillText" :                FUNCTION,
            "font" :                    DEFAULT,
            "getImageData" :            FUNCTION,
            "getLineDash" :             FUNCTION,
            "globalAlpha" :             DEFAULT,
            "globalCompositeOperation": DEFAULT,
            "imageSmoothingEnabled" :   DEFAULT,
            "isPointInPath" :           FUNCTION,
            "isPointInStroke" :         FUNCTION,
            "lineCap" :                 DEFAULT,
            "lineDashOffset" :          DEFAULT,
            "lineJoin":                 DEFAULT,
            "lineTo" :                  FUNCTION,
            "lineWidth" :               DEFAULT,
            "measureText" :             FUNCTION,
            "miterLimit" :              DEFAULT,
            "moveTo" :                  FUNCTION,
            "putImageData" :            FUNCTION_RAW_ARGS,
            "quadraticCurveTo" :        FUNCTION,
            "rect" :                    FUNCTION,
            "removeHitRegion" :         FUNCTION,
            "restore" :                 FUNCTION,
            "resetTransform" :          FUNCTION,
            "rotate" :                  FUNCTION,
            "save" :                    FUNCTION,
            "scale" :                   FUNCTION,
            "setLineDash" :             FUNCTION,
            "setTransform" :            FUNCTION,
            "scrollPathIntoView" :      FUNCTION_RAW_ARGS,
            "strokeRect" :              FUNCTION,
            "strokeStyle":              DEFAULT,
            "strokeText" :              FUNCTION,
            "shadowBlur" :              DEFAULT,
            "shadowColor" :             DEFAULT,
            "shadowOffsetX" :           DEFAULT,
            "shadowOffsetY" :           DEFAULT,
            "stroke" :                  FUNCTION_RAW_ARGS,
            "textAlign" :               DEFAULT,
            "textBaseline" :            DEFAULT,
            "translate" :               FUNCTION,
            "transform" :               FUNCTION
        }
    }
};