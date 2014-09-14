// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require('chai').expect,
    OMG = require("../svgOMGenerator.js"),
    svgWriter = require("../svgWriter.js"),
    sinon = require('sinon'),
    fs = require('fs'),
    repairMedia = false;
//! repairMedia = true to update failed media with current results
//! Please review the changes carefully and try the media before and after the update


describe('svgWriter', function (){
    
    describe('our SVG writer', function (){

        function compareResults (testName) {
            var testData,
                svgOM,
                exptectedOut;
            
            testData = require("./data/" + testName + "-data.js"),
            svgOM = OMG.extractSVGOM(testData, { }),
            svgOut = svgWriter.printSVG(svgOM);
            
            try {
                exptectedOut = fs.readFileSync('./tests/data/' + testName + ".svg", 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/' + testName + ".svg", svgOut, 'utf8');
                console.log("No reference SVG document found. New one created as " + testName + ".svg");
                return svgOut;
            }
            
            if (svgOut != exptectedOut && repairMedia) {
                fs.writeFileSync('./tests/data/' + testName + ".svg", svgOut, 'utf8');
            }
            
            expect(svgOut).to.equal(exptectedOut);
            return svgOut;
        }
        
        
        
        function compareResultsExport (testName, aTestData) {
            var testData,
                svgOM,
                svgOut,
                exptectedOut,
                svgFilename,
                omOpt,
                scale,
                svgWriterErrors,
                i;
            
            for (i = 0; i + 2 < aTestData.length; i = i + 3) {
                
                omOpt = { layerSpec: aTestData[i] };
                testData = require("./data/" + testName + "/" + aTestData[i + 1] + "-data.js");
                svgFilename = "./tests/data/" + testName + "/" + aTestData[i + 1] + ".svg";
                try {
                    exptectedOut = fs.readFileSync(svgFilename, 'utf8');
                } catch(er) {
                    expectedOut = "NO-TEST-MEDIA";
                }
                    
                scale = aTestData[i + 2];
                svgWriterErrors = [];
                
                svgOM = OMG.extractSVGOM(testData, omOpt);
                
                svgOut = svgWriter.printSVG(svgOM, {
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: scale
                }, svgWriterErrors);
                
                if (svgOut != exptectedOut && repairMedia) {
                    fs.writeFileSync(svgFilename, svgOut, 'utf8');
                }
                expect(svgOut).to.equal(exptectedOut);
            }
            return svgOut;
        }
        
        /* Sub-tree Export */
        
        it("should align text properly inside a paragraph", function () {
            compareResultsExport("paragraphTextAlign", [
                26, "Group 1", 1.0,
                20, "Group 2", 1.0,
                24, "Group 3", 1.0
            ]);
        });
        
        it("should resolve bounds and fxBounds to properly clip layers with effects", function () {
            compareResultsExport("shapes-with-external-fx", [
                4, "outer-glow", 1.0,
                3, "drop-shadow", 1.0,
                2, "stroke", 1.0
            ]);
        });
        
        
        /* Document Export */

        it("should be able to SVG a gradient fill OM", function () {
            compareResults('svgFill');
        });

        it("should avoid douplicated gradients", function () {
            compareResults('gradient-duplicate');
        });

        it("should Adobe Logo", function () {
            compareResults('AdobeLogo');
        });

        it("should create rectangles with different properties.", function () {
            compareResults('svgRect');
        });

        it("should create text", function () {
            compareResults('svgText');
        });

        it("should align text", function () {
            compareResults('svgText-align');
        });

        it("should support vertical text", function () {            
            compareResults('svgText-writing-mode');
        });

        it("should support drop shadow and inner shadow", function () {
            compareResults('svgFx-shadow');
        });

        it("should support drop shadow, inner shadow and overlay", function () {
            compareResults('svgFx-shadow-overlay');
        });

        it("should support overlay", function () {
            compareResults('svgOverlay');
        });

        it("should support gradientOverlay", function () {
            compareResults('svgGradientOverlay');
        });

        it("should support gradientOverlay with opacity", function () {
            compareResults('svgGradientOverlay-opacity');
        });

        it("should support linear gradients", function () {
            compareResults('svgGradient');
        });

        it("should support gradients on text", function () {
            compareResults('svgTextGradient');
        });

        it("should support shadows and overlays on text", function () {
            compareResults('svgTextFx');
        });

        it("should support satin fx effect", function () {
            compareResults('svgFx-satin');
        });

        it("should avoid duplicated filter defintions", function () {
            compareResults('filter-duplicate');
        });

        // FIXME: PSD file missing. Needs to be recreated.
        // it("should combine all fx effect", function () {
        //     compareResults('svgFx-all');
        // });

        it("should show embedded data", function () {
            compareResults('pixelImage');
        });

        it("should show linked data", function () {
            compareResults('pixelImage-linked');
        });

        it("should show embedded data with fx effects", function () {
            compareResults('pixelImage-fx');
        });

        it("should show outer glow fx effects", function () {
            compareResults('outer-glow');
        });

        it("should show inner glow fx effects", function () {
            compareResults('svgFx-inner-glow');
        });

        it("should show radial gradients", function () {
            compareResults('svgGradient-radial');
        });

        it("should show scaled gradients", function () {
            compareResults('gradient-scale');
        });

        it("should show reflected gradients", function () {
            compareResults('svgGradient-reflected');
        });

        it("should show scaled, reflected gradients", function () {
            compareResults('gradient-scale-reflected');
        });

        it("should show reversed gradients", function () {
            compareResults('gradient-reverse');
        });

        it("should show stroke style", function () {
            compareResults('stroke-style');
        });

        it("should show fx effects on grouping layers", function () {
            compareResults('group');
        });

        it("should support different radii for radial gradients in layer space", function () {
            compareResults('radial-gradient-angle-layer');
        });

        it("should support different radii for radial gradients in global space", function () {
            compareResults('radial-gradient-angle-global');
        });

        it("should support different radii for linear gradients in layer space", function () {
            compareResults('linear-gradient-angle-layer');
        });

        it("should support different radii for linear gradients in layer space part 2", function () {
            compareResults('linear-gradient-angle-layer-2');
        });

        it("should support different radii for linear gradients in global space", function () {
            compareResults('linear-gradient-angle-global');
        });

        it("should support different radii for linear gradients in layer space part 2", function () {
            compareResults('linear-gradient-angle-global-2');
        });

        it("should support text styling", function () {
            compareResults('text-styling');
        });

        it("should support text on path", function () {
            compareResults('text-on-path');
        });

        it("should support text transformation", function () {
            compareResults('text-transform');
        });

        it("should differ between local and gloval lighting", function () {
            compareResults('light-global-local');
        });

        it("should support fx stroke", function () {
            compareResults('stroke-fx');
        });

        it("should support gradient overlay in combination with color overlay", function () {
            compareResults('gradient-color-overlay');
        });

    });
});
