/* eslint-disable no-unused-vars */


import { userService } from "../../../service/UserService";
import { LOGIN_ACTION } from "../types/UserType";
import { jwtDecode } from "jwt-decode";

export const loginAction = (thongTinDangNhap) => {
  return async (dispatch) => {
    try {
      const result = await userService.login(thongTinDangNhap);
      if (result.status === 200) {
        const accessToken = result.data.data.access;
        const payload = jwtDecode(accessToken);
        console.log("Payload JWT:", payload);
        dispatch({
          type: LOGIN_ACTION,
          access_token: result.data.data.access,
          user: {
            user_id: payload.user_id,
            full_name: payload.name,
            role: payload.role
          }
        });
        return { success: true, data: result.data.data };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, error };
    }
  };
};