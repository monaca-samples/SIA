import React, { useState } from 'react';
import { f7, Page, Icon, Navbar, Card, Block, Link, Row, Col, useStore, Button } from 'framework7-react';
import InvitationsPopup from './invitations';
import CreateGroupPopup from './create_group';
import "../css/groups.css";
import store from '../js/store';
import { listGroupImages } from '../js/cloud_storage';

const GroupsListPage = () => {

    const [invPopupOpened, setInvPopupOpened] = useState(false);
    const [addPopupOpened, setAddPopupOpened] = useState(false);

    const user = useStore('user');

    const setOpenedGroup = function (group, index) {
        listGroupImages(group.groupId).then((imagesData) => {
            store.dispatch("setOpenedGroup", {
                groupId: group.groupId,
                name: group.name,
                pictures: imagesData
            });
            f7.views.current.router.navigate("/groups/" + index + "/");
        }).catch(error => console.log("Error: " + error.code + " " + error.message));
    }

    let groupsList;
    if (user.groups) {
        groupsList = user.groups.map((group, index) => {
            return (
                <Link key={index} onClick={() => { setOpenedGroup(group, index) }} style={{ display: "block" }}>
                    <Card padding="10px" className="groupCard">
                        <Row>
                            <Col width="15" medium="5">
                                <img src={group.group_picture ? group.group_picture : "../assets/no-image-icon-15.png"}
                                    alt="Group image" width="50" height="50" />
                            </Col>
                            <Col width="85" medium="95">
                                <Block className="groupName">{group.name}</Block>
                                <Block className="groupDesc">{group.description}</Block>
                            </Col>
                        </Row>
                    </Card>
                </Link>
            )
        })
    }

    return (
        <Page noSwipeback>
            <Navbar>
                <Button slot="left" popupOpen=".invitations_popup">
                    <Icon material="notifications_outlined" className="icons"></Icon>
                </Button>
                <h3 className="navbarTitle" slot="title"> Groups </h3>
                <Button slot="right" popupOpen=".create_group_popup">
                    <Icon material="add" className="icons"></Icon>
                </Button>
            </Navbar>
            <div>
                {groupsList}
            </div>
            <InvitationsPopup className="invitations_popup" opened={invPopupOpened} onPopupClosed={() => setInvPopupOpened(false)}>
            </InvitationsPopup>
            <CreateGroupPopup className="create_group_popup" opened={addPopupOpened} onPopupClosed={() => setAddPopupOpened(false)}>
            </CreateGroupPopup>
        </Page>
    )
}

export default GroupsListPage;