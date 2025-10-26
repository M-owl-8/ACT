const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function (config) {
  return withAndroidManifest(config, async (config) => {
    let manifest = config.modResults;
    
    // Ensure root attributes
    if (!manifest.manifest.$) {
      manifest.manifest.$ = {};
    }
    
    // Add tools namespace - this is critical!
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    
    // Get application element
    const application = manifest.manifest.application?.[0];
    if (!application) {
      return config;
    }
    
    // Process meta-data elements
    if (application["meta-data"]) {
      // Iterate through each meta-data element
      for (let metaData of application["meta-data"]) {
        if (!metaData.$) {
          metaData.$ = {};
        }
        
        const name = metaData.$["android:name"];
        
        // Handle Firebase notification color conflict
        if (name === "com.google.firebase.messaging.default_notification_color") {
          // Add tools:replace to override the conflicting attribute
          metaData.$["tools:replace"] = "android:resource";
        }
        
        // Handle Firebase notification icon conflict if present
        if (name === "com.google.firebase.messaging.default_notification_icon") {
          metaData.$["tools:replace"] = "android:resource";
        }
      }
    }
    
    return config;
  });
};