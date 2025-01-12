export type FormFields = {
    name: string,
    id: string,
    element: HTMLInputElement | null,
    regex: RegExp,
    valid: boolean,
}