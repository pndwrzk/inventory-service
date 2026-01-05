import { ApiProperty } from '@nestjs/swagger';

export enum ResponseStatus {
  Success = 'success',
  Failed = 'failed',
  Error = 'error',
}

export class BaseResponse<T> {
  @ApiProperty({ enum: ResponseStatus })
  status: ResponseStatus;

  @ApiProperty()
  message: string;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  data: T | null;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  meta?: {
    total_data : number,
    page: number;
    size: number;
    total_page: number;
  };

  private constructor(
    status: ResponseStatus,
    message: string,
    data?: T,
    meta?: { total_data: number,page: number; size: number; total_page: number },
  ) {
    this.status = status;
    this.message = message;
    this.data = data ?? null;
    this.meta = meta;
    
  }

  static Success<T>(data?: T, message = 'Operation successful', meta?: { total_data: number,page: number; size: number; total_page: number }) {
    return new BaseResponse<T>(ResponseStatus.Success, message, data, meta);
  }

  static Fail(message: string, data?: any) {
    return new BaseResponse<any>(ResponseStatus.Failed, message, data);
  }

  static Error(message: string, data?: any) {
    return new BaseResponse<any>(ResponseStatus.Error, message, data);
  }
}
