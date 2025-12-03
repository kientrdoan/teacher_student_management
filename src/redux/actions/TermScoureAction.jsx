/* eslint-disable no-unused-vars */

import { scoreService } from "../../../service/TermScoreService";
import { GET_ALL_SCORE } from "../types/TermScoreType";


export const getAllScoreStudentAction = (course_id) => {
  return async (dispatch) => {
    try {
        console.log("course_id", course_id);
      const result = await scoreService.getAllScoreStudent(course_id)
      console.log("result", result);
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_SCORE,
          scores_students: result.data.data

        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};

export const updateScoreStudentAction = (dang_ky_id, payload) => {
  return async (dispatch) => {
    try {
      const result = await scoreService.updateScoreStudent(dang_ky_id, payload)
      if (result.status === 200) {
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};


export const updateScoreExelStudentAction = (course_id, payload) => {
  return async (dispatch) => {
    try {
      const result = await scoreService.updateScoreExcelStudent(course_id, payload)
      if (result.status === 200) {
        return { success: true, data: result.data.data };
      }else{
        return { success: false, error: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};


