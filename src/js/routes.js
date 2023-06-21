import LoginPage from '../pages/login.jsx';
import SignupPage from '../pages/signup.jsx';
import NewsfeedPage from '../pages/newsfeed.jsx';
import GroupsListPage from '../pages/groups_list.jsx';
import GroupMainPage from '../pages/group_main.jsx';
import AccountPage from '../pages/account.jsx';
import { TabsView } from '../components/tabbar.jsx';


var routes = [
  {
    path: '/TabsView/',
    component: TabsView
  },
  {
    path: '/newsfeed/',
    component: NewsfeedPage
  },
  {
    path: '/groups/',
    component: GroupsListPage
  },
  {
    path: '/account/',
    component: AccountPage
  },
  {
    path: '/groups/:index/',
    component: GroupMainPage
  },
  {
    path: '/login/',
    component: LoginPage
  },
  {
    path: '/signup/',
    component: SignupPage
  }
 
];

export default routes;
