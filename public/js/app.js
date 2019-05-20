
// ------------------------------------------------------------------------------------------------
function getUiConfig() {
    return {
        'callbacks': {
            // Called when the user has been successfully signed in.
            'signInSuccessWithAuthResult': function (authResult, redirectUrl) {
                if (authResult.user) {
                    handleSignedInUser(authResult.user);
                }
                // if (authResult.additionalUserInfo) {
                // document.getElementById('is-new-user').textContent = authResult.additionalUserInfo.isNewUser ? 'New User' : 'Existing User';
                // }
                // Do not redirect.
                return false;
            }
        },
        // Opens IDP Providers sign-in flow in a popup.
        'signInFlow': 'popup',
        'signInOptions': [
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // Required to enable this provider in One-Tap Sign-up.
                authMethod: 'https://accounts.google.com',
                // Required to enable ID token credentials for this provider.
                clientId: CLIENT_ID
            },
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: true
            }
        ],
        'tosUrl': URL_TERMS_OF_SERVICE,
        'privacyPolicyUrl': URL_PRIVACY_POLICY,
        'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
            firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
            firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
    };
}


// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
ui.disableAutoSignIn();


/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
function getWidgetUrl() {
    return '/widget#recaptcha=' + getRecaptchaMode();
}

/**
 * @return {string} The reCAPTCHA rendering mode from the configuration.
 */
function getRecaptchaMode() {
    // Quick way of checking query params in the fragment. If we add more config we might want to actually parse the fragment as a query string.
    return location.hash.indexOf('recaptcha=invisible') !== -1 ?
        'invisible' : 'normal';
}

var signInWithRedirect = function () {
    window.location.assign(getWidgetUrl());
};


var signInWithPopup = function () {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};




/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function (user) {
    var userEmail = user.uid;
    var displayName = user.displayName ? user.displayName : userEmail;
    var profilePicUrl = user.photoURL;
    var userUid = user.uid;
    var provider = (user != null && user.providerData.length > 0) ? user.providerData[0].providerId : 'Custom';

    if ($('#login_section').length > 0) { $('#login_section').hide(); }

    setItemOnLocalStorage(SESSION_VARIABLE_USER_UID, userUid);
    setItemOnLocalStorage(SESSION_VARIABLE_USER_EMAIL, userEmail);
    setItemOnLocalStorage(SESSION_VARIABLE_USER_DISPLAY_NAME, displayName);
    //setItemOnLocalStorage(SESSION_VARIABLE_USER_ROLE, '');
    registerAppUserOnCLoud(user, provider);
    fetchUserRole(userUid);
    var clientUser = (getItemFromLocalStorage(CURRENT_MODE) == CURRENT_MODE_CLIENT);
    var adminUser = (getItemFromLocalStorage(CURRENT_MODE) == CURRENT_MODE_ADMIN);

    //authorize();

    if (clientUser) {
        $('#firestore_logged_in_container').show();
        $('#firestore_user_name').val(displayName);
        showUserPhoto(profilePicUrl);
    } else if (adminUser) {
        handleLoggedInAdmin();
    } else {
        console.log("Emmmmmm ... what ???? ");
    }


};




/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function () {
    // var clientUser = (getItemFromLocalStorage(CURRENT_MODE) == CURRENT_MODE_CLIENT);

    // ui.start('#firebase_ui_login_container', getUiConfig());
    // //
    // if ($('#chat_section').length > 0) { $('#chat_section').hide(); }
    // if ($('#track_section').length > 0) { $('#track_section').hide(); }


    // if ($('#track_motorist_activity_section').length > 0) { $('#track_motorist_activity_section').hide(); }
    // if ($('#firestore_logged_in_container').length > 0) { $('#firestore_logged_in_container').hide(); }
    // if ($('#track_branch_register_section').length > 0) { $('#track_branch_register_section').hide(); }
    // if ($('#track_branch_assign_section').length > 0) { $('#track_branch_assign_section').hide(); }
    // //
    // if ($('#login_section').length > 0) { $('#login_section').show(); }
    // if ($('#firestore_logged_out_container').length > 0) { $('#firestore_logged_out_container').show(); }
    // //

    // setItemOnLocalStorage(SESSION_VARIABLE_USER_UID, '');
    // setItemOnLocalStorage(SESSION_VARIABLE_USER_EMAIL, '');
    // setItemOnLocalStorage(SESSION_VARIABLE_USER_DISPLAY_NAME, '');
    // setItemOnLocalStorage(SESSION_VARIABLE_USER_ROLE, '');

};



// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        handleSignedInUser(user);
        //location.reload();
    } else {
        handleSignedOutUser();
    }

});


/**
 * Handles when the user changes the reCAPTCHA config.
 */
function handleRecaptchaConfigChange() {
    var newRecaptchaValue = document.querySelector(
        'input[name="recaptcha"]:checked').value;
    location.replace(location.pathname + '#recaptcha=' + newRecaptchaValue);

    // Reset the inline widget so the config changes are reflected.
    ui.reset();
    ui.start('#firebase_ui_login_container', getUiConfig());
}


function getFirestoreCollectionReference(documentName) {
    const firestore = firebase.firestore();
    return firestore.collection(documentName);
}



function registerUpdateNotification() {
    var latestVersionName = $('#txtf_notification_title').val();
    var updateSummary = $('#txtf_notification_detail_message').val();
    var updateLevel = $('#radb_update_major').is(':checked') ? UPDATE_LEVEL_MAJOR : UPDATE_LEVEL_MINOR;

    // 
    if (!isAppUpdateDataValid()) {
        console.log("Emmm... Invalid data");
        return;
    }

    var collectionRef = getFirestoreCollectionReference(FIRESTORE_DOCUMENT_APP_VERSION);
    var appUpdateRef = collectionRef.doc();

    appUpdateRef.set({
        updateLevel: updateLevel,
        latestVersionName: latestVersionName,
        updateSummary: updateSummary,
        //
        createdDate: firebase.firestore.FieldValue.serverTimestamp(),
        updatedDate: firebase.firestore.FieldValue.serverTimestamp()
        //  


    }).then(function () {
        $('#txtf_notification_title').val('');
        $('#txtf_notification_detail_message').val(''); 
        $("#radb_update_minor").attr('checked', true);

    }).catch(function (error) {
        console.log(error);
    }); 
}


function isAppUpdateDataValid() {
    if (!$('#txtf_notification_title').val()) {
        showWarningDataToast('Title is required.');
        return false;
    } else if (!$('#txtf_notification_detail_message').val()) {
        showWarningDataToast('Detail message is required.');
        return false;
    }
    return true;
}

const spinner = new Spinner({
    lines: 12, // The number of lines to draw
    length: 24, // The length of each line
    width: 10, // The line thickness
    radius: 24, // The radius of the inner circle 
    color: '#c0c842', // #rbg or #rrggbb
    fadeColor: '#2A3F54',
    speed: 1, // Rounds per second
    trail: 100, // Afterglow percentage
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    shadow: true // Whether to render a shadow
});

function showSuccessDataToast() {
    showToast("Data updated", TOAST_STYLE_SUCCESS);
    spinner.stop();

}
function showInfoDataToast() {
    //showToast("Started fetching data", TOAST_STYLE_INFO);
    spinner.spin(document.getElementById("loading_spin_container"));

}

function showWarningDataToast(errorMessage) {
    showToast(errorMessage, TOAST_STYLE_DANGER);

}
function showToast(toastMessage, toastStyle) {
    var displayDuration = ((toastStyle == TOAST_STYLE_DANGER) || (toastStyle == TOAST_STYLE_WARNING)) ? 5000 : 2000;
    bootoast.toast({
        message: toastMessage,
        type: toastStyle
    });
}



function registerAppUserOnCLoud(user, providerName) {

    setItemOnLocalStorage(SESSION_VARIABLE_USER_UID, user.uid);
    setItemOnLocalStorage(SESSION_VARIABLE_USER_EMAIL, user.email);
    setItemOnLocalStorage(SESSION_VARIABLE_USER_DISPLAY_NAME, user.displayName);



    var registerAppUserFn = firebase.functions().httpsCallable('registerAppUserIfNeeded');
    //registerAppUserFn({ data: { text: "CustomDomain", provider: providerName, currentStatus: CURRENT_STATUS_ACTIVE }})
    registerAppUserFn({ data: { text: providerName } })
        .then((result) => {
            var userRole = result.data.role; // Read result of the Cloud Function.
            var userCompany = result.data.company; // Read result of the Cloud Function.
            setItemOnLocalStorage(SESSION_VARIABLE_USER_ROLE, userRole);


            if (userCompany == COMPANY_ICL_ADDIS && CURRENT_MODE_ADMIN == getItemFromLocalStorage(CURRENT_MODE)) {
                var category = (userRole == USER_ROLE_ICL_CHAT_TECHNICAL_STAFF) ? QUESTION_CATEGORY_TECHNICAL :
                    ((userRole == USER_ROLE_ICL_CHAT_CUSTOMER_SERVICE) ? QUESTION_CATEGORY_CUSTOMER_SERVICE : QUESTION_CATEGORY_BOTH);
                fetchQuestionsByCategory(category);
            } else {
                fetchQuestionsOfUser(user);
            }

        })
        .catch((error) => {
            fetchQuestionsOfUser(user);
            setItemOnLocalStorage(SESSION_VARIABLE_USER_ROLE, USER_ROLE_GUEST);
            var code = error.code;
            var message = error.message;
            var details = error.details;

            console.log('>>>> 4444 ' +
                '\ncode: ' + code +
                '\nmessage : ' + message +
                '\ndetails : ' + details);

        });
}


function setItemOnLocalStorage(key, value) {
    if (localStorage) {
        localStorage.setItem(key, value);
    } else {
        $.cookies.set(key, value);
    }
}

function getItemFromLocalStorage(key) {
    if (localStorage) {
        return localStorage.getItem(key);
    } else {
        return $.cookies.get(key);
    }
}




window.addEventListener('load', function () {

    $("#btnn_send_now ").click(function () {
        registerUpdateNotification();
    }); 

});
