// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZthBEUI4zsTpvVCPQqHcHDaR3_o_WKuc",
    authDomain: "ehvi-demo.firebaseapp.com",
    databaseURL: "https://ehvi-demo.firebaseio.com",
    projectId: "ehvi-demo",
    storageBucket: "ehvi-demo.appspot.com",
    messagingSenderId: "403747864547",
    appId: "1:403747864547:web:90a6a1ddd4a7a416"
};

firebase.firestore().settings({ timestampsInSnapshots: true });

firebase.initializeApp(firebaseConfig);

// firebase.firestore().enablePersistence({ experimentalTabSynchronization: true })
//   .then(() => { })
//   .catch(function (err) { }); 
// Google OAuth Client ID, needed to support One-tap sign-up. Set to null if One-tap sign-up is not supported.
var CLIENT_ID = null;// 935579989609-s5e3urqeebs0eihp86kpavnl6f256rvv.apps.googleusercontent.com;
//Web API Key AIzaSyD7mF7qm-KAPnWcJfVii48077aZzLHNH7Q
 