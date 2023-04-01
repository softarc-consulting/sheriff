import { RuleMatcherFn } from '../config/dependency-rules-config';

export const sameTag: RuleMatcherFn = ({ from, to }) => from === to;
