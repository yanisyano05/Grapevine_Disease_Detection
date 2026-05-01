const {
  withAppBuildGradle,
  withProjectBuildGradle,
} = require("expo/config-plugins");

const NINJA_PATH =
  "C:\\\\Users\\\\Client\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\cmake\\\\4.1.2\\\\bin\\\\ninja.exe";

const CMAKE_ARGS = [
  `"-DCMAKE_MAKE_PROGRAM=${NINJA_PATH}"`,
  `"-DCMAKE_OBJECT_PATH_MAX=1024"`,
  `"-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS=1"`,
  `"-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_LIBRARIES=1"`,
  `"-DCMAKE_CXX_RESPONSE_FILE_LINK_FLAG=@"`,
  `"-DCMAKE_NINJA_FORCE_RESPONSE_FILE=1"`,
];

const CMAKE_BLOCK = `
        externalNativeBuild {
            cmake {
                arguments ${CMAKE_ARGS.join(",\n                          ")}
            }
        }
`;

const APP_MARKER = "// CMAKE_FIX_INJECTED";
const ROOT_MARKER = "// CMAKE_FIX_SUBPROJECTS_INJECTED";

const SUBPROJECTS_BLOCK = `
${ROOT_MARKER}
subprojects { subproject ->
    def applyCmakeFix = {
        try {
            subproject.android {
                defaultConfig {
                    externalNativeBuild {
                        cmake {
                            arguments ${CMAKE_ARGS.join(",\n                                      ")}
                        }
                    }
                }
            }
        } catch (Exception e) {
            println "[CMAKE_FIX] Skipping " + subproject.name + ": " + e.message
        }
    }
    subproject.plugins.withId('com.android.library', applyCmakeFix)
    subproject.plugins.withId('com.android.application', applyCmakeFix)
}
`;

function injectAppCmakeFix(buildGradle) {
  if (buildGradle.includes(APP_MARKER)) return buildGradle;

  const defaultConfigRegex = /(defaultConfig\s*\{)([\s\S]*?)(\n\s*\})/m;
  const match = buildGradle.match(defaultConfigRegex);
  if (!match) {
    throw new Error(
      "[withCmakeFix] Impossible de trouver le bloc defaultConfig dans build.gradle"
    );
  }

  const [, openTag, body, closeTag] = match;
  const newBlock = `${openTag}${body}\n        ${APP_MARKER}${CMAKE_BLOCK}${closeTag}`;
  return buildGradle.replace(defaultConfigRegex, newBlock);
}

function injectRootSubprojectsFix(buildGradle) {
  if (buildGradle.includes(ROOT_MARKER)) return buildGradle;
  return `${buildGradle.trimEnd()}\n${SUBPROJECTS_BLOCK}\n`;
}

module.exports = function withCmakeFix(config) {
  // The fix is Windows-only: it hardcodes a Windows ninja.exe path and
  // injects response-file flags that work around the Win32 MAX_PATH limit.
  // On EAS Build (Linux) or macOS there's no path-too-long issue and the
  // hardcoded ninja path doesn't exist, so we MUST skip the plugin.
  if (process.platform !== "win32") {
    if (process.env.EAS_BUILD || process.env.CI) {
      console.log(
        "[withCmakeFix] Skipping on non-Windows platform (" +
          process.platform +
          "). Native ninja from PATH will be used."
      );
    }
    return config;
  }

  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = injectAppCmakeFix(config.modResults.contents);
    return config;
  });

  config = withProjectBuildGradle(config, (config) => {
    config.modResults.contents = injectRootSubprojectsFix(
      config.modResults.contents
    );
    return config;
  });

  return config;
};
