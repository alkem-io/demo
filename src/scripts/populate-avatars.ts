import { populateAvatars } from '../actions/populate-avatars';
import { DEFAULT_SERVER_URL } from '../constants';

populateAvatars(DEFAULT_SERVER_URL).catch(error => console.error(error));
