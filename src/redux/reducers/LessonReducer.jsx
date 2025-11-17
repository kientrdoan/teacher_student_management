import { GET_ALL_LESSON_BY_COURSE } from "../types/LessonType";


const stateDefault = {
  lessons: [],
  lesson_detail: {},
};

export const LessonReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_LESSON_BY_COURSE: {
      state.lessons = action.lessons;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};