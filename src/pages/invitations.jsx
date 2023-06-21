import React from 'react';
import { Popup, Navbar, Card, Page, Link, Block, Row, Col, Button, useStore } from 'framework7-react';
import '../css/groups.css';
import store from '../js/store';
import { removeInvitation, joinGroup, createNewsfeedPost } from '../js/firestore';

const InvitationsPopup = (props) => {
    const classNameProp = props.className;
    const isOpened = props.opened;
    const onPopupClosed = props.onPopupClosed;

    const user = useStore('user');

    //Remove an invitation from the UI if the user accepts/rejects it 
    const removeInv = (index) => {
        const newInv = user.pending_invitations.filter((_, i) => i != index);
        store.dispatch("setUserInfo", {
            ...store.getters.user.value,
            pending_invitations: newInv
        })
        removeInvitation(user.pending_invitations[index].groupId);
    }

    let invitationsList;
    if (user.pending_invitations.length > 0) {
        invitationsList = user.pending_invitations.map((invitation, index) => {
            return (
                <Card key={index} className="groupCard">
                    <Row noGap>
                        <Col width="20" medium="10">
                            <img src={invitation.group_picture ? invitation.group_picture : "../assets/no-image-icon-15.png"}
                                alt="Group image" width="50" height="50" />
                        </Col>
                        <Col width="80" medium="90" className="pd-10">
                            <Row>
                                <Block className="invitation">{invitation.invitee} invited you to join group {invitation.name}</Block>
                            </Row>
                            <Row>
                                <Col width="33" medium="20"><Button type="button" id="acceptBtn" className="invBtn" outline
                                    onClick={() => {
                                        removeInv(index);
                                        joinGroup(invitation);
                                        createNewsfeedPost("new_user",invitation, undefined, undefined);
                                    }}>Accept</Button></Col>
                                <Col width="33" medium="20"><Button type="button" className="invBtn" outline
                                    onClick={() => removeInv(index)}>Reject</Button></Col>
                                <Col width="33" medium="60"></Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            )
        })
    } else {
        invitationsList =  <Block id="empty">Nothing to see here</Block>
    }

    return (
        <Popup className={classNameProp} opened={isOpened} onPopupClosed={onPopupClosed}>
            <Page>
                <Navbar>
                    <h3 className="small-title" slot="title">Invitations</h3>
                    <Link popupClose slot="right">Close</Link>
                </Navbar>
                <div id="invitationsDiv">
                    {invitationsList}
                </div>
            </Page>
        </Popup>
    )
}

export default InvitationsPopup;