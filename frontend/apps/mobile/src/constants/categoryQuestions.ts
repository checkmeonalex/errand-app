// The questions a poster answers when posting a task, per category or
// subcategory. PostTaskScreen renders whatever is listed here, in order, so
// changing a question never needs a screen change.
//
// Keys are a category id (printing, laundry, other) or, for categories with
// subcategories, the subcategory id (notes, assignment, tutoring,
// academicOther, cleaning, water, householdOther). Answers are saved on the
// task as `extra_fields` (overview §6).

import { LAUNDRY_PRICE_PER_ITEM, TUTORING_PRICE_PER_HOUR } from './priceSuggestions';
import {
  ACCEPT_WINDOW,
  DURATION,
  EXTRA_INFO,
  NO_PURCHASE,
  WRITING_FORMAT,
  WRITING_MATERIALS,
  when,
  where,
  writingPages,
} from './sharedQuestions';
import type { Answers, Question, QuestionSet } from './questionTypes';
import { countLabel, joinTitle, text } from '../utils/taskTitle';

// ── Question sets ──

export const QUESTION_SETS: Record<string, QuestionSet> = {
  printing: {
    questions: [
      {
        id: 'service',
        type: 'choice',
        label: 'What do you need?',
        options: ['Print', 'Print & bind', 'Photocopy', 'Scan', 'Laminate'],
      },
      { id: 'document', type: 'file', label: 'Upload your document (PDF or Word)' },
      { id: 'pages', type: 'number', label: 'How many pages?', unit: 'pages' },
      { id: 'copies', type: 'number', label: 'How many copies?', unit: 'copies' },
      { id: 'colour', type: 'choice', label: 'Black & white or colour?', options: ['Black & white', 'Colour'] },
      { id: 'paperSize', type: 'choice', label: 'Paper size', options: ['A4', 'A3'] },
      where('Where should it be delivered?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle(text(a.service) ?? 'Printing', countLabel(a.pages, 'pages')),
  },

  laundry: {
    questions: [
      {
        id: 'service',
        type: 'choice',
        label: 'What do you need?',
        options: ['Wash & iron', 'Iron only', 'Wash only'],
      },
      {
        id: 'items',
        type: 'number',
        label: 'How many items?',
        unit: 'items',
        pricePerUnit: LAUNDRY_PRICE_PER_ITEM,
      },
      {
        id: 'itemTypes',
        type: 'multi',
        label: 'What kind of items?',
        options: ['Shirts', 'Trousers', 'Bedsheets', 'Towels', 'Other'],
      },
      {
        id: 'heavyItems',
        type: 'choice',
        label: 'Any heavy items (duvet, curtains, blanket)?',
        options: ['No', 'Yes'],
      },
      where('Where should the runner pick up your clothes?'),
      when('When do you need them back?'),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle(text(a.service) ?? 'Laundry', countLabel(a.items, 'items')),
  },

  notes: {
    questions: [
      { id: 'courseCode', type: 'text', label: 'Course code', placeholder: 'e.g. COM 211' },
      {
        id: 'content',
        type: 'text',
        label: 'What should be written?',
        placeholder: 'e.g. Copy my lecture notes for weeks 1–4, or textbook chapter 3',
        multiline: true,
      },
      WRITING_FORMAT,
      writingPages('pages'),
      WRITING_MATERIALS,
      { id: 'source', type: 'file', label: 'Upload source material' },
      where('Where should the notes be delivered?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle('Note writing', text(a.courseCode), countLabel(a.pages, 'pages')),
  },

  assignment: {
    notice:
      "Runners type or handwrite work you've already done. They won't write or answer your assignment for you.",
    questions: [
      { id: 'courseCode', type: 'text', label: 'Course code', placeholder: 'e.g. COM 211' },
      {
        id: 'content',
        type: 'text',
        label: 'Paste your work, or describe what to type',
        placeholder: 'Paste your answers here, or say where they are (e.g. "in my notebook")',
        multiline: true,
      },
      { id: 'workFile', type: 'file', label: 'Or upload your work' },
      WRITING_FORMAT,
      writingPages('length'),
      WRITING_MATERIALS,
      where('Where should it be delivered?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) =>
      joinTitle(
        `Assignment ${a.format === 'Handwritten' ? 'handwriting' : 'typing'}`,
        text(a.courseCode),
        countLabel(a.length, 'pages'),
      ),
  },

  tutoring: {
    questions: [
      { id: 'subject', type: 'text', label: 'Course or subject', placeholder: 'e.g. MTH 112 or Accounting' },
      {
        id: 'topic',
        type: 'text',
        label: 'What topic do you need help with?',
        placeholder: 'e.g. Integration by parts',
      },
      {
        id: 'hours',
        type: 'number',
        label: 'How many hours?',
        unit: 'hours',
        pricePerUnit: TUTORING_PRICE_PER_HOUR,
      },
      { id: 'mode', type: 'choice', label: 'In person or online?', options: ['In person', 'Online'] },
      { id: 'level', type: 'choice', label: 'Your level', options: ['ND1', 'ND2', 'HND1', 'HND2', 'Other'] },
      where('Where should you meet?', { questionId: 'mode', equals: 'In person' }),
      when('When do you want the session?'),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle('Tutoring', text(a.subject), countLabel(a.hours, 'hours')),
  },

  cleaning: {
    questions: [
      {
        id: 'areas',
        type: 'multi',
        label: 'What needs cleaning?',
        options: ['Room', 'Bathroom', 'Kitchen', 'Whole apartment'],
      },
      { id: 'rooms', type: 'number', label: 'How many rooms?', unit: 'rooms' },
      { id: 'supplies', type: 'confirm', label: "I'll provide the cleaning supplies" },
      { id: 'dirtLevel', type: 'choice', label: 'How much cleaning does it need?', options: ['Light', 'Normal', 'Heavy'] },
      where('Where is the place to clean?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) =>
      joinTitle('Cleaning', Array.isArray(a.areas) ? a.areas.join(', ') : undefined),
  },

  water: {
    questions: [
      { id: 'containers', type: 'number', label: 'How many containers?', unit: 'containers' },
      {
        id: 'containerSize',
        type: 'choice',
        label: 'Container size',
        options: ['Bucket', '25L keg', 'Other'],
      },
      {
        id: 'source',
        type: 'text',
        label: 'Where is the water source?',
        placeholder: 'e.g. Borehole behind Block C',
      },
      { id: 'floor', type: 'number', label: 'Which floor do you live on? (0 = ground floor)', unit: 'floor', min: 0 },
      { id: 'containersProvided', type: 'confirm', label: "I'll provide the containers" },
      where('Where should the water be delivered?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle('Fetching water', countLabel(a.containers, 'containers')),
  },

  other: {
    questions: [
      {
        id: 'description',
        type: 'text',
        label: 'Describe what you need done',
        placeholder: 'Be specific so runners know exactly what to do',
        multiline: true,
      },
      NO_PURCHASE,
      DURATION,
      { id: 'photo', type: 'file', label: 'Add a photo' },
      where('Where should the runner meet you?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => text(a.description)?.slice(0, 60) ?? 'Other task',
  },

  academicOther: {
    notice: "Runners help you learn or prepare. They won't write or answer graded work for you.",
    questions: [
      { id: 'courseCode', type: 'text', label: 'Course code', placeholder: 'e.g. COM 211' },
      {
        id: 'description',
        type: 'text',
        label: 'What academic help do you need?',
        placeholder: 'e.g. Proofread my project chapter, or arrange my lecture slides',
        multiline: true,
      },
      NO_PURCHASE,
      DURATION,
      where('Where should the runner meet you?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => joinTitle(text(a.courseCode), text(a.description)?.slice(0, 50)) || 'Academic help',
  },

  householdOther: {
    questions: [
      {
        id: 'description',
        type: 'text',
        label: 'What household task do you need done?',
        placeholder: 'e.g. Rearrange my room, or carry boxes to a new hostel',
        multiline: true,
      },
      NO_PURCHASE,
      DURATION,
      { id: 'supplies', type: 'confirm', label: "I'll provide anything needed for the task" },
      where('Where is the task?'),
      when(),
      ACCEPT_WINDOW,
      EXTRA_INFO,
    ],
    title: (a) => text(a.description)?.slice(0, 60) ?? 'Household task',
  },
};

export function getQuestionSet(
  categoryId: string | undefined,
  subcategoryId?: string,
): QuestionSet | undefined {
  return QUESTION_SETS[subcategoryId ?? categoryId ?? ''];
}

// Questions whose showIf condition is currently met.
// The questions to show right now: those whose showIf condition is met, with
// choice options narrowed by limitOptions (e.g. accept windows that fit the
// chosen deadline).
export function getVisibleQuestions(set: QuestionSet, answers: Answers): Question[] {
  return set.questions
    .filter(
      (question) => !question.showIf || answers[question.showIf.questionId] === question.showIf.equals,
    )
    .map((question) =>
      question.type === 'choice' && question.limitOptions
        ? { ...question, options: question.limitOptions(answers) }
        : question,
    );
}
