// src/common/dto/base-response.dto.ts
export enum ResponseStatus {
  Success = 'success',
  Failed = 'failed',
  Error = 'error',
}

export class BaseResponse<T> {
  status: ResponseStatus;
  message: string;
  data: T | null;

  private constructor(status: ResponseStatus, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data ?? null;
  }

  static Success<T>(data?: T, message = 'Operation successful') {
    return new BaseResponse<T>(ResponseStatus.Success, message, data);
  }

  static Fail(message: string, data?: any) {
    return new BaseResponse<any>(ResponseStatus.Failed, message, data);
  }

  static Error(message: string, data?: any) {
    return new BaseResponse<any>(ResponseStatus.Error, message, data);
  }
}
