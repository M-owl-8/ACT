const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function (config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    
    // Ensure manifest root attributes exist
    if (!manifest.manifest.$) {
      manifest.manifest.$ = {};
    }
    
    // Add tools namespace
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    
    // Get or create application element
    const application = manifest.manifest.application?.[0];
    if (!application) {
      return config;
    }
    
    // Ensure meta-data array exists
    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }
    
    // Process all metadata elements
    application["meta-data"] = application["meta-data"].map((metaData) => {
      if (!metaData.$) {
        metaData.$ = {};
      }
      
      const name = metaData.$["android:name"];
      
      // Fix Firebase notification conflicts by using tools:replace
      if (
        name === "com.google.firebase.messaging.default_notification_color" ||
        name === "com.google.firebase.messaging.default_notification_icon"
      ) {
        // Only add tools:replace if it doesn't already exist
        if (!metaData.$["tools:replace"]) {
          metaData.$["tools:replace"] = "android:resource";
        }
      }
      
      return metaData;
    });

    return config;
  });
};