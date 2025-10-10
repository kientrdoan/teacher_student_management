/* eslint-disable no-unused-vars */


import { userService } from "../../../service/UserService";
import { LOGIN_ACTION } from "../types/UserType";

export const loginAction = (thongTinDangNhap) => {
  return async (dispatch) => {
    try {
      const result = await userService.login(thongTinDangNhap);
      if (result.status === 200) {
        dispatch({
          type: LOGIN_ACTION,
          user: result.data.data,
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};