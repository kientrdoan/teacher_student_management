import { BaseService } from "./BaseService";

export class AttendService extends BaseService {
  constructor() {
    super();
  }

  getAttendByCourseId = (course_id) => {
    return this.get(`/teachers/attends/${course_id}`);
  };

  attend = (payload) => {
    return this.post_token(`/admins/attendance/`, payload);
  };

}

export const attendService = new AttendService();