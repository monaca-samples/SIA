import { fbApp } from "./firebase-app";
import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    getAuth,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    indexedDBLocalPersistence,
    initializeAuth,
    onAuthStateChanged
} from 'firebase/auth';
import { f7 } from "framework7-react";
import store from "./store";
import { createNewUser, getLoggedInUser, unsubscribeListeners } from "./firestore";


export const isIos = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
    return false;
}

const getFirebaseAuth = () => {
    if (isIos()) {
        return initializeAuth(fbApp, {
            persistence: indexedDBLocalPersistence,
        });
    }
    return getAuth(fbApp);
}

//Initialize Firebase auth
const auth = getFirebaseAuth();

const handleError = function (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    f7.dialog.alert(errorMessage);
    console.log(errorCode);
}

const fb_signup = function (email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            f7.preloader.hide();
            f7.dialog.alert("Thank you, your account has been successfully created.");
            console.log("Successful sign up");
        })
        .catch((error) => {
            f7.preloader.hide();
            handleError(error);
        })
}

const fb_login = function (email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            f7.preloader.hide();
            console.log("Successful login");
        })
        .catch((error) => {
            f7.preloader.hide();
            handleError(error);
        })
}

const fb_signout = function () {
    signOut(auth)
        .then(() => {
            //Navigate back to the login screen 
            f7.views.current.router.navigate("/login/", {
                transition: "f7-fade",
                clearPreviousHistory: true
            });
            //Clear all the values for the signed in user since they signed out
            store.dispatch("resetUserInfo");
            store.dispatch("resetNewsfeed");
            unsubscribeListeners();
            console.log("Successful sign-out");
        })
        .catch((error) => {
            handleError(error);
        })
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (store.getters.user.value.username != "") {
            await createNewUser(user.uid, user.email).then(() => {
                console.log("username: " + store.getters.user.value.username);
                f7.views.current.router.navigate("/TabsView/", {
                    transition: "f7-dive",
                    clearPreviousHistory: true
                })
            })
        } else {
            await getLoggedInUser(user.uid, user.email).then(() => {
                f7.views.current.router.navigate("/TabsView/", {
                    transition: "f7-dive"
                })
            }
            );
        }
    }
});

const fb_change_password = function (oldPassword, newPassword) {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    //If the user provided the current password correctly, proceed with the modification of it
    reauthenticateWithCredential(user, credential)
        .then(() => {
            updatePassword(user, newPassword)
                .then(() => {
                    f7.dialog.alert("Password has changed successfully");
                    console.log("Successful password change");
                })
                .catch((error) => {
                    handleError(error);
                })
        })
        .catch((error) => {
            handleError(error);
        })
}

export { fb_signup, fb_login, fb_signout, fb_change_password };