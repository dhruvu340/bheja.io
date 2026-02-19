export interface IResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | undefined;
}

export class ApiResponse<T = unknown> implements IResponse<T> {
  success: boolean;
  message: string;
  data: T | undefined;

  constructor(
    statusCode: number,
    data?: T,
    message: string = "successful"
  ) {
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
  }
}
