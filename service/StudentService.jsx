import { BaseService } from "./BaseService";

export class StudentService extends BaseService {
  constructor() {
    super();
  }

  getAllStudent = (course_id) => {
    return this.get_token(`/teachers/students/${course_id}`);
  };

}

export const studentService = new StudentService();
