import { BaseService } from "./BaseService";

export class AttendService extends BaseService {
  constructor() {
    super();
  }

  getAttendByCourseId = (course_id) => {
    return this.get_token(`/teachers/attends/${course_id}`);
  };

  attend = (payload) => {
    return this.post_token(`/admins/attendance/`, payload);
  };

  attendManual = (payload) => {
    return this.post_token(`/teachers/attends`, payload);
  };

  attendManualMulti = (payload) => {
    return this.post_token(`/teachers/multi/attends`, payload);
  };

}

export const attendService = new AttendService();