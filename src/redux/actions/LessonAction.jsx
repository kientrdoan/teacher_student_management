/* eslint-disable no-unused-vars */

import { lessonService } from "../../../service/LessonService";
import { GET_ALL_LESSON_BY_COURSE } from "../types/LessonType";



export const getAllLessonAction = (course_id) => {
  return async (dispatch) => {
    try {
      const result = await lessonService.getAllLesson(course_id)
      console.log("lessons", result.data.data)
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_LESSON_BY_COURSE,
          lessons: result.data.data

        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};
