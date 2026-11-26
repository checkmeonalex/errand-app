// The only list of task categories. Screens read from here; never redefine it.
// To add a category: add it here, add its price hint and tag in
// priceSuggestions.ts, and its questions in categoryQuestions.ts.

import type { IconName } from '../components/Icon';

export type CategoryId = 'printing' | 'laundry' | 'academic' | 'household' | 'other' | 'tech';

// A kind of task inside a category, e.g. Academic → Tutoring.
// Its id is also the key of its question set in categoryQuestions.ts,
// so ids must be unique across all categories.
export type Subcategory = {
  id: string;
  label: string;
  description: string;
  icon: IconName;
};

export type Category = {
  id: CategoryId;
  label: string;
  icon: IconName;
  // When present, tapping the category asks which kind first.
  subcategories?: Subcategory[];
  // Shown as a disabled card until we're ready to launch it.
  comingSoon?: boolean;
};

export const CATEGORIES: Category[] = [
  { id: 'printing', label: 'Printing', icon: 'print-outline' },
  { id: 'laundry', label: 'Laundry', icon: 'shirt-outline' },
  {
    id: 'academic',
    label: 'Academic',
    icon: 'book-outline',
    subcategories: [
      {
        id: 'notes',
        label: 'Note writing',
        description: 'Neatly write or type up notes for a course',
        icon: 'create-outline',
      },
      {
        id: 'assignment',
        label: 'Assignment typing',
        description: 'Type or handwrite work you have already done',
        icon: 'document-text-outline',
      },
      {
        id: 'tutoring',
        label: 'Tutoring',
        description: 'Get one-on-one help with a course or topic',
        icon: 'school-outline',
      },
      {
        id: 'academicOther',
        label: 'Other academic help',
        description: "Something academic that isn't listed above",
        icon: 'ellipsis-horizontal-circle-outline',
      },
    ],
  },
  {
    id: 'household',
    label: 'Household tasks',
    icon: 'home-outline',
    subcategories: [
      {
        id: 'cleaning',
        label: 'Cleaning',
        description: 'Room, bathroom, kitchen or the whole apartment',
        icon: 'sparkles-outline',
      },
      {
        id: 'water',
        label: 'Fetching water',
        description: 'Buckets or kegs carried to your room',
        icon: 'water-outline',
      },
      {
        id: 'householdOther',
        label: 'Other household task',
        description: "A chore around your room or hostel that isn't listed",
        icon: 'ellipsis-horizontal-circle-outline',
      },
    ],
  },
  { id: 'other', label: 'Other', icon: 'apps-outline' },
  // Held back: the runner handles someone's expensive device. Opens once enough
  // verified runners can do repairs (PROJECT_OVERVIEW.md §6).
  { id: 'tech', label: 'Tech and repairs', icon: 'construct-outline', comingSoon: true },
];

export function getCategory(id: string | undefined): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

export function getCategoryLabel(id: string | undefined): string {
  return getCategory(id)?.label ?? 'Task';
}

export function getSubcategory(
  categoryId: string | undefined,
  subcategoryId: string | undefined,
): Subcategory | undefined {
  return getCategory(categoryId)?.subcategories?.find((sub) => sub.id === subcategoryId);
}
