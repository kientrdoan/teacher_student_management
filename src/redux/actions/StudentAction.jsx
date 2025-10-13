/* eslint-disable no-unused-vars */

import { studentService } from "../../../service/StudentService";
import { GET_ALL_STUDENT_BY_COURSE } from "../types/StudentType";


export const getAllStudentAction = (course_id) => {
  return async (dispatch) => {
    try {
      const result = await studentService.getAllStudent(course_id)
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_STUDENT_BY_COURSE,
          students: result.data.data

        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};
