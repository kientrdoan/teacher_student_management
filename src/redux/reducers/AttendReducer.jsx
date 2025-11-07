import { GET_ALL_ATTEND_BY_COURSE } from "../types/AttendType";
import { GET_DETAIL_TEACHER_BY_USER } from "../types/ProfileType";

const stateDefault = {
  attends: [],
};

export const AttendReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_ATTEND_BY_COURSE: {
      state.attends = action.attends;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};