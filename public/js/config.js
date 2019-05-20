// Initialize Firebase
var config = {
    apiKey: "AIzaSyCN7cHa_APpO2FeNHdWNY0PK2-bmgJtUaE",
    authDomain: "icladdis-fbe8c.firebaseapp.com",
    databaseURL: "https://icladdis-fbe8c.firebaseio.com",
    projectId: "icladdis-fbe8c",
    storageBucket: "icladdis-fbe8c.appspot.com",
    messagingSenderId: "868745507264"
};

firebase.initializeApp(config);

// firebase.firestore().enablePersistence({ experimentalTabSynchronization: true })
//   .then(() => { })
//   .catch(function (err) { }); 
// Google OAuth Client ID, needed to support One-tap sign-up. Set to null if One-tap sign-up is not supported.
var CLIENT_ID = null// 935579989609-s5e3urqeebs0eihp86kpavnl6f256rvv.apps.googleusercontent.com;
//Web API Key AIzaSyD7mF7qm-KAPnWcJfVii48077aZzLHNH7Q


