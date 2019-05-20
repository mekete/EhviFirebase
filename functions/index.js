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

const PRIORITY_HIGH = "high";
const DEVICE_OS_ANDROID = "Android";
const DEVICE_OS_IOS = "Ios";
// ---------------------------------------------------------------------------------------------

// Sends a notifications to all users when a new message is posted.  /pathOne/{id}/pathTwo/{anotherId}
exports.sendUpdateNotification = functions.firestore.document('/appVersion/{uid}').onCreate((snapshot, context) => {
    const appVersion = snapshot.data();
    const appVersionUid = context.params.uid;

    //For now, we are supporting only Android
    const notificationTopic = NOTIFICATION_TOPIC_APPLICATION_UPDATE_ANDROID;//appVersion.notificationTopic
    const timeToLive = 60 * 60 * 2;
    // 
    return sendNotification(appVersion, appVersionUid, notificationTopic, PRIORITY_HIGH, timeToLive, context);
});


function sendNotification(appVersion, appVersionUid, notificationTopic, priority, timeToLive, context) {
    const versionName = appVersion.versionName;
    const updateSummary = appVersion.updateSummary;
    const versionCode = appVersion.versionCode;
    const updateLevel = appVersion.updateLevel;

    const messagePayload = {
        data: {
            deviceOs: DEVICE_OS_ANDROID,
            appVersionUid: appVersionUid,
            //
            versionName: versionName,
            versionCode: versionCode,
            updateSummary: updateSummary,
            updateLevel: updateLevel
        },
        topic: notificationTopic

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

    //return admin.messaging().sendToTopic(notificationTopic, messagePayload, options);
     
    // Send a message to devices subscribed to the provided topic.
    return admin.messaging().send(messagePayload)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
} 