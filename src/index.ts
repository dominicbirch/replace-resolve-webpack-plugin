import { existsSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { ResolvePluginInstance, Resolver } from "webpack";


function replacementExists(newRequest: string, { mainFiles, extensions }: Resolver["options"]) {
    return existsSync(newRequest) // fully qualified file
        || function () {
            for (const ext of extensions) {
                if (existsSync(`${newRequest}${ext}`)) {
                    return true; // file request with resolvable extension
                }
                for (const main of mainFiles) {
                    if (existsSync(join(newRequest, `${main}${ext}`))) {
                        return true; // directory request with resolvable main file and extension
                    }
                }
            }
        }();
}

export interface OverrideResolverPluginOptions {
    /**Absolute path to the root directory of files which are candidates for replacement. */
    from: string;
    /**Absolute path to the root directory of files which are replacements for their relative equivalents under `from`.*/
    to: string;
}

/**Replaces modules in the configured `from` directory with their respective counterparts in the configured `to` directory (if present).
 * `mainFiles` and `extensions` provided to webpack's resolve options are taken into account; but any import which webpack supports may be replaced, not only modules (images and stylesheets for example).
 * @example
 * Given the following directory structure:
 * ```
 * src/
 * ├ foo/
 * │ ├ index.ts
 * │ └ bar.ts
 * └ index.ts
 * acme/
 * └ foo/
 *   └ index.ts
 * ```
 * And the options:
 * ```js
 * {
 *   from: path.resolve("./src")
 *   to: path.resolve("./acme")
 * }
 * ```
 * When the following code is added to `src/index.ts`:
 * ```ts
 * const foo = await import("./foo");
 * const bar = await import("./foo/bar");
 * ```
 * Then `foo` is replaced with `acme/foo/index.ts` and `bar` remains as `src/foo/bar.ts`.
 */
export class ReplaceResolvePlugin implements ResolvePluginInstance {
    constructor(readonly options: OverrideResolverPluginOptions) {
        if (!isAbsolute(options.from)) { throw new Error("options.from must be an absolute path"); }
        if (!isAbsolute(options.to)) { throw new Error("options.to must be an absolute path"); }
    }

    /**@inheritdoc */
    apply(resolver: Resolver) {
        resolver.hooks.resolve.tapAsync("ReplaceResolvePlugin", (r, c, callback) => {
            const { request, path } = r;
            if (!request || !path) { return callback(); }

            const newRequest = resolve(
                this.options.to,
                relative(
                    this.options.from,
                    resolve(path, request)
                )
            );

            if (replacementExists(newRequest, resolver.options)) {
                r.request = newRequest;
            }

            callback();
        });
    };
}

export default ReplaceResolvePlugin;