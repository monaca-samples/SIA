import React, { useState } from 'react';
import { f7, Page, LoginScreenTitle, List, ListInput, Button, BlockTitle, Icon, BlockFooter, Link} from 'framework7-react';
import { fb_login } from '../js/auth.js';
import "../css/authorization.css";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = () => {
        f7.preloader.show();
        fb_login(email, password);
    }

    return (
        <Page noToolbar noNavbar noSwipeback loginScreen class="authPage">
            <LoginScreenTitle id="appname">SIA</LoginScreenTitle>
            <BlockTitle>Share Life's Best Moments Instantly</BlockTitle>
            <List form>
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
            <Button className = "authBtn" large fill onClick={() => {login()}}>Login</Button>
            <BlockFooter>Don't have an account? Then <Link  text = "SIGN UP" onClick={() => {f7.views.current.router.navigate('/signup/', {transition: "f7-dive"})}}></Link></BlockFooter>
        </Page>
    )
}

export default LoginPage;