"use strict";

const { exec } = require("child_process");
const path = require("path");

module.exports = {
    load() {
        Editor.Builder.on("before-change-files", onBeforeBuildFinish);
    },
    unload() {
        Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
    },
};

function onBeforeBuildFinish(options, callback) {
    if (options.buildResults) {
        processBuildResult(options.buildResults, callback);
    }
    if (options.bundles) {
        options.bundles.forEach((bundle) => processBuildResult(bundle.buildResults, callback));
    }
}

function processBuildResult(buildResults, callback) {
    let assets = buildResults.getAssetUuids();
    for (let i = 0; i < assets.length; ++i) {
        const file = buildResults.getNativeAssetPath(assets[i]);
        if (file.endsWith(".png")) {
            const cmd = `${path.join(__dirname, "pngquant.exe")} --force --ext .png --strip --skip-if-larger ${file}`;
            exec(cmd, (err) => {
                if (err && err.code !== 98) {
                    Editor.warn(err);
                } else {
                    Editor.success("pngquant: " + file);
                }
                callback();
            });
            Editor.success("pngquant: " + file);
        } else if (file.endsWith(".jpg")) {
            const cmd = `${path.join(__dirname, "jpegtran.exe")} -optimize -progressive -outfile ${file} ${file}`;
            exec(cmd, (err) => {
                if (err) {
                    Editor.warn(err);
                } else {
                    Editor.success("jpegtran: " + file);
                }
                callback();
            });
        }
    }
}
