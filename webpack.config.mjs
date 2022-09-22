import { resolve } from "node:path";
import BundleDeclarationsWebpackPlugin from "bundle-declarations-webpack-plugin";
import PackageConfig from "./package.json" assert { type: "json" };

const
    { name: packageName } = PackageConfig,
    outDir = resolve("./dist");

/** @type {import("webpack").Configuration} */
export default {
    target: "node",
    mode: "production",
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: outDir,
        publicPath: "/",
        library: packageName,
        libraryTarget: "umd",
        libraryExport: "default",
        umdNamedDefine: true,
        clean: true,
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        modules: ["node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.[tj]s$/i,
                include: resolve("./src"),
                exclude: /\.test\.[tj]s$/i,
                use: {
                    loader: "ts-loader",
                    options: {
                        onlyCompileBundledFiles: true,
                    },
                },
            }
        ]
    },
    externalsPresets: { node: true },
    externals: {
        webpack: "webpack",
    },
    plugins: [
        new BundleDeclarationsWebpackPlugin({
            entry: "./src/index.ts",
            outFile: "index.d.ts",
        }),
    ],
    optimization: {
        usedExports: true,
    },
};