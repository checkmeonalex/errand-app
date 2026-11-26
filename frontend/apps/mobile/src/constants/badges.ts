// Every badge that can be earned. The backend awards them (Profile.badges);
// this file only says how each one looks and how it's earned, so the app
// can show earned ones and the ones still to get.

import type { BadgeId } from '@errand/types';
import type { IconName } from '../components/Icon';

export type BadgeInfo = {
  id: BadgeId;
  label: string;
  howToEarn: string;
  icon: IconName;
  // Which side of the app the badge belongs to.
  side: 'poster' | 'runner';
};

export const PIONEER_SPOTS = 15;

export const BADGES: BadgeInfo[] = [
  {
    id: 'pioneer_poster',
    label: 'Pioneer',
    howToEarn: `One of the first ${PIONEER_SPOTS} posters to get a task done on Taskly`,
    icon: 'flag',
    side: 'poster',
  },
  {
    id: 'pioneer_runner',
    label: 'Pioneer',
    howToEarn: `One of the first ${PIONEER_SPOTS} runners verified on Taskly`,
    icon: 'flag',
    side: 'runner',
  },
  {
    id: 'top_poster',
    label: 'Top Poster',
    howToEarn: "In the top 10 of last week's poster board",
    icon: 'ribbon',
    side: 'poster',
  },
  {
    id: 'top_runner',
    label: 'Top Runner',
    howToEarn: "In the top 10 of last week's runner board",
    icon: 'ribbon',
    side: 'runner',
  },
];

export function getBadge(id: BadgeId): BadgeInfo | undefined {
  return BADGES.find((badge) => badge.id === id);
}
