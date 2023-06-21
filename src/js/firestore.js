import { fbApp } from "./firebase-app";
import { doc, getFirestore, setDoc, getDoc, collection, updateDoc, getDocs, addDoc, deleteDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import store from "./store";
import { uploadImage, downloadImage } from "./cloud_storage";

//Initialize Cloud Firestore
const db = getFirestore(fbApp);
let invitationsListener, groupsListener, newsfeedListeners = [];

//Users functions
const createNewUser = async function (userId, email) {
    const username = store.getters.user.value.username;
    try {
        const docRef = await setDoc(doc(db, "users", userId), {
            uid: userId,
            username: username,
            email: email
        }).then(
            store.dispatch("setUserInfo", {
                ...store.getters.user.value,
                uid: userId,
                email: email,
                profile_picture: "",
                groups: [],
                pending_invitations: []
            })
        )
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

const getLoggedInUser = async function (userId, email) {
    try {
        const docRef = doc(db, "users", userId);
        //Get all the groups the user is a member of
        let userGroups = new Array();
        await getUserGroups(docRef)
            .then(async (groupsSnap) => {
                const imagesPromises = groupsSnap.docs.map(doc => downloadImage(doc.get("group_picture")));
                const imagesData = await Promise.all(imagesPromises);
                groupsSnap.docs.forEach((doc, index) => {
                    userGroups.push({
                        groupId: doc.get("groupId"),
                        name: doc.get("name"),
                        description: doc.get("description"),
                        group_picture: imagesData[index]
                    });
                });
            });

        //Get the rest of the information about the logged in user
        await getDoc(docRef)
            .then(
                async (user) => {
                    //Get the profile picture of the user
                    const profile = await downloadImage(user.get("profile_picture"));
                    store.dispatch("setUserInfo", {
                        uid: userId,
                        username: user.get("username"),
                        email: email,
                        profile_picture: profile,
                        groups: userGroups,
                        pending_invitations: []
                    });
                });
        await setInvitationsListener(userId);
        loadPosts();
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

const updateUsername = function (username) {
    const userRef = doc(db, "users", store.getters.user.value.uid);
    try {
        updateDoc(userRef, {
            username: username
        });
    } catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

const getAllUsers = async function () {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        return usersSnap;
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

//Group functions
const createGroup = async function (name, description, imageData, invited) {
    const currUser = store.getters.user.value;
    let groupId;

    //Create the new document for the new group in the subcollection "groups" and the new image for the group picture
    const grpCollectionRef = collection(doc(collection(db, "users"), currUser.uid), "groups");
    await addDoc(grpCollectionRef, {
        name: name,
        description: description
    }).then((doc) => {
        groupId = doc.id;
        updateDoc(doc, {
            groupId: groupId,
            group_picture: imageData !== "" ? "groups_profile_pictures/" + groupId : ""
        });
        uploadImage(imageData, "group_profile", groupId, undefined); //No need for group id since it's a group profile
    }).catch(error => console.log("Error: " + error.code + " " + error.message));

    // Update the groups in the store
    let tmp = currUser.groups ? currUser.groups : new Array(1);
    tmp.push({
        groupId: groupId,
        name: name,
        description: description,
        group_picture: imageData
    });
    console.log("Temp array: " + tmp);
    store.dispatch("setUserInfo", {
        ...currUser,
        groups: tmp
    });

    // Add the new group as invitation to the invited users
    invited.forEach((invitedUser) => {
        const invCollectionRef = collection(doc(collection(db, "users"), invitedUser.uid), "pending_invitations");
        addDoc(invCollectionRef, {
            groupId: groupId,
            name: name,
            description: description,
            group_picture: imageData !== "" ? "groups_profile_pictures/" + groupId : "",
            invitee: currUser.username,
        }).then((doc) => {
            updateDoc(doc, {
                inviteId: doc.id
            });
        }).catch(error => console.log("Error: " + error.code + " " + error.message));
    });
}

const getUserGroups = async function (docRef) {
    const groupsRef = collection(docRef, "groups");
    try {
        const groupsSnapshot = await getDocs(groupsRef);
        return groupsSnapshot;
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

//Invitations functions
const getUserInvites = async function (docRef) {
    const invitesRef = collection(docRef, "pending_invitations");
    try {
        const invitesSnapshot = await getDocs(invitesRef);
        return invitesSnapshot;
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

const removeInvitation = async function (groupId) {
    const invCollectionRef = collection(doc(collection(db, "users"), store.getters.user.value.uid), "pending_invitations");
    const q = query(invCollectionRef, where("groupId", "==", groupId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => deleteDoc(doc.ref).catch(error => console.log("Error: " + error.code + " " + error.message)));
}

const joinGroup = function (groupData) {
    const currUser = store.getters.user.value;
    const groupObj = {
        groupId: groupData.groupId,
        name: groupData.name,
        description: groupData.description,
        group_picture: groupData.group_picture
    }

    //Add the group in the list of groups the user is member of
    const groupsCollectionRef = collection(doc(collection(db, "users"), currUser.uid), "groups");
    const groupRef = doc(db, groupsCollectionRef.path, groupData.groupId);
    setDoc(groupRef, groupObj).catch(error => console.log("Error: " + error.code + " " + error.message));
    //Update the store value
    let newGroupsList = currUser.groups ? currUser.groups : new Array(1);
    newGroupsList.push(groupObj);
    store.dispatch("setUserInfo", {
        ...currUser,
        groups: newGroupsList
    });
}

const setInvitationsListener = async function (uid) {
    invitationsListener = onSnapshot(collection(doc(collection(db, "users"), uid), "pending_invitations"), (snapshot) => {
        const currUser = store.getters.user.value;
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
                const profile = await downloadImage(change.doc.get("group_picture"));
                const newInv = {
                    inviteId: change.doc.get("inviteId"),
                    invitee: change.doc.get("invitee"),
                    name: change.doc.get("name"),
                    groupId: change.doc.get("groupId"),
                    description: change.doc.get("description"),
                    group_picture: profile
                }
                const listOfInv = currUser.pending_invitations;
                listOfInv.push(newInv);
                store.dispatch("setUserInfo", {
                    ...currUser,
                    pending_invitations: listOfInv
                });
            }
        });
    });
}

//Image functions
const createUserProfileImg = async function (imgUrl) {
    const currUserId = store.getters.user.value.uid;
    const userRef = doc(db, "users", currUserId);
    //Set the profile picture for the user
    try {
        updateDoc(userRef, {
            profile_picture: "users_profile_pictures/" + currUserId
        });
        uploadImage(imgUrl, "user_profile", currUserId, undefined); //No need for group id since it's a user profile
    } catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

const createGroupPicture = async function (imgUrl, group) {
    const currUser = store.getters.user.value;
    let imgId;
    try {
        await addDoc(collection(db, "pictures"), {
            groupId: group.groupId,
            creator: {
                uid: currUser.uid,
                username: currUser.username,
            },
            timestamp: serverTimestamp()
        }).then(async (doc) => {
            imgId = doc.id;
            await updateDoc(doc, {
                imageId: imgId,
                location: group.groupId + "/" + imgId
            });
            uploadImage(imgUrl, "group_picture", imgId, group);
        });
    } catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
    return imgId;
}

const deleteGroupPicture = function (imageId) {
    console.log("id of image for deletion: " + imageId);
    deleteDoc(doc(db, "pictures", imageId)).catch(error => console.log("Error: " + error.code + " " + error.message));
}

//Newsfeed functions
const createNewsfeedPost = function (type, group, pictures, pictureId) {
    const currUser = store.getters.user.value;
    addDoc(collection(db, "newsfeed"), {
        type: type,
        user:
        {
            uid: currUser.uid,
            username: currUser.username,
            profile_picture: currUser.profile_picture
        },
        groupId: group.groupId,
        groupName: group.name,
        pictureId: pictureId ? pictureId : "",
        pictures: pictures ? pictures : "",
        timestamp: new Date()
    })
        .catch(error => console.log("Error: " + error.code + " " + error.message));
}

const loadPosts = function () {
    const currUser = store.getters.user.value;

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); //yesterday

    const newsfeedRef = collection(db, "newsfeed");
    groupsListener = onSnapshot(collection(doc(collection(db, "users"), currUser.uid), "groups"), (snapshot) => {
        let groupIds = currUser.groups.map(group => group.groupId);
        snapshot.docChanges().forEach((change) => {
            groupIds.push(change.doc.get("groupId"));
        });
        while (groupIds.length) {
            const slice = groupIds.splice(0, 10);
            const q = query(newsfeedRef,
                where("groupId", "in", slice),
                where("timestamp", ">=", startDate),
                orderBy("timestamp", "desc"));
            const newsfeedListener = onSnapshot(q, (querySnapshot) => {
                let newPostsList = [];
                querySnapshot.docs.forEach((doc) => {
                    newPostsList.push(doc.data());
                });
                store.dispatch("setNewsfeed", {
                    newsfeed: newPostsList
                });
            });
            newsfeedListeners.push(newsfeedListener);
        }
    });
}

const updateNewsfeedUsername = async function (username) {
    const currUser = store.getters.user.value;
    const newsfeedRef = collection(db, "newsfeed");
    const endDate = new Date(); //today
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); //yesterday

    const q = query(newsfeedRef,
        where("user.uid", "==", currUser.uid),
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate));

    const querySnapshot = await getDocs(q).catch(error => console.log("Error: " + error.code + " " + error));
    querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
            "user.username": username
        });
    });
}

const updateNewsfeedProfile = async function () {
    const currUser = store.getters.user.value;
    const newsfeedRef = collection(db, "newsfeed");
    const endDate = new Date(); //today
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); //yesterday

    const q = query(newsfeedRef,
        where("user.uid", "==", currUser.uid),
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate));

    const querySnapshot = await getDocs(q);
    const profileUrl = await downloadImage("users_profile_pictures/" + currUser.uid).catch(error => console.log("Error: " + error.code + " " + error.message));
    querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
            "user.profile_picture": profileUrl
        });
    });
}

const deleteNewsfeedPost = function (imageId) {
    const newsfeedRef = collection(db, "newsfeed");
    const q = query(newsfeedRef, where("pictureId", "==", imageId));
    getDocs(q)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => deleteDoc(doc.ref).catch(error => console.log("Error: " + error.code + " " + error.message)));
        })
        .catch(error => console.log("Error: " + error.code + " " + error.message));
}

const unsubscribeListeners = function () {
    groupsListener();
    invitationsListener();
    for (let i = 0; i < newsfeedListeners.length; i++) {
        newsfeedListeners[i]();
    }
}

export {
    db,
    createNewUser,
    getLoggedInUser,
    updateUsername,
    getAllUsers,
    createGroup,
    removeInvitation,
    joinGroup,
    createUserProfileImg,
    createGroupPicture,
    getUserInvites,
    createNewsfeedPost,
    updateNewsfeedUsername,
    updateNewsfeedProfile,
    deleteGroupPicture,
    deleteNewsfeedPost,
    unsubscribeListeners
};