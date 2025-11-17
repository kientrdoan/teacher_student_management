import { BaseService } from "./BaseService";

export class ScoreService extends BaseService {
  constructor() {
    super();
  }

  getAllScoreStudent = (course_id) => {
    return this.get(`/teachers/scores/${course_id}`);
  };

  updateScoreStudent = (dang_ky_id, payload) => {
    return this.put(`/teachers/scores/${dang_ky_id}/`, payload);
  };

  updateScoreExcelStudent = (dang_ky_id, payload) => {
    return this.post(`/teachers/scores/${dang_ky_id}/`, payload);
  };
}

export const scoreService = new ScoreService();
