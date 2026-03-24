module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      "react-native-reanimated/plugin"  // v3 plugin — no worklets needed
    ],
  };
};