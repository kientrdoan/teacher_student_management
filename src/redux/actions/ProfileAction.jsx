/* eslint-disable no-unused-vars */

import { profileService } from "../../../service/ProfileService";
import { GET_DETAIL_TEACHER_BY_USER } from "../types/ProfileType";

export const getDetailTeacherByUserIdAction = (id) => {
  return async (dispatch) => {
    try {
      const result = await profileService.getInfoTeacherByUserId(id);
      if (result.status === 200) {
        dispatch({
          type: GET_DETAIL_TEACHER_BY_USER,
          teacher_detail: result.data.data,
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};


export const editInfoTeacherByUserIdAction = (id) => {
  return async (dispatch) => {
    try {
      const result = await profileService.editInfoTeacherByUserId(id);
      if (result.status === 200) {
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};