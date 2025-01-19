export type QuizType = {
    id: number,
    name: string,
    questions: Array<QuestionType>
}

export type QuestionType = {
    id: number,
     question: string,
      answers: Array<QuizAnswerType>
}

export type QuizAnswerType = {
    id: number,
     answer: string,
}