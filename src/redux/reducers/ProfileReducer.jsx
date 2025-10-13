import { GET_DETAIL_TEACHER_BY_USER } from "../types/ProfileType";

const stateDefault = {
  teacher_detail: {},
};

export const ProfileReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_DETAIL_TEACHER_BY_USER: {
      state.teacher_detail = action.teacher_detail;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};