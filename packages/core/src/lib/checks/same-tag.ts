import { RuleMatcherFn } from '../4-config/dependency-rules-config';

export const sameTag: RuleMatcherFn = ({ from, to }) => from === to;
