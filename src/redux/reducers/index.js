
import { combineReducers } from 'redux';
import authReducer from './authReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    // Add more reducers here as your app grows
});

export default rootReducer;