/*Utilities for selecting one image for profile picture, multiple images for upload and reverting the changes made */
import { f7 } from "framework7-react";
import store from "./store";
import { createUserProfileImg, createGroupPicture, updateNewsfeedProfile } from "./firestore";

const select_image = function (hideElemId, showElemId, setImg, typeOfImg) {

    if (window.cordova) {
        const options = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            targetHeight: 140,
            targetWidth: 140,
            quality: 100
        }

        navigator.camera.getPicture(onSuccess, onError, options);
    }

    function onSuccess(data) {
        if (typeOfImg === "group_profile") {
            const elemToHide = document.querySelector(hideElemId);
            const elemToShow = document.querySelector(showElemId);
            if (!elemToHide.classList.contains("hidden"))
                elemToHide.classList.add("hidden");
            setImg("data:image/jpeg;base64, " + data);
            if (elemToShow.classList.contains("hidden"))
                elemToShow.classList.remove("hidden");
        } else if (typeOfImg === "user_profile") {
            store.dispatch("setUserInfo", {
                ...store.getters.user.value,
                profile_picture: "data:image/jpeg;base64, " + data
            });
            //Create the new profile image and change it on the newsfeed posts as well
            createUserProfileImg(data).then(() => updateNewsfeedProfile());
        }
    }

    function onError(message) {
        alert("Error " + message)
    }
}

const select_multiple_images = function (group) {
    const currGroup = store.getters.openedGroup.value;

    imagePicker.getPictures(
        function onSuccess(results) {
            const selectedImgs = [];
            results.map((imageData, index) => {
                //Create a document in the collection "pictures" for every selected picture and then upload it in the storage
                createGroupPicture(imageData, group)
                    .then((imgId) => {
                        const newPic = {
                            imageId: imgId,
                            url: "data:image/jpeg;base64, " + imageData
                        }
                        //Push every selected picture in the arrays
                        selectedImgs.push(newPic); //for the app store 
                    })
                    .then(() => {
                        //Update the current opened group in store with the pictures selected by the user
                        const newListOfImgs = currGroup.pictures.concat(selectedImgs);
                        store.dispatch("setOpenedGroup", {
                            ...currGroup,
                            pictures: newListOfImgs
                        });
                    });
            });

        },
        function onError(error) {
            console.log("Error: " + error);
            f7.dialog.alert("There was a problem uploading the images.");
        },
        {
            maximumImagesCount: 10,
            title: "Select pictures",
            message: "Pick maximum 10 items",
            quality: 100,
            // height: 200,
            // width: 300,
            outputType: imagePicker.OutputType.BASE64_STRING
        });
}

const revert = function (elemToHideId, elemToShowId) {
    const elemToHide = document.querySelector(elemToHideId);
    const elemToShow = document.querySelector(elemToShowId);
    elemToHide.classList.add("hidden");
    elemToShow.classList.remove("hidden");
}

export { select_image, revert, select_multiple_images };

