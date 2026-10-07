// ===== Ronch Production Floor · Traceability · settings =====
// Same Firebase project as the CRM, so both apps share one database and one
// set of logins. The traceability app uses its own tr_* collections and never
// touches the CRM's pf_* ones.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAF3M6t-LOeDMIwYJlW4AeAD9QtXt6AzIA",
  authDomain: "ronch-production.firebaseapp.com",
  projectId: "ronch-production",
  storageBucket: "ronch-production.firebasestorage.app",
  messagingSenderId: "831587496128",
  appId: "1:831587496128:web:dd84286729f285b453bd25"
};

window.APP_SETTINGS = {
  // Station PCs sign in as <name>@<loginDomain>. Create these users in
  // Firebase → Authentication → Users:
  //   production@   quality@   admin@
  loginDomain: "ronch-floor.app",

  // Accounts offered on the sign-in screen, in order.
  stationLogins: ["production", "quality", "admin"],

  // Prefix for this app's Firestore collections. Leave as "tr_".
  prefix: "tr_"
};
