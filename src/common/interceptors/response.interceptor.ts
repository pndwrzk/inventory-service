// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../dto/base-response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof BaseResponse) {
          return data;
        }
        return BaseResponse.Success(data);
      }),
    );
  }
}
