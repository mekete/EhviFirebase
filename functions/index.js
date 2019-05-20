const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ---------------------------------------------------------------------------------------------

admin.initializeApp(functions.config().firebase);
//const auth = admin.auth();

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);

// ---------------------------------------------------------------------------------------------
//Don't change! The value of these constants should be same as that of the Android and iOS declaration
const NOTIFICATION_TOPIC_APPLICATION_UPDATE_ANDROID = "TopicAppUpdateAndroid";
const NOTIFICATION_TOPIC_APPLICATION_UPDATE_IOS = "TopicAppUpdateIos";
//
const DEVICE_OS_ANDROID = "Android";
const DEVICE_OS_IOS = "Ios";
// ---------------------------------------------------------------------------------------------

// Sends a notifications to all users when a new message is posted.  /pathOne/{id}/pathTwo/{anotherId}
exports.sendAppUpdateNotification = functions.firestore.document('/appVersion/{uid}').onCreate((snapshot, context) => {
    const appVersion = snapshot.data();
    const appVersionUid = context.params.uid;

    //For now, we are supporting only Android
    const notificationTopic = NOTIFICATION_TOPIC_APPLICATION_UPDATE_ANDROID;//appVersion.notificationTopic
    const priority = "high";
    const timeToLive = 60 * 60 * 2;
    // 
    return sendNotification(appVersion, appVersionUid, notificationTopic, priority, timeToLive, context);
});


function sendNotification(appVersion, appVersionUid, notificationTopic, priority, timeToLive, context) {
    const versionName = appVersion.versionName;
    const updateSummary = appVersion.updateSummary;
    const versionCode = appVersion.versionCode;
    const updateLevel = appVersion.updateLevel;

    const payload = {
        data: {
            deviceOs: DEVICE_OS_ANDROID,
            appVersionUid: appVersionUid,
            //
            versionName: versionName,
            versionCode: versionCode,
            updateSummary: updateSummary,
            updateLevel: updateLevel
        }
    };
    console.log(
        "\n-------- UID              :: " + appVersion.versionName +
        "\n-------- notificationTopic:: " + notificationTopic +
        "\n-------- updateSummary    :: " + updateSummary +
        "\n-------- updateLevel   :: " + updateLevel);

    const options = {
        priority: priority,
        timeToLive: timeToLive
    };



    // // Checking that the user is authenticated.
    // if (context.auth) {
    //     const text = data.text; // Message text passed from the client.
    //     //  user information is automatically added to the request by client sdk, so extract it.
    //     const userUid = context.auth.uid;
    //     const userName = context.auth.token.name || null;
    //     const profilePicUrl = context.auth.token.picture || null;
    //     const email = context.auth.token.email || null;
    //     const displayName = userName || email;
    // }
    // else {
    //     //user isn't authenticated. Throwing an HttpsError so that the client gets the error details.
    //     console.log("\n\n 5555 exports.sendNotificationToMotorist");
    //     //throw new functions.https.HttpsError(ERROR_FAILED_PRECONDITION, 'The function must be called while authenticated.');
    // }
    return admin.messaging().sendToTopic(notificationTopic, payload, options);
} 