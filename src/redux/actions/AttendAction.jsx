/* eslint-disable no-unused-vars */
import { attendService } from "../../../service/AttendService";
import { GET_ALL_ATTEND_BY_COURSE } from "../types/AttendType";

// eslint-disable-next-line react-refresh/only-export-components
export const getAttendByCourseId = (course_id) => {
  return async (dispatch) => {
    try {
      const result = await attendService.getAttendByCourseId(course_id);
      if (result.status === 200) {
        dispatch({
          type: GET_ALL_ATTEND_BY_COURSE,
          attends: result.data.data,
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};


export const AttendAction = (payload) => {
  return async (dispatch) => {
    try {
      const result = await attendService.attend(payload);
      if (result.status === 200 && result.data.status_code != 405) {
        // dispatch({
        //   type: GET_ALL_ATTEND_BY_COURSE,
        //   attends: result.data.data,
        // });
        return { success: true, data: result.data.data };
      }
      else{
        return { success: false, error: result.data.message};
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};