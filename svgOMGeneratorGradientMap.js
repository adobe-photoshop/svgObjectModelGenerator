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

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js");

    // This is borrowed from gradientmaps.js
    // https://github.com/awgreenblatt/gradientmaps/blob/master/gradientmaps.js
    function SVGWriterGradientMap() {

        var findMatchingDistributedNSegs = function (stops) {
                var maxNumSegs = 100,
                    matched = false;
                for (var nSegs = 1; !matched && nSegs <= maxNumSegs; nSegs++) {
                    var segSize = maxNumSegs / nSegs;
                    matched = true;
                    for (var i = 1; i < stops.length - 1; i++) {
                        var pos = stops[i].offset;
                        if (pos < segSize) {
                            matched = false;
                            break;
                        }
                        var rem = pos % segSize,
                            maxDiff = 1;
                        if (!(rem < maxDiff || segSize - rem < maxDiff)) {
                            matched = false;
                            break;
                        }
                    }

                    if (matched) {
                        return nSegs;
                    }
                }

                return nSegs;
            },
            calcDistributedColors = function (stops, nSegs) {
                var colors = new Array(nSegs);
                colors[0] = stops[0].color;

                var segSize = 100 / nSegs;
                for (var i = 1; i < stops.length - 1; i++) {
                    var stop = stops[i],
                        n = Math.round(stop.offset / segSize);
                    colors[n] = stop.color;
                }
                colors[nSegs] = stops[stops.length - 1].color;

                i = 1;
                while (i < colors.length) {
                    if (!colors[i]) {
                        for (var j = i + 1; j < colors.length; j++) {
                            if (colors[j]) {
                                break;
                            }
                        }

                        // Need to evenly distribute colors stops from svgStop[i-1] to svgStop[j]
                        var startColor = colors[i - 1],
                            r = startColor.r,
                            g = startColor.g,
                            b = startColor.b,
                            a = startColor.a,
                            endColor = colors[j];

                        nSegs = j - i + 1;
                        var dr = (endColor.r - r) / nSegs,
                            dg = (endColor.g - g) / nSegs,
                            db = (endColor.b - b) / nSegs,
                            da = (endColor.a - a) / nSegs;
                        while (i < j) {
                            r += dr;
                            g += dg;
                            b += db;
                            a += da;
                            colors[i] = { r: r, g: g, b: b, a: a };
                            i++;
                        }
                    }
                    i++;
                }
                return colors;
            };

        this.createGradientMap = function (stops, effects, getId) {
            stops.forEach(function (ele) {
                ele.offset *= 100;
            });

            var nSegs = findMatchingDistributedNSegs(stops),
                colors = calcDistributedColors(stops, nSegs),
                redTableValues = "",
                greenTableValues = "",
                blueTableValues = "",
                alphaTableValues = "";

            colors.forEach(function (color) {
                redTableValues += svgWriterUtils.round10k(color.r / 255) + " ";
                greenTableValues += svgWriterUtils.round10k(color.g / 255) + " ";
                blueTableValues += svgWriterUtils.round10k(color.b / 255) + " ";
                alphaTableValues += color.a + " ";
            });

            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, "");
                };
            }

            effects.push(
                {
                    name: "feComponentTransfer",
                    result: getId("comp"),
                    input: [effects[effects.length - 1].result],
                    "color-interpolation-filters": "sRGB",
                    children: [
                        {
                            name: "feFuncR",
                            input: [],
                            type: "table",
                            tableValues: redTableValues.trim()
                        },
                        {
                            name: "feFuncG",
                            input: [],
                            type: "table",
                            tableValues: greenTableValues.trim()
                        },
                        {
                            name: "feFuncB",
                            input: [],
                            type: "table",
                            tableValues: blueTableValues.trim()
                        }
                    ]
                }
            );
        };
    }

    module.exports = SVGWriterGradientMap;
}());