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
/*jslint sub : true */
/**
 * Format is a string using the java format pattern (e.g. #,##0.0). Note that this does not handle quoted 
 * special characters or exponents.
 * Symbols is an optional map of localized symbols to use, otherwise it will use the current locale's symbols
 * @namespace 
 * @constructor
 */
function NumberFormat(format, symbols) {
    this.originalFormat = format;
    this.symbols = symbols || {decimalSeparator: $A.get("$Locale.decimal"),
                               groupingSeparator: $A.get("$Locale.grouping"),
                               currency: $A.get("$Locale.currency")};
    // default values for any format
    this.hasCurrency = false;
    this.multiplier = 1;
    this.minDigits = 1;
    this.groupingDigits = -1;
    this.minFractionDigits = 0;
    this.maxFractionDigits = 0;
    this.prefix = null;
    this.suffix = null;
    this.hasNegativePattern = false;
    this.negativePrefix = null;
    this.negativeSuffix = null;
    
    var parsePhase = 0; // start
    var prefixEnd = 0;
    var suffixStart = format.length;
    var zeros = 0;
    var leftNumbers = 0;
    var rightNumbers = 0;
    var group = -1;
    var decimal = false;
    
    var posPattern, negPattern;
    var split = format.indexOf(";");
    if (split !== -1) {
        // we have a separate negative pattern
        posPattern = format.substring(0, split);
        negPattern = format.substring(split + 1);
    } else {
        // no negative pattern
        posPattern = format;
    }

    for (var i = 0; i < posPattern.length; i++) {
        var c = posPattern.charAt(i);
        switch (parsePhase) {
        case 0:
            if (c === "#" || c === NumberFormat.ZERO) {
                // on to the pattern phase
                parsePhase = 1;
                prefixEnd = i;
                i--;
                continue;
            } else {
                this.checkForSpecialChar(c);
            }
            break;
        case 1:
            switch (c) {
            case "#":
                if (zeros > 0 || decimal) {
                    rightNumbers++;
                } else {
                    leftNumbers++;
                }
                if (group >= 0 && !decimal) {
                    // saw a group but not a decimal
                    group++;
                }
                break;
            case NumberFormat.ZERO:
                if (rightNumbers > 0) {
                    this.parseError("'0's must be sequential");
                }
                zeros++;
                if (group >= 0 && !decimal) {
                    // saw a group but not a decimal
                    group++;
                }
                break;
            case ",":
                if (leftNumbers === 0) {
                    this.parseError("there must be a number before the grouping separator");
                }
                if (decimal) {
                    this.parseError("grouping separator found after the decimal separator");
                }
                // start counting the numbers between groups
                group = 0;
                break;
            case ".":
                if (decimal) {
                    this.parseError("too many decimal separators");
                }
                this.minDigits = zeros;
                zeros = 0;
                decimal = true;
                break;
            default:
                // on to the suffix phase
                suffixStart = i--;
                parsePhase = 2;
                continue;
            }
            break;
        case 2:
            this.checkForSpecialChar(c);
            break;
        }
    }

    this.groupingDigits = group;
    this.minFractionDigits = decimal ? zeros : 0;
    this.maxFractionDigits = this.minFractionDigits + rightNumbers;
    if (this.minDigits === this.minFractionDigit === 0) {
        this.minDigits = 1;
    }
    var innerPattern = posPattern;
    if (prefixEnd) {
        this.prefix = posPattern.substring(0, prefixEnd);
        innerPattern = innerPattern.substring(prefixEnd);
    }
    if (suffixStart < posPattern.length) {
        this.suffix = posPattern.substring(suffixStart);
        innerPattern = innerPattern.substring(0, suffixStart);
    }
    if (negPattern) {
        this.hasNegativePattern = true;
        var inner = negPattern.indexOf(innerPattern);
        if (inner === -1) {
            this.parseError("negative pattern doesn't contain identical number format");
        }
        if (inner !== 0) {
            this.negativePrefix = negPattern.substring(0, inner);
        }
        if (inner + innerPattern.length < negPattern.length) {
            this.negativeSuffix = negPattern.substring(inner + innerPattern.length);
        }
    }
    this.replaceCurrencies();
}

NumberFormat.ZERO = "0";

NumberFormat.prototype.parseError = function(s) {
    throw new Error("Invalid patter: " + this.originalFormat + "\n" + s);
};

/* 
 * helper method to track special characters
 */
NumberFormat.prototype.checkForSpecialChar = function(c) {
    var mult;
    switch (c) {
    case "¤":
        this.hasCurrency = true;
        break;
    case "%":
        mult = 100;
        break;
    case "‰":
        mult = 1000;
        break;
    case "‱":
        mult = 10000;
        break;
    }
    if (mult) {
        if (this.multiplier !== 1) {
            this.parseError("too many percentage symbols");
        } else {
            this.multiplier = mult;
        }
    }
};

/* 
 * replace currency markers with the local currency symbol
 */
NumberFormat.prototype.replaceCurrencies = function() {
    if (this.hasCurrency) {
        this.prefix = this.replaceCurrency(this.prefix);
        this.suffix = this.replaceCurrency(this.suffix);
        this.negativePrefix = this.replaceCurrency(this.negativePrefix);
        this.negativeSuffix = this.replaceCurrency(this.negativeSuffix);
    }
};

NumberFormat.prototype.replaceCurrency = function(str) {
    if (str) {
        return str.replace(/¤¤/g, this.symbols.currencyCode).replace(/¤/g, this.symbols.currency);
    }
    return str;
};

/**
 * format a number into a string
 */
NumberFormat.prototype.format = function(number) {
    if (!$A.util.isFiniteNumber(number)) {
        throw new Error("Unable to format " + number);
    }
    var negative = number < 0;
    var numToFormat = Math.abs(number);
    if (this.multiplier !== 1) {
        numToFormat *= this.multiplier;
    }
    // round it off
    if (this.maxFractionDigits > 0) {
        var roundMult = Math.pow(10, this.maxFractionDigits);
        numToFormat *= roundMult;
        numToFormat = Math.round(numToFormat);
        numToFormat /= roundMult;
    } else {
        numToFormat = Math.round(numToFormat);
    }
    
    var ns = String(numToFormat);
    var prefix = this.prefix;
    var suffix = this.suffix;
    if (negative && this.hasNegativePattern) {
        prefix = this.negativePrefix;
        suffix = this.negativeSuffix;
    }
    var str = prefix ? prefix : "";
    if (negative && !this.hasNegativePattern) {
        // if there is no negative pattern, append '-' for negative numbers
        str += "-";
    }
    // format the integral part
    var decimalPos = ns.indexOf(".");
    var intPart = ns;
    var fracPart = "";
    if (decimalPos !== -1) {
        intPart = ns.substr(0, decimalPos);
        fracPart = ns.substr(decimalPos + 1);
    }

    while (intPart.length < this.minDigits) {
        // too short, add 0s
        intPart = NumberFormat.ZERO.concat(intPart);
    }
    
    if (this.groupingDigits <= 0 || intPart.length <= this.groupingDigits) {
        // no need for grouping
        str += intPart;
    } else {
        var dist = intPart.length % this.groupingDigits || this.groupingDigits;
        str += intPart.substr(0, dist);
        intPart = intPart.substr(dist);
        while (intPart.length > 0) {
            str += this.symbols.groupingSeparator;
            str += intPart.substr(0, this.groupingDigits);
            intPart = intPart.substr(this.groupingDigits);
        }
    }

    if (fracPart.length > 0 || this.minFractionDigits > 0) {
        str += this.symbols.decimalSeparator;
    }
    if (fracPart.length > 0) {
        str += fracPart;
    }
    for (var i = fracPart.length; i < this.minFractionDigits; i++) {
        str += NumberFormat.ZERO;
    }
    if (suffix) {
        str += suffix;
    }
    
    return str;
};

//#include aura.util.NumberFormat_export
