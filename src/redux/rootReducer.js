import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
// import other reducers here

export default combineReducers({
  auth: authReducer,
  // add other reducers here
});