import { BaseService } from "./BaseService";

export class ProfileService extends BaseService {
  constructor() {
    super();
  }

  getInfoTeacherByUserId = (id) => {
    return this.get_token(`/teachers/teachers/${id}`);
  };

  editInfoTeacherByUserId = (id, payload) => {
    return this.put_token(`/teachers/teachers/${id}`, payload)
  }

}

export const profileService = new ProfileService();
