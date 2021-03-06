import fetch from 'node-fetch'
import AbortController from 'abort-controller'

export const MAX_REQUEST_TIME = 1200

export interface ErrorResult {
  status: number
  message: string
}

async function fetchWithAbort<T = Object>(
  endpoint: string,
  options: Object = {},
): Promise<T | ErrorResult> {
  const controller = new AbortController()

  // Abort the fetch request when it takes too long
  const timeout = setTimeout(() => {
    controller.abort()
    console.warn('ABORTED', endpoint) // For logging in Sentry
  }, MAX_REQUEST_TIME)

  return await fetch(endpoint, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timeout) // The data is on its way, so clear the timeout

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }
      return res.json()
    })
    .catch((e: Error) => {
      throw e.name === 'AbortError' ? new Error(`504 - Gateway Timeout`) : e
    })
}

export default fetchWithAbort
