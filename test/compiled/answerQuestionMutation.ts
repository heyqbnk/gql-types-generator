import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export namespace AnswerQuestionMutation {
  export interface Arguments {
    questionIndex: number;
    optionIndex: number;
  }
  export interface AnswerQuestion {
    currentQuestion: AnswerQuestion.CurrentQuestion;
    currentSpeed: AnswerQuestion.CurrentSpeed;
    currentServerTime: AnswerQuestion.CurrentServerTime;
    startedAt: AnswerQuestion.StartedAt;
  }
  export namespace AnswerQuestion {
    export interface CurrentQuestion {
      title: CurrentQuestion.Title;
      selectedOptions: CurrentQuestion.SelectedOptions;
      sentAt: CurrentQuestion.SentAt;
      options: CurrentQuestion.Options;
      index: CurrentQuestion.Index;
    }
    export namespace CurrentQuestion {
      export type Title = string;
      export type SelectedOptions = number[];
      export type SentAt = number;
      export type Options = string[];
      export type Index = number;
    }
    export type CurrentSpeed = number;
    export type CurrentServerTime = number;
    export type StartedAt = number;
  }
}
export interface AnswerQuestionMutation {
  answerQuestion: AnswerQuestionMutation.AnswerQuestion;
}
export const answerQuestionMutation: DocumentNode = gql(`mutation answerQuestion($questionIndex: Int!, $optionIndex: Int!) {
  answerQuestion(questionIndex: $questionIndex, optionIndex: $optionIndex) {
    currentQuestion {
      title
      selectedOptions
      sentAt
      options
      index
    }
    currentSpeed
    currentServerTime
    startedAt
  }
}`);
