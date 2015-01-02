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

function (w) {
	'use strict';
    w || (w = window);
	// Namespace
	var SCROLLER = w.__S || (w.__S = {}),
		ITERATIONS = 4;

	// Bezier curve calculation
    function KeySpline (mX1, mY1, mX2, mY2) {
		var CubicBezierSpline;

        // Bezier functions
        function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C(aA1)      { return 3.0 * aA1; }
         
        // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function CalcBezier(aT, aA1, aA2) {
            return ( (A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
        }
         
        // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function GetSlope(aT, aA1, aA2) {
            return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }
         
        function GetTForX(aX) {
        // Newton raphson iteration
            var aGuessT = aX,
                iterations = ITERATIONS,
                currentSlope, currentX, i;

            for (i = 0; i < iterations; i++) {
                currentSlope = GetSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0.0) {
                    return aGuessT;
                }

                currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }

            return aGuessT;
        }

        CubicBezierSpline = function(aX) {
            if (mX1 === mY1 && mX2 === mY2) {
                return aX; // linear
            }

            return CalcBezier(GetTForX(aX), mY1, mY2);
        };

        CubicBezierSpline.toString = function () {
			return 'cubic-bezier('+ mX1 +', ' + mY1 + ', ' + mX2 + ', ' + mY2 + ')';
        };

        return CubicBezierSpline;
    }

    SCROLLER.CubicBezier = KeySpline;

}