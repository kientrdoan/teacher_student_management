/* eslint-disable no-unused-vars */

import { courseService } from "../../../service/CourseService";
import { GET_ALL_COURSE_BY_TEACHER, GET_ALL_COURSE_BY_TEACHER_SEMESTER } from "../types/CourseType";


export const getAllCourseByTeacherAction = (teacher_id) => {
  return async (dispatch) => {
    try {
      const result = await courseService.getAllCourseByTeacher(teacher_id);
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_COURSE_BY_TEACHER,
          courses: result.data.data,
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};


export const getAllCourseByTeacherAndSemesterAction = (teacher_id, semester_id) => {
  return async (dispatch) => {
    try {
      const result = await courseService.getCourseByTeacherAndSemester(teacher_id, semester_id);
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_COURSE_BY_TEACHER_SEMESTER,
          courses: result.data.data,
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};