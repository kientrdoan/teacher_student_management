import { BaseService } from "./BaseService";

export class AttendService extends BaseService {
  constructor() {
    super();
  }

  getAttendByCourseId = (course_id) => {
    return this.get(`/teachers/attends/${course_id}`);
  };

}

export const attendService = new AttendService();