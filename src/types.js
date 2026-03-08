/**
 * @typedef {Object} GiftHistoryItem
 * @property {string} id
 * @property {string} giftedOn ISO date string representing when the gift was given.
 * @property {string} description Short note describing the gift or gesture.
 */

/**
 * @typedef {Object} Birthday
 * @property {string} id
 * @property {string} name
 * @property {string} date ISO date string (yyyy-MM-dd) storing the birth date.
 * @property {string[]} photoUris Ordered collection of saved photos for the person.
 * @property {string | null | undefined} photoUri Legacy field mapping to the first photo in photoUris.
 * @property {string | undefined} giftIdea
 * @property {string | undefined} notes
 * @property {number[]} notifyOffsets Array of offsets in days to trigger reminders (e.g. [-1, 0]).
 * @property {('family'|'friends'|'work'|'other') | undefined} category Used for filtering in the UI.
 * @property {GiftHistoryItem[]} giftHistory Historical record of gifts that can fuel ideas.
 * @property {{ phone?: string; email?: string; }} contact Optional quick contact information.
 * @property {string[]} notificationIds Saved identifiers for scheduled reminders.
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} datetime ISO datetime string for the scheduled start.
 * @property {string | undefined} location
 * @property {string | undefined} notes
 * @property {number[]} notifyOffsets Array of offsets in days to trigger reminders (e.g. [-1, 0]).
 * @property {RepeatRule | undefined} repeatRule Optional recurrence rule (RFC5545 inspired simple subset).
 * @property {string[]} photoUris Ordered collection of images attached to the event.
 * @property {string[]} notificationIds Saved identifiers for scheduled reminders.
 */

/**
 * @typedef {Object} RepeatRule
 * @property {('none'|'daily'|'weekly'|'monthly'|'yearly')} frequency
 * @property {number | undefined} interval
 */

export const DEFAULT_NOTIFY_OFFSETS = [-1, 0];
