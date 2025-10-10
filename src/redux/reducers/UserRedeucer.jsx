import { LOGIN_ACTION } from "../types/UserType";

const stateDefault = {
  user: {},
  user_detail: {},
};

export const UserReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case LOGIN_ACTION: {
      state.user = action.user;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};