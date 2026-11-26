// The shape of a post-task question and its answers. The questions
// themselves live in categoryQuestions.ts and sharedQuestions.ts.

export type AnswerValue = string | string[] | boolean | undefined;
export type Answers = Record<string, AnswerValue>;

// Only ask a question when another question has a given answer.
export type ShowIf = { questionId: string; equals: string };

type BaseQuestion = {
  id: string;
  label: string;
  optional?: boolean;
  showIf?: ShowIf;
};

export type Question = BaseQuestion &
  (
    | {
        type: 'choice';
        options: string[];
        // Picking this answer stops the task from being posted.
        blockIf?: { equals: string; message: string };
        // Narrows `options` based on other answers, e.g. accept windows that
        // fit the chosen deadline. A previous pick that's no longer offered
        // counts as unanswered.
        limitOptions?: (answers: Answers) => string[];
      }
    | { type: 'multi'; options: string[] }
    | {
        type: 'number';
        unit: string;
        // Lowest allowed value (default 1).
        min?: number;
        // Price per unit, e.g. laundry ₦500 per item. Can depend on other
        // answers (notes: handwritten vs typed); null = not known yet. The
        // task's minimum price becomes count × this.
        pricePerUnit?: number | ((answers: Answers) => number | null);
      }
    | { type: 'text'; placeholder?: string; multiline?: boolean }
    // Placeholder until the backend has file storage; never required.
    | { type: 'file' }
    // A statement to tick, e.g. "I'll provide the supplies". Required unless
    // `optional`; `uncheckedNote` is a reminder shown while it's unticked;
    // `priceIfUnchecked` is added to the task's minimum price while unticked.
    | { type: 'confirm'; uncheckedNote?: string; priceIfUnchecked?: number }
  );

export type QuestionSet = {
  // Shown in a banner above the questions.
  notice?: string;
  questions: Question[];
  // Builds the task title runners see, from the answers.
  title: (answers: Answers) => string;
};
