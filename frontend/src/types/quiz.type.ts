export type QuizType = {
    id: number,
    name: string,
    questions: Array<{
        id: number, questions: string, answers: Array<{
            id: number, answer: string,
        }>
    }>
}
