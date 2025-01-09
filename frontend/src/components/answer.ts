import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Answer {

    constructor() {
        this.quiz = null;
        this.userInfo = Auth.getUserInfo();
        this.testId = sessionStorage.getItem("testId");
        document.getElementById('result-callback')
            .setAttribute('href', '#/result?id=' + this.testId)
        if (this.userInfo && this.testId) {

            this.init();


        } else {
            location.href = '#/'
        }
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/tests/'
                + this.testId + '/result/details?userId=' + this.userInfo.userId);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quiz = result;
                console.log(this.quiz.test.name);
                this.showInfo();
                this.showAnswer()
            }
        } catch (error) {
            return console.log(error);
        }
    }

    showInfo() {
        document.getElementById('pre-title').innerText = this.quiz.test.name;
        document.getElementById('tested').innerText = this.userInfo.fullName
            + ', ' + this.userInfo.email;

    }

    showAnswer() {
        let index = 0;


        const answerBlock = document.getElementById('answer-block');

        this.quiz.test.questions.forEach(question => {
            const answerQuestionElement = document.createElement('div');
            answerQuestionElement.className = 'answer-question';

            const answerTitleElement = document.createElement('h2');
            answerTitleElement.className = 'answer-title';
            answerTitleElement.innerHTML = '<span>Вопрос ' + (index + 1)
                + ': </span> ' + question.question;

            const answersElement = document.createElement('div');
            answersElement.className = 'answer-answers';


            answerQuestionElement.appendChild(answerTitleElement);

            question.answers.forEach((answer) => {
                const answerElement = document.createElement('div');
                answerElement.className = 'answer-answer';
                answerElement.innerText = answer.answer;

                if (answer.correct === false) {
                    answerElement.style.color = '#DC3333';
                    answerElement.classList.add('invalid-answer');
                } else {
                    if (answer.correct === true) {
                        answerElement.style.color = '#5FDC33';
                        answerElement.classList.add('right-answer');
                    }
                }


                answersElement.appendChild(answerElement);

            });

            answerQuestionElement.appendChild(answersElement);
            answerBlock.appendChild(answerQuestionElement);
            index++;
        });

    }
}

