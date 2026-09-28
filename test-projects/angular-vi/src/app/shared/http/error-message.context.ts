import { HttpContextToken } from '@angular/common/http';

export const ERROR_MESSAGE_CONTEXT = new HttpContextToken(
  () => 'Sorry, something went wrong on our side.'
);
