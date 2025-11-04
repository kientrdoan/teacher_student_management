import { BaseService } from "./BaseService";

export class ScoreService extends BaseService {
  constructor() {
    super();
  }

  getAllScoreStudent = (course_id) => {
    return this.get(`/teachers/scores/${course_id}`);
  };

  updateScoreStudent = (course_id, user_id, payload) => {
    return this.put(`/teachers/scores/${course_id}/${user_id}`, payload);
  };
}

export const scoreService = new ScoreService();
