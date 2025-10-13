import { LOGIN_ACTION } from "../types/UserType";

const stateDefault = {
  access_token: "",
  refresh_token: "",
  user: {},
};

export const UserReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case LOGIN_ACTION: {
      state.access_token = action.access_token;
      state.user = action.user;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};