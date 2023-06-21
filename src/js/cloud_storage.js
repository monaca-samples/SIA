import { getStorage, ref, uploadString, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { fbApp } from "./firebase-app";
import { createNewsfeedPost } from "./firestore";

//Initialize cloud storage
const storage = getStorage(fbApp);

const uploadImage = function (imageUrl, typeOfImage, imageId, group) {
    if (imageUrl) {
        let imgRef;
        if (typeOfImage === "group_profile")
            imgRef = ref(storage, "groups_profile_pictures/" + imageId);
        else if (typeOfImage === "user_profile")
            imgRef = ref(storage, "users_profile_pictures/" + imageId);
        else if (typeOfImage === "group_picture")
            imgRef = ref(storage, group.groupId + "/" + imageId);

        let dataUrl = imageUrl;
        if (typeOfImage !== "group_profile")
            dataUrl = "data:image/jpeg;base64, " + imageUrl;
        const uploadTask = uploadString(imgRef, dataUrl, 'data_url')
            .then(async (uploadResult) => {
                if (typeOfImage === "group_picture") {
                    const imgUrl = await downloadImage(uploadResult.ref.fullPath);
                    createNewsfeedPost("new_images", group, imgUrl, imageId);
                }
            });
    }
}

const downloadImage = async function (path) {
    let imageUrl = "";
    if (path) {
        const pathRef = ref(storage, path);
        imageUrl = await getDownloadURL(pathRef).catch(
            (error) => {
                console.log("Error: " + error.code + " " + error.message);
                // f7.dialog.alert("Error: " + error.code + " " + error.message);
            })
    }
    return imageUrl;
}

const listGroupImages = async function (groupId) {
    const groupRef = ref(storage, groupId + "/");
    let imagesData;
    const imagesObj = [];
    await listAll(groupRef).then(async (results) => {
        //Download all the images from the respective group
        const imagesPromises = results.items.map(item => downloadImage(item.fullPath));
        //Wait for the downloading of all the images to finish and then construct an array of objects
        imagesData = await Promise.all(imagesPromises).then((imagesData) => {
            imagesData.forEach((imageData, index) => {
                imagesObj.push({
                    imageId: results.items[index].name,
                    url: imageData
                })
            });
        });
    }).catch((error) => {
        console.log("Error: " + error.code + " " + error.message);
    });
    return imagesObj;
}

const deleteImage = function (path) {
    const imageRef = ref(storage, path);
    deleteObject(imageRef).catch(error => console.log("Error: " + error.code + " " + error.message));
}


export { uploadImage, downloadImage, listGroupImages, deleteImage };