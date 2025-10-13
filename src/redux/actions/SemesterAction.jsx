/* eslint-disable no-unused-vars */

import { semesterService } from "../../../service/SemesterService";
import { GET_ALL_SEMESTER } from "../types/SemesterType";


export const getAllSemeterAction = () => {
  return async (dispatch) => {
    try {
      const result = await semesterService.getAllSemester();
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_SEMESTER,
          semesters: result.data.data

        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};
