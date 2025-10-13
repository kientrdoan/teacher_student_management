import { GET_ALL_SEMESTER } from "../types/SemesterType";

const stateDefault = {
  semesters: [],
};

export const SemesterReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_SEMESTER: {
      state.semesters = action.semesters;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};