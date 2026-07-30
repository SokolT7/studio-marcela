/**
 * @sm/scheduling — the availability and pricing engine for Studio Marcela.
 *
 * Pure logic, no I/O, no database, no framework. Everything here is
 * deterministic given its inputs, which is why it can carry a >95% coverage
 * bar (IMPLEMENTATION_PLAN.md §21.1) and why the riskiest code in the system is
 * also the most testable.
 */

export * from './types.js';
export * from './interval.js';
export * from './timezone.js';
export * from './segments.js';
export * from './workingWindows.js';
export * from './availability.js';
export * from './pricing.js';
