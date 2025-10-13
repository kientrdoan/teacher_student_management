import { GET_ALL_STUDENT_BY_COURSE } from "../types/StudentType";


const stateDefault = {
  students: [],
};

export const StudentReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_STUDENT_BY_COURSE: {
      state.students = action.students;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};