import { BaseService } from "./BaseService";

export class ProfileService extends BaseService {
  constructor() {
    super();
  }

  getInfoTeacherByUserId = (id) => {
    return this.get(`/teachers/teachers/${id}`);
  };

  editInfoTeacherByUserId = (id) => {
    return this.put(`/teachers/teachers/${id}`)
  }

}

export const profileService = new ProfileService();
