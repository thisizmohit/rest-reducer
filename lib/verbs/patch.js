import { defaultItem } from '../defaults';
import { changeMeta } from '../utils';
import { ITEMS, PATCHES, STATES, VERBS, DATA, PERMISSIONS } from '../constants';
import applyMiddleware from '../middleware';
import {
  checkStateMW,
  checkItemsMW,
  checkIdMW,
  checkCodeMW,
} from '../middlewares/errors';

export const patch = applyMiddleware(
  (state, { patchId } = {}) => {
    const item = defaultItem;

    return {
      ...state,
      [PATCHES]: {
        ...state[PATCHES],
        [patchId]: {
          ...item,
          ...changeMeta(STATES.PENDING, VERBS.PATCH, -1),
        },
      },
    };
  },
  [checkStateMW],
);

export const patchSuccess = applyMiddleware(
  (state, { id, patchId, value, permissions, code } = {}) => {
    const item = state[PATCHES][patchId];

    return {
      ...state,
      [PATCHES]: {
        ...state[PATCHES],
        [patchId]: {
          ...item,
          [DATA]: value,
          [PERMISSIONS]: permissions,
          ...changeMeta(STATES.SYNCED, VERBS.PATCH, code, null),
        },
      },
      ...(state[ITEMS][id]
        ? {
            [ITEMS]: {
              ...state[ITEMS],
              [id]: {
                ...state[ITEMS][id],
                ...changeMeta(STATES.STALE, VERBS.PATCH),
              },
            },
          }
        : {}),
    };
  },
  [checkStateMW],
);

export const patchFailure = applyMiddleware(
  (state, { id, patchId, code, error } = {}) => {
    const item = state[ITEMS][id];

    return {
      ...state,
      [PATCHES]: {
        ...state[PATCHES],
        [patchId]: {
          ...item,
          ...changeMeta(STATES.FAILED, VERBS.PATCH, code, error),
        },
      },
    };
  },
  [checkCodeMW, checkIdMW, checkItemsMW, checkStateMW],
);
