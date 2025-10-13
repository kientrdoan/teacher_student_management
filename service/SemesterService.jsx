import { BaseService } from "./BaseService";

export class SemesterService extends BaseService {
  constructor() {
    super();
  }

  getAllSemester = () => {
    return this.get(`/teachers/semesters`);
  };

}

export const semesterService = new SemesterService();
