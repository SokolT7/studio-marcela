import Link from 'next/link';

/**
 * Three decisions maximum: where, what, when (IMPLEMENTATION_PLAN.md §9.1).
 * Everything after that is asked once the appointment is already secured.
 *
 * Completed steps stay clickable — a client who wants to change salon
 * mid-flow should not have to start again.
 */

export interface StepDefinition {
  label: string;
  /** Filled-in value, shown once the step is answered. */
  value?: string;
  href?: string;
}

export function BookingStepper({
  steps,
  current,
}: {
  steps: StepDefinition[];
  current: number;
}) {
  return (
    <nav aria-label="Koraci naručivanja" className="border-b border-paper-200 bg-paper-000">
      <ol className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 md:px-8 lg:px-12">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          const content = (
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold',
                  isDone
                    ? 'bg-clay-600 text-paper-000'
                    : isCurrent
                      ? 'bg-ink-900 text-paper-000'
                      : 'bg-paper-200 text-ink-500',
                ].join(' ')}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <span className="text-[0.875rem]">
                <span className={isCurrent ? 'font-semibold text-ink-900' : 'text-ink-500'}>
                  {step.label}
                </span>
                {step.value && (
                  <span className="ml-1.5 text-ink-700">· {step.value}</span>
                )}
              </span>
            </span>
          );

          return (
            <li key={step.label} className="flex items-center gap-3">
              {isDone && step.href ? (
                <Link
                  href={step.href}
                  className="rounded-[4px] transition-colors hover:text-ink-900"
                  aria-label={`Promijeni: ${step.label}`}
                >
                  {content}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'step' : undefined}>{content}</span>
              )}
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="text-paper-200">
                  ／
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
