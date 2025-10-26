const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function (config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    
    // Ensure tools namespace is added
    if (!manifest.manifest.$) {
      manifest.manifest.$ = {};
    }
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const application = manifest.manifest.application?.[0];
    if (application && application["meta-data"]) {
      // Find and fix the Firebase notification metadata elements
      application["meta-data"].forEach((metaData) => {
        if (!metaData.$) {
          metaData.$ = {};
        }
        
        const name = metaData.$["android:name"];
        
        // Fix the notification color conflict
        if (name === "com.google.firebase.messaging.default_notification_color") {
          metaData.$["tools:replace"] = "android:resource";
        }
        
        // Fix the notification icon conflict if it exists
        if (name === "com.google.firebase.messaging.default_notification_icon") {
          metaData.$["tools:replace"] = "android:resource";
        }
      });
    }

    return config;
  });
};