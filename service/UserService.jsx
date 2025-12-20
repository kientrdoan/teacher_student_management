import { BaseService } from "./BaseService";

export class UserService extends BaseService {
  constructor() {
    super();
  }

  login = (thongTinDangNhap) => {
    return this.post("/auths/login", thongTinDangNhap);
  };

  thayDoiMatKhau = (payload) => {
    return this.put_token(`/auths/signup`, payload)
  }
}

export const userService = new UserService();