import { GET_ALL_SCORE } from "../types/TermScoreType";


const stateDefault = {
  scores_students: [],
};

export const TermScoreReducer = (state = stateDefault, action) => {
  switch (action.type) {
    case GET_ALL_SCORE: {
      state.scores_students = action.scores_students;
      return { ...state };
    }
    
    default:
      return { ...state };
  }
};