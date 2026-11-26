import React, { createContext, useContext } from 'react';
import type { Report, Review } from '@errand/types';
import { LOCAL_USER_ID } from '../constants/localUser';
import { usePersistentList } from '../hooks/usePersistentList';
import { STORAGE_KEYS } from '../storage/storage';

export type NewReview = Pick<Review, 'task_id' | 'ratee_id' | 'stars' | 'tags' | 'comment'>;
export type NewReport = Pick<Report, 'task_id' | 'reason' | 'details' | 'photos' | 'wants' | 'is_dispute'>;

type FeedbackContextValue = {
  reviews: Review[];
  reports: Report[];
  isLoading: boolean;
  addReview: (review: NewReview) => Promise<void>;
  addReport: (report: NewReport) => Promise<void>;
  reviewFor: (taskId: string) => Review | undefined;
  reportFor: (taskId: string) => Report | undefined;
  // Wipes both (used by Delete account).
  clearAll: () => Promise<void>;
};

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

// What posters tell Taskly about tasks: ratings of runners and reports of
// problems. Saved on this device until the backend exists.
// TODO: reviews.create / reviews.list and reports.create via @errand/api.
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const reviews = usePersistentList<Review>(STORAGE_KEYS.reviews);
  const reports = usePersistentList<Report>(STORAGE_KEYS.reports);

  const stamp = () => ({
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  });

  const value: FeedbackContextValue = {
    reviews: reviews.items,
    reports: reports.items,
    isLoading: reviews.isLoading || reports.isLoading,
    addReview: (review) => reviews.add({ ...review, ...stamp(), rater_id: LOCAL_USER_ID }),
    addReport: (report) => reports.add({ ...report, ...stamp(), reporter_id: LOCAL_USER_ID }),
    reviewFor: (taskId) => reviews.items.find((review) => review.task_id === taskId),
    reportFor: (taskId) => reports.items.find((report) => report.task_id === taskId),
    clearAll: async () => {
      await reviews.clearAll();
      await reports.clearAll();
    },
  };

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
