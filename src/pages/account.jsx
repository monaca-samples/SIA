import React from 'react';
import { f7, Link, Page, Row, Col, Block, ListItem, List, useStore } from 'framework7-react';
import '../css/account.css';
import { select_image } from '../js/image_utils';
import { fb_change_password, fb_signout } from '../js/auth.js';
import store from '../js/store';
import { updateUsername, updateNewsfeedUsername } from '../js/firestore';

const AccountPage = () => {
    //Get the currently logged in user and subscribe to its changes
    const user = useStore('user');

    const changeUsernameDialog = () => {
        f7.dialog.prompt('Change username', function (newUsername) {
            if (newUsername) {
                f7.dialog.confirm('Your new username will be ' + newUsername + '. Proceed?', () => {
                    //Update username in firestore
                    updateUsername(newUsername);
                    //Update username for all newsfeed posts of the user
                    updateNewsfeedUsername(newUsername);
                    //Update username in local store
                    store.dispatch("setUserInfo", {
                        ...store.getters.user.value,
                        username: newUsername
                    });
                });
            } else {
                f7.dialog.alert('Username cannot be empty, please try again.');
            }
        });
    };

    const changePasswordDialog = () => {
        f7.dialog.create({
            closeByBackdropClick: true,
            text: "Change password",
            content: "<div class=\"dialog-input-field input\">" +
                "   <input id=\"oldPass\" type=\"password\" class=\"dialog-input\" placeholder=\"Old password\" autofocus/>" +
                "   <input id=\"newPass\" type=\"password\" class=\"dialog-input\" placeholder=\"New password\"/>" +
                "   <input id=\"newPass2\" type=\"password\" class=\"dialog-input\" placeholder=\"New password again\"/>" +
                "</div>",
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: "OK",
                    bold: true,
                    onClick: () => {
                        const oldPass = document.querySelector("#oldPass").value;
                        const newPass = document.querySelector("#newPass").value;
                        const newPass2 = document.querySelector("#newPass2").value;
                        if (oldPass && newPass && newPass2) {
                            if (newPass === newPass2)
                                f7.dialog.confirm('Are you sure you want to change your password?', () => {
                                    fb_change_password(oldPass, newPass);
                                });
                            else f7.dialog.alert("There is no match between the new password provided.");
                        } else {
                            f7.dialog.alert("All fields must be completed before continuing, please try again.");
                        }
                    }
                }
            ]
        }).open(true);
    };

    return (
        <Page pageContent={false} noSwipeback>
            <Block id="details">
                <Row id="info">
                    <Col width="30" medium="10">
                        <div id="oldProf">
                            <img className="circleImg" src={user.profile_picture ? user.profile_picture : "../assets/blank_profile_picture.png"} alt="user profile" width="80px" height="80px" onClick={() => { select_image("#oldProf", "#newProf", null, "user_profile") }} />
                        </div>
                    </Col>
                    <Col width="70" medium="90">
                        <h2 id="username">{user.username}</h2>
                        <p id="descr">You are a member in {user.groups ? user.groups.length : 0} {user.groups.length > 1 ? "groups" : "group"}</p>
                    </Col>
                </Row>
                <List simpleList>
                    <ListItem>
                        <div className="settings">
                            <Link onClick={() => { changeUsernameDialog() }}>Change username</Link>
                        </div>
                    </ListItem>
                    <ListItem >
                        <div className="settings">
                            <Link onClick={() => { changePasswordDialog() }}>Change password</Link>
                        </div>
                    </ListItem>
                    <ListItem >
                        <div className="settings">
                            <Link onClick={() => { fb_signout() }}>Sign Out</Link>
                        </div>
                    </ListItem>
                </List>
            </Block>
        </Page>
    )
}

export default AccountPage;