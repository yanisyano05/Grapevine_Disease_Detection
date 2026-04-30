const { withAppBuildGradle } = require("expo/config-plugins");

const NINJA_PATH =
  "C:\\\\Users\\\\Client\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\cmake\\\\4.1.2\\\\bin\\\\ninja.exe";

const CMAKE_BLOCK = `
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_MAKE_PROGRAM=${NINJA_PATH}",
                          "-DCMAKE_OBJECT_PATH_MAX=1024",
                          "-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS=1",
                          "-DCMAKE_CXX_USE_RESPONSE_FILE_FOR_LIBRARIES=1",
                          "-DCMAKE_CXX_RESPONSE_FILE_LINK_FLAG=@",
                          "-DCMAKE_NINJA_FORCE_RESPONSE_FILE=1"
            }
        }
`;

const MARKER = "// CMAKE_FIX_INJECTED";

function injectCmakeFix(buildGradle) {
  if (buildGradle.includes(MARKER)) return buildGradle;

  const defaultConfigRegex = /(defaultConfig\s*\{)([\s\S]*?)(\n\s*\})/m;
  const match = buildGradle.match(defaultConfigRegex);
  if (!match) {
    throw new Error(
      "[withCmakeFix] Impossible de trouver le bloc defaultConfig dans build.gradle"
    );
  }

  const [, openTag, body, closeTag] = match;
  const newBlock = `${openTag}${body}\n        ${MARKER}${CMAKE_BLOCK}${closeTag}`;
  return buildGradle.replace(defaultConfigRegex, newBlock);
}

module.exports = function withCmakeFix(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = injectCmakeFix(config.modResults.contents);
    return config;
  });
};
