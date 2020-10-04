"use strict";

const { execSync } = require("child_process");
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
    options.bundles.forEach((bundle) => {
        let assets = bundle.buildResults.getAssetUuids();
        for (let i = 0; i < assets.length; ++i) {
            const file = bundle.buildResults.getNativeAssetPath(assets[i]);
            if (file.endsWith(".png")) {
                const cmd = `${path.join(
                    __dirname,
                    "pngquant.exe"
                )} --force --ext .png --strip --skip-if-larger ${file}`;
                try {
                    execSync(cmd);
                    Editor.success("pngquant: " + file);
                } catch (error) {
                    if (error.status !== 98) {
                        Editor.warn(error);
                    }
                }
            } else if (file.endsWith(".jpg")) {
                const cmd = `${path.join(__dirname, "jpegtran.exe")} -optimize -progressive -outfile ${file} ${file}`;
                try {
                    execSync(cmd);
                    Editor.success("jpegtran: " + file);
                } catch (error) {
                    Editor.warn(error);
                }
            }
        }
    });

    callback();
}
