import { attendService } from "../../../service/AttendService";
import { GET_ALL_ATTEND_BY_COURSE } from "../types/AttendType";

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