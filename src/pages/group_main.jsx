import React from 'react';
import { f7, Page, Navbar, Icon, Popover, ListItem, Link, List, Fab, useStore, Button } from 'framework7-react';
import '../css/groups.css';
import { select_multiple_images } from '../js/image_utils';
import { deleteImage } from '../js/cloud_storage';
import store from '../js/store';
import { deleteGroupPicture, deleteNewsfeedPost } from '../js/firestore';

const GroupMainPage = (props) => {
    const groupData = useStore("openedGroup");
    const { f7router } = props;

    let imageForDeletion;
    const deleteConfirmation = () => {
        f7.dialog.confirm("Are you sure you want to delete this picture?", async function () {
            //Delete the image from the cloud storage
            deleteImage(imageForDeletion.url);
            //Delete the image from the firestore db
            deleteGroupPicture(imageForDeletion.imageId);
            //Delete the image post from the newsfeed
            deleteNewsfeedPost(imageForDeletion.imageId);
            //Delete the image from the local store
            const newListOfImg = groupData.pictures.filter((picture) => picture.imageId !== imageForDeletion.imageId);
            store.dispatch("setOpenedGroup", {
                ...store.getters.openedGroup.value,
                pictures: newListOfImg
            });
            f7.popover.close(".popover-delete", true);
        })
    }

    const navigateBack = () => {
        store.dispatch("resetOpenedGroup");
        f7.views.current.router.back();
    }

    let picturesCard;
    if (groupData.pictures) {
        picturesCard = groupData.pictures.map((picture, index) => {
            return (
                <ListItem key={index} mediaItem={true} className="imageItem">
                    <Link popoverOpen=".popover-delete">
                        <img className="groupImg" src={picture.url} alt="image" width="100%" popoveropen=".popover-delete" onClick={() => { imageForDeletion = picture }} />
                    </Link>
                </ListItem>
            )
        });
    }

    return (
        <Page>
            <Navbar>
                <Button slot="left" onClick={() => navigateBack()}>
                    <Icon material='keyboard_backspace' className="icons"></Icon>
                </Button>
                <h3 className="small-title" slot="title">{groupData.name}</h3>
            </Navbar>
            <List id="picsList" mediaList noHairlines noHairlinesBetween>
                {picturesCard}
            </List>
            <Popover className="popover-delete" closeByBackdropClick={true} closeByOutsideClick={true}>
                <List>
                    <ListItem title="Delete" onClick={() => { deleteConfirmation() }}></ListItem>
                </List>
            </Popover>
            <Fab position="right-bottom" slot="fixed" text="Add" onClick={() => { select_multiple_images(groupData)}}>
                <Icon ios="f7:plus" aurora="f7:plus" md="material:add"></Icon>
            </Fab>
        </Page>
    )
}

export default GroupMainPage;