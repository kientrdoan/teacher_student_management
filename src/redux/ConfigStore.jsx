import {applyMiddleware, combineReducers, createStore} from 'redux';
import { thunk } from 'redux-thunk';
import { UserReducer } from './reducers/UserRedeucer';
import { ProfileReducer } from './reducers/ProfileReducer';
import { CourseReducer } from './reducers/CourseReducer';
import { SemesterReducer } from './reducers/SemesterReducer';
import { StudentReducer } from './reducers/StudentReducer';
import { TermScoreReducer } from './reducers/TermScoreReducer';
import { AttendReducer } from './reducers/AttendReducer';
import { LessonReducer } from './reducers/LessonReducer';

const dummyReducer = (state = {}, ) => state;

const rootReducer = combineReducers({
  // Add your reducers here
  UserReducer,
  ProfileReducer,
  CourseReducer,
  SemesterReducer,
  StudentReducer,
  TermScoreReducer,
  AttendReducer,
  LessonReducer,
  dummy: dummyReducer
})

export const store= createStore(
  rootReducer, applyMiddleware(thunk)
);