import { RuleMatcherFn } from '../config/dependency-rules-config';

/**
 * Useful for wildcard rules.
 *
 * Instead of
 * ```typescript
 * {
 *   depRules: {
 *     'domain:customers': 'domain:customers',
 *     'domain:holidays': 'domain:holidays',
 *     'domain:accuonting': 'domain:accounting',
 *   }
 * }
 * ```
 *
 * use `sameTag`:
 *
 * ```typescript
 * {
 *   depRules: {
 *     'domain:*': sameTag
 *   }
 * }
 * ```
 */
export const sameTag: RuleMatcherFn = ({ from, to }) => from === to;
