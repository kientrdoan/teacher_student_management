import { BaseService } from "./BaseService";

export class ScoreService extends BaseService {
  constructor() {
    super();
  }

  getAllScoreStudent = (course_id) => {
    return this.get_token(`/teachers/scores/${course_id}`);
  };

  updateScoreStudent = (dang_ky_id, payload) => {
    return this.put_token(`/teachers/score/${dang_ky_id}`, payload);
  };

  updateScoreExcelStudent = (course_id, payload) => {
    return this.post_token(`/teachers/scores/${course_id}`, payload);
  };
}

export const scoreService = new ScoreService();
