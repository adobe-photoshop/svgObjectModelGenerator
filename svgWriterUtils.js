// Copyright (c) 2014, 2015 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* Help write the SVG */

(function () {
    "use strict";

    var Utils = require("./utils.js"),
        Matrix = require("./matrix.js");

    function SVGWriterUtils() {

        var self = this;
        self.shiftBoundsX = function (bounds, delta) {
            bounds.left += delta;
            bounds.right += delta;
        };

        self.shiftBoundsY = function (bounds, delta) {
            bounds.top += delta;
            bounds.bottom += delta;
        };

        self.write = function (ctx, sOut) {
            ctx.sOut += sOut;
        };

        self.writeln = function (ctx, sOut) {
            // FIXME: This breaks when using ===.
            sOut = sOut == null ? "" : sOut;
            self.write(ctx, sOut + ctx.terminator);
        };

        self.indent = function (ctx) {
            ctx.currentIndent += ctx.indent;
        };

        self.undent = function (ctx) {
            ctx.currentIndent = ctx.currentIndent.substr(0, ctx.currentIndent.length - ctx.indent.length);
        };

        self.componentToHex = function (c) {
            var rnd = Math.round(c),
                hex = rnd.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };

        self.rgbToHex = function (r, g, b) {
            return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
        };

        var colorNames = {
            "#fa8072": "salmon",
            "#ff0000": "red",
            "#ffc0cb": "pink",
            "#ff7f50": "coral",
            "#ff6347": "tomato",
            "#ffa500": "orange",
            "#ffd700": "gold",
            "#f0e68c": "khaki",
            "#dda0dd": "plum",
            "#ee82ee": "violet",
            "#da70d6": "orchid",
            "#800080": "purple",
            "#4b0082": "indigo",
            "#00ff00": "lime",
            "#008000": "green",
            "#808000": "olive",
            "#008080": "teal",
            "#00ffff": "aqua",
            "#0000ff": "blue",
            "#000080": "navy",
            "#ffe4c4": "bisque",
            "#f5deb3": "wheat",
            "#d2b48c": "tan",
            "#cd853f": "peru",
            "#a0522d": "sienna",
            "#a52a2a": "brown",
            "#800000": "maroon",
            "#fffafa": "snow",
            "#f0ffff": "azure",
            "#f5f5dc": "beige",
            "#fffff0": "ivory",
            "#faf0e6": "linen",
            "#c0c0c0": "silver",
            "#808080": "gray"
        };
        self.writeColor = function (val) {
            var color;
            val = val || "transparent";
            if (typeof val == "string") {
                color = val;
            } else if (typeof val == "object" && val.hasOwnProperty("a") && val.a != 1) {
                return "rgba(" + Utils.roundUp(val.r) + "," + Utils.roundUp(val.g) + "," + Utils.roundUp(val.b)+ "," + Utils.round2(val.a) + ")";
            } else {
                color = self.rgbToHex(val.r, val.g, val.b);
            }
            if (colorNames[color.toLowerCase()]) {
                color = colorNames[color.toLowerCase()];
            } else {
                color = color.replace(/^#(.)\1(.)\2(.)\3$/, "#$1$2$3");
            }

            return color;
        };
        self.escapeCSS = function (className) {
            className += "";
            var len = className.length,
                i = 0,
                isDash = className.charAt() == "-",
                out = "";
            for (; i < len; i++) {
                var code = className.charCodeAt(i),
                    char = className.charAt(i),
                    isNum = char == +char;
                if (code >= 1 && code <= 31 || code == 127 || !i && isNum || i == 1 && isDash && isNum) {
                    out += "\\" + code.toString(16) + " ";
                } else {
                    if (code > 127 || char == "-" || char == "_" || isNum || /[a-z]/i.test(char)) {
                        if (char == " ") {
                            out += "-";
                        } else {
                            out += char;
                        }
                    } else {
                        out += "\\" + char;
                    }
                }
            }
            return self.encodedText(out);
        };

        self.getTransform = function (val, tX, tY) {
            if (!val) {
                return "";
            }
            return Matrix.writeTransform(Matrix.createMatrix(val), tX, tY);
        };

        self.round2 = Utils.round2;
        self.round1k = Utils.round1k;
        self.round10k = Utils.round10k;
        self.roundUp = Utils.roundUp;
        self.roundDown = Utils.roundDown;

        self.indentify = function (indent, buf) {
            var out = indent + buf.replace(/(\n)/g, "\n" + indent);
            return out.substr(0, out.length - indent.length);
        };

        self.toString = function (ctx) {
            return ctx.sOut;
        };

        self.encodedText = function (txt) {
            return txt.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&apos;");
        };

        self.extend = Utils.extend;

        self.hasFx = function (ctx) {
            return ctx.currentOMNode.style && ctx.currentOMNode.style.filter;
        };
    }

    module.exports = new SVGWriterUtils();

}());
