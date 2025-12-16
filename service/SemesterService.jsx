import { BaseService } from "./BaseService";

export class SemesterService extends BaseService {
  constructor() {
    super();
  }

  getAllSemester = () => {
    return this.get_token(`/teachers/semesters`);
  };

  getCurrentSemester = () => {
    return this.get_token(`/students/current-semesters`);
  };

}

export const semesterService = new SemesterService();
