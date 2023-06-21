import { createStore } from 'framework7/lite';

const store = createStore({
  state: {
    user: {
      uid: "",
      email: "",
      username: "",
      profile_picture: "",
      groups: [],
      pending_invitations: []
    },
    openedGroup: {
      groupId: "",
      name: "",
      pictures: []
    },
    newsfeed: []
  },
  getters: {
    user({ state }) {
      return state.user;
    },
    openedGroup({ state }) {
      return state.openedGroup;
    },
    newsfeed({ state }) {
      return state.newsfeed;
    }
  },
  actions: {
    setUserInfo({ state }, { uid, email, username, profile_picture, groups, pending_invitations }) {
      state.user = {
        uid: uid,
        email: email,
        username: username,
        profile_picture: profile_picture,
        groups: groups,
        pending_invitations: pending_invitations
      }
    },
    resetUserInfo({ state }) {
      state.user = {
        uid: "",
        email: "",
        username: "",
        profile_picture: "",
        groups: [],
        pending_invitations: []
      }
    },
    setOpenedGroup({ state }, { groupId, name, pictures }) {
      state.openedGroup = {
        groupId: groupId,
        name: name,
        pictures: pictures
      }
    },
    resetOpenedGroup({ state }) {
      state.openedGroup = {
        groupId: "",
        name: "",
        pictures: []
      }
    },
    setNewsfeed({ state }, {newsfeed}){
      state.newsfeed = newsfeed
    },
    resetNewsfeed({ state }){
      state.newsfeed = []
    }
  },
})
export default store;
