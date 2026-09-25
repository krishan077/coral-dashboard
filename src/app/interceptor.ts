import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Get token from localStorage
  const token = localStorage.getItem('token');
  console.log(token);
  

  // If token exists, add it to request headers
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  // No token - send request normally
  return next(req);
};
