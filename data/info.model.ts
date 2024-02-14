export interface IResponses {
  unauthorized: {code: number; message: string;};
  forbidden: {code: number; message: string;};
  notFound: {code: number; message: string;};
  notAllowed: {code: number; message: string;};
  accepted: {code: number; message: string;};
  ok: {code: number; message: string;};
  created: {code: number; message: string;};
  badRequest: {code: number; message: string;};

  info_already_exist: {code: number; message: string;};
  user_not_authenticated: {code: number; message: string;};
  user_created: {code: number; message: string;};
  user_already_authenticated: {code: number; message: string;};
  user_not_found: {code: number; message: string;};
  user_forbbiden: {code: number; message: string;};
  incorrect_info: {code: number; message: string;};
  server_error: {code: number; message: string;};
  user_succesfully_logged: {code: number; message: string;};
}
