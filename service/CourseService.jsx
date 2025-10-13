import { BaseService } from "./BaseService";

export class CourseService extends BaseService {
  constructor() {
    super();
  }

  getAllCourseByTeacher = (teacher_id) => {
    return this.get(`/teachers/courses/${teacher_id}`);
  };

  getCourseByTeacherAndSemester = (teacher_id, semester_id) => {
    return this.get(`/teachers/courses/${teacher_id}/${semester_id}`);
  };
}

export const courseService = new CourseService();
