"use client"

import { useCallback, useState, useTransition } from "react"

/**
 * Wraps an async server action with transition pending state and surfaced error message.
 */
export function useServerAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    (...args: TArgs) =>
      new Promise<TResult>((resolve, reject) => {
        setError(null)
        startTransition(async () => {
          try {
            const result = await fn(...args)
            resolve(result)
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Something went wrong."
            setError(message)
            reject(e)
          }
        })
      }),
    [fn],
  )

  const resetError = useCallback(() => setError(null), [])

  return { run, isPending, error, resetError }
}
