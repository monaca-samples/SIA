import React, { useState } from 'react';
import { f7, Page, LoginScreenTitle, BlockTitle, List, ListInput, Icon, Button, BlockFooter, Link } from 'framework7-react';
import '../css/authorization.css';
import { fb_signup } from '../js/auth.js';
import store from '../js/store';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signup = () => {
        f7.preloader.show();
        store.dispatch("setUserInfo", {username: username});
        fb_signup(email, password);
    }

    return (
        <Page noToolbar noNavbar noSwipeback loginScreen class="authPage">
            <LoginScreenTitle id="appname">SIA</LoginScreenTitle>
            <BlockTitle>Share Life's Best Moments Instantly</BlockTitle>
            <List form>
                <ListInput
                    className="item-inner-auth"
                    type = "text"
                    placeholder='Unique username'
                    value={username}
                    onInput={(e) => {
                        setUsername(e.target.value);
                    }}
                >
                    <Icon className="icons" material="person_outlined" slot="media"></Icon>
                </ListInput>
                <ListInput
                    className="item-inner-auth"
                    type="text"
                    placeholder="Email"
                    value={email}
                    onInput={(e) => {
                        setEmail(e.target.value);
                    }}
                >
                    <Icon className="icons" material="mail_outlined" slot="media" />
                </ListInput>
                <ListInput
                    className="item-inner-auth"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onInput={(e) => {
                        setPassword(e.target.value);
                    }}
                >
                    <Icon className="icons" material="lock_outlined" slot="media" />
                </ListInput>
            </List>
            <Button className="authBtn" large fill onClick={() => {signup()}}>SIGN UP</Button>
            <BlockFooter>Already have an account? Then <Link  text = "LOGIN" onClick={() => {f7.views.current.router.navigate('/login/', {transition: "f7-dive"})}}></Link></BlockFooter>
        </Page>
    )
}

export default SignupPage;