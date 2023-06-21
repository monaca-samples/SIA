import React from "react";
import { Page, Navbar, Card, CardContent, List, Block, Row, Col, useStore, ListItem } from "framework7-react";
import '../css/newsfeed.css';

const NewsfeedPage = () => {
    const newsfeedData = useStore("newsfeed");

    const newList = newsfeedData.map((data, dataIndex) => {
        if (data.type === "new_user") {
            return (
                <Card key={dataIndex} className="groupCard">
                    <List>
                        <ListItem >
                            <img className="circleImg" slot="media" src={data.user.profile_picture ? data.user.profile_picture : '../assets/blank_profile_picture.png'} alt="user profile" width="60px" height="60px"></img>
                            <Block className="newUsrDesc">{data.user.username} joined group "{data.groupName}"</Block>
                        </ListItem>
                    </List>
                </Card>
            )
        } else if (data.type === "new_images") {
            return (
                <Card key={dataIndex} className="groupCard">
                    <div>
                        <Row noGap>
                            <Col width="20" medium="10">
                                <img className="circleImg" src={data.user.profile_picture ? data.user.profile_picture : '../assets/blank_profile_picture.png'} alt="User profile" width="60px" height="60px" />
                            </Col>
                            <Col className="headerCol2" width="80" medium="90">
                                <div className="headerDiv">
                                    <Block className="username">{data.user.username}</Block>
                                    <Block className="desc">Uploaded an image in the group {data.groupName}</Block>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <CardContent padding={false}>
                        <Row>
                            <Col small="80" medium="30" className="center">
                                <img className="center" src={data.pictures} alt="Image" height="230px"></img>
                            </Col>
                        </Row>

                    </CardContent>
                </Card>
            )
        }
    })


    return (
        <Page noSwipeback>
            <Navbar>
                <h3 className="navbarTitle" slot="title">SIA</h3>
            </Navbar>
            <div>
                {newList}
            </div>
        </Page>
    )
}

export default NewsfeedPage;