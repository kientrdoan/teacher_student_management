import { GET_ALL_SEMESTER, GET_CURRENT_SEMESTER } from "../types/SemesterType";

const stateDefault = {
  semesters: [],
  semester_detail: {}
};

export const SemesterReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_SEMESTER: {
      state.semesters = action.semesters;
      return { ...state };
    }

    case GET_CURRENT_SEMESTER: {
      state.semester_detail = action.semester_detail;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};