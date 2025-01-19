interface AnswerType {
    id: number; // Unique identifier for the answer
    answer: string; // The text of the answer
    correct?: boolean; // Indicates if the answer is correct (optional)
}

// Define the QuestionType interface
interface QuestionType {
    id: number; // Unique identifier for the question
    question: string; // The question text
    answers: AnswerType[]; // Array of possible answers
}

// Define the TestType interface
interface TestType {
    id: number; // Unique identifier for the test
    name: string; // The name of the test
    questions: QuestionType[]; // Array of questions in the test
}

// Define the overall structure that includes the test
export interface TestData {
    test: TestType; // The test object
}