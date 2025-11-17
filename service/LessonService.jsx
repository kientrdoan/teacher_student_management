import { BaseService } from "./BaseService";

export class LessonService extends BaseService {
  constructor() {
    super();
  }

  getAllLesson = (course_id) => {
    return this.get(`/teachers/lessons/${course_id}`);
  };
}

export const lessonService = new LessonService();