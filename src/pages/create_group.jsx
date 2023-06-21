import React, { useState, useEffect } from 'react';
import { f7, Popup, Page, Navbar, Link, Icon, Block, List, ListInput, Searchbar, Toolbar, Button, ListItem } from 'framework7-react';
import '../css/groups.css';
import { select_image, revert } from '../js/image_utils';
import { getAllUsers, createGroup } from '../js/firestore';
import store from '../js/store';

const CreateGroupPopup = (props) => {
    const classNameProp = props.className;
    const isOpened = props.opened;
    const onPopupClosed = props.onPopupClosed;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [img, setImg] = useState();

    //Get all the users of the app
    const [users, setUsers] = useState([]);
    let usersTmp = [];
    let inviteStrArr = [];
    useEffect(async () => {
        await getAllUsers().then((snap) =>
            snap.forEach((doc) => {
                inviteStrArr.push("Invite");
                if (doc.data().uid != store.getters.user.value.uid)
                    usersTmp.push(doc.data());
                setUsers(users.concat(usersTmp));
            }
            ));
    }, []);

    const [inviteStr, setInviteStr] = useState(inviteStrArr);
    const revertInv = () => {
        let cleanArr = [...inviteStr];
        cleanArr.fill("Invite");
        setInviteStr(cleanArr);
    }
    const usersListItems = users.map((user, index) => {
        const changeStr = () => {
            let tmpArr = [...inviteStr];
            inviteStr[index] === "Invite" ? tmpArr[index] = "Remove" : tmpArr[index] = "Invite";
            setInviteStr(tmpArr);
        }

        return (
            <ListItem key={index} title={user.username} className="listItem">
                <Button slot="after" className="createGroupBtns"
                    onClick={() => changeStr()}>{inviteStr[index]}</Button>
                <img slot="media" src="../assets/blank_profile_picture.png" width="30px" height="30px"></img>
            </ListItem>
        )
    })

    const closePopup = () => {
        setImg();
        revert("#afterImg", "#beforeImg");
        setName('');
        setDescription('');
        f7.searchbar.disable("#search");
        revertInv();
        f7.popup.close("." + classNameProp, true);
    }

    const getInvitedPeople = () => {
        let invited = [];
        inviteStr.forEach((str, index) => {
            if (str === "Remove") 
                invited.push(users[index]);
        })
        return invited;
    }

    const createGroupDialog = () => {
        if (!!name && name.trim().length) {
            f7.dialog.confirm("Proceed with the creation of the group " + name + "?", function () {
                const invited = getInvitedPeople();
                const image = img ? img : "";
                createGroup(name, description, image, invited);
                closePopup();
            });
        }
        else f7.dialog.alert("You must provide a name for the group.");
    }

    return (
        <Popup className={classNameProp} opened={isOpened} onPopupClosed={onPopupClosed}>
            <Page id="popupPage">
                <Navbar>
                    <h3 slot="title" className="small-title">Create New Group</h3>
                    <Link popupClose slot="right">Close</Link>
                </Navbar>
                <Block inset>
                    <div id="beforeImg" className="imgDiv">
                        <Link id="cameraLink" onClick={() => { select_image("#beforeImg", "#afterImg", setImg, "group_profile") }}>
                            <Icon id="cameraIcon" f7="camera" slot="media"></Icon>
                        </Link>
                    </div>
                    <div id="afterImg" className="imgDiv hidden">
                        <img id="groupProf" height="140px" width="140px" alt="group profile" src={img} onClick={() => { select_image("#beforeImg", "#afterImg", setImg, "group_profile") }}></img>
                    </div>
                </Block>
                <List form noHairlines id="infoList" >
                    <ListInput
                        className="item-inner-grp"
                        label="Name of group:"
                        type="text"
                        placeholder="Your group's name"
                        value={name}
                        onInput={(e) => {
                            setName(e.target.value);
                        }}
                        outline
                        validate
                        clearButton>
                    </ListInput>
                    <ListInput
                        className="item-inner-grp"
                        label="Description:"
                        type="text"
                        placeholder="What is this group about?"
                        value={description}
                        onInput={(e) => {
                            setDescription(e.target.value)
                        }}
                        resizable
                        outline
                        clearButton>
                    </ListInput>
                    <Searchbar
                        init
                        form={false}
                        backdrop={false}
                        disableButton
                        clearButton
                        noHairline
                        noShadow
                        searchContainer=".search-list"
                        searchIn='.item-title'
                        placeholder='Search for users'
                        id="search"
                    >
                    </Searchbar>
                </List>
                <List className="searchbar-not-found" inset>
                    <ListItem title="User not found"></ListItem>
                </List>
                <List className="search-list searchbar-found" inset>
                    {usersListItems}
                </List>
                <Toolbar id="grpToolbar" bottom noShadow noHairline>
                    <Button style={{ position: "absolute", right: 0, color: "#61AEF5" }} onClick={() => createGroupDialog()}>Create Group</Button>
                </Toolbar>
            </Page>
        </Popup>
    )
}

export default CreateGroupPopup;