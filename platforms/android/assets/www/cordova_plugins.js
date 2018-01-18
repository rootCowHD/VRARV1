cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-vuforia.VuforiaPlugin",
    "file": "plugins/cordova-plugin-vuforia/www/VuforiaPlugin.js",
    "pluginId": "cordova-plugin-vuforia",
    "clobbers": [
      "navigator.VuforiaPlugin"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-vuforia-sdk": "6.0.117",
  "cordova-plugin-vuforia": "3.2.1",
  "cordova-plugin-vibration": "3.0.1"
};
// BOTTOM OF METADATA
});