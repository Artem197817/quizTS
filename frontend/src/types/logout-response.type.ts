export type LogoutResponseType = {
    error: boolean,
    accessToken?: string,
    refreshToken?: string,
    fullName?: string,
    userId?: number,
    email?: string,
    message: string,
}