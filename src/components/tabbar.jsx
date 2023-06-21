import React from 'react'
import { Toolbar, Link, Page, Tab } from "framework7-react";
import AccountPage from '../pages/account';
import NewsfeedPage from '../pages/newsfeed';
import GroupsListPage from '../pages/groups_list';

const Tabbar = () => {
    return (
        <Toolbar bottom tabbar labels className="toolbar" style={{backgroundColor: 'white'}}>
            <Link
                tabLink="#newsfeed"
                tabLinkActive
                text="Newsfeed"
                iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu">
            </Link>
            <Link
                tabLink="#groups"
                text="Groups"
                iconIos="f7:person_3_fill" iconAurora="f7:person_3_fill" iconMd="material:groups">
            </Link>
            <Link
                tabLink="#account"
                text="Account"
                iconIos="f7:person_crop_circle" iconAurora="f7:person_crop_circle" iconMd="material:account_circle">
            </Link>
        </Toolbar>
    )
}

const TabsView = () => {
    return(
    <Page tabs className='safe-areas' pageContent={false}>
        <Tabbar></Tabbar>
        <Tab id="newsfeed" tabActive><NewsfeedPage/></Tab>
        <Tab id="groups" name="groups"><GroupsListPage/></Tab>
        <Tab id="account" name="account"><AccountPage/></Tab>
     </Page>
    )
}

export {Tabbar, TabsView};