import { GET_ALL_COURSE_BY_TEACHER, GET_ALL_COURSE_BY_TEACHER_SEMESTER } from "../types/CourseType";


const stateDefault = {
  teacher_detail: {},
  courses: []
};

export const CourseReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_COURSE_BY_TEACHER: {
      state.courses = action.courses;
      return { ...state };
    }

    case GET_ALL_COURSE_BY_TEACHER_SEMESTER: {
      state.courses = action.courses;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};