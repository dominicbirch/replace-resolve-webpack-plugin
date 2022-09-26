# replace-resolve-webpack-plugin
![NPM version](https://badge.fury.io/js/replace-resolve-webpack-plugin.svg)
[![release](https://github.com/dominicbirch/replace-resolve-webpack-plugin/actions/workflows/release.yml/badge.svg)](https://github.com/dominicbirch/replace-resolve-webpack-plugin/actions/workflows/release.yml)
[![build](https://github.com/dominicbirch/replace-resolve-webpack-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/dominicbirch/replace-resolve-webpack-plugin/actions/workflows/test.yml)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

This is a [webpack](https://webpack.js.org) resolve plugin which supports replacing imports in directory A, with any imports that exist at the same relative path in directory B (optional substitution by convention).  

There are potentially a few scenarios where this might be useful to do at build-time, some which spring to mind are...
* Creating variations of a bundle (branding/experimentation/compile-time feature flags)
* Replacing modules for use in [storybook](https://storybook.js.org), which also uses webpack at the time of writing, without the overhead of a mocking framework.
* Tailoring libraries for multiple targets using the same source (react native maybe?)

While it makes sense in situations where you want to replace a lot of imports with different values, it's less convenient in cases where the intention is to redirect lots of modules to a small set of replacements; in such cases I would suggest leveraging either [webpack's alias](https://webpack.js.org/configuration/resolve/#resolvealias) or [NormalModuleReplacementPlugin](https://webpack.js.org/plugins/normal-module-replacement-plugin/).

**Alternatively,** in simple use cases where only module resolution precedence (no absolute, dot paths or imports with extensions are involved), it would probably be simpler to make use of `resolve.modules` in webpack's configuration rather than using this plugin.  

For example, the equivalent to the plugin example would look like this:
```mjs
import { resolve } from "node:path";

/** @type {import("webpack").Configuration} */
export default {
    // ...
    resolve: {
        modules: [
            resolve("./replacements"), 
            resolve("./src"),
            "node_modules",
        ],
    },
};
// results in ...
import Foo from "components/Foo" 
// resolution attempts in order:
//    1 ./replacements/Foo
//    2 ./src/Foo 
//    3 **/node_modules/components/Foo
```

## Example usage
```mjs
import ReplaceResolvePlugin from "replace-resolve-webpack-plugin";
import { resolve } from "node:path";

/** @type {import("webpack").Configuration} */
export default {
    // ...
    resolve: {
        plugins: [
            new ReplaceResolvePlugin({
                from: resolve("./src"),
                to: resolve("./replacements"),
            }),
            `...`,
        ],
    },
};
```
Given the config above, any supported import may be replaced with a compatible substitute at the same relative path under `./replacements` as the item to replace is at under `./src`.  

The same rules apply as with importing from the original, with `mainFiles` and `extensions` being applied from configuration, and other file types requiring an extension.

If a replacement does not exist, the original is preserved.

`from` and `to` _must_ be absolute paths, but as far as I know they can exist anywhere (they can be outside of the consuming repository for example); that said, certain loaders may require the path to be included.
