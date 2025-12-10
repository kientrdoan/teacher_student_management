import { BaseService } from "./BaseService";

export class SemesterService extends BaseService {
  constructor() {
    super();
  }

  getAllSemester = () => {
    return this.get(`/teachers/semesters`);
  };

  getCurrentSemester = () => {
    return this.get(`/students/current-semesters`);
  };

}

export const semesterService = new SemesterService();
