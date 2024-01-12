export interface CustomActionResult<T> {
    isSuccess: boolean;
    errorMessage: string;
    successData: T;
    message: string;
}
