import posthog from 'posthog-js'

type EventProperties = Record<string, string | number | boolean | null | undefined>

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY?.trim() ?? ''
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com'
const POSTHOG_UI_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST?.trim() || 'https://us.posthog.com'
const ANALYTICS_IN_DEV = import.meta.env.VITE_POSTHOG_IN_DEV === 'true'
const ANALYTICS_DEBUG = import.meta.env.VITE_POSTHOG_DEBUG === 'true'

let initialized = false

function analyticsEnabled() {
  return Boolean(POSTHOG_KEY) && (import.meta.env.PROD || ANALYTICS_IN_DEV)
}

export function initAnalytics() {
  if (initialized) {
    return
  }

  if (!analyticsEnabled()) {
    if (import.meta.env.DEV) {
      console.info('[analytics] PostHog disabled. Set VITE_POSTHOG_IN_DEV=true and VITE_PUBLIC_POSTHOG_KEY in .env.local')
    }
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: POSTHOG_UI_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    session_recording: {
      maskAllInputs: true,
      recordCrossOriginIframes: false,
    },
  })

  if (ANALYTICS_DEBUG) {
    posthog.debug(true)
  }

  posthog.capture('app_loaded', {
    env: import.meta.env.MODE,
    path: window.location.pathname,
    host: window.location.host,
  })

  initialized = true
}

export function captureEvent(eventName: string, properties: EventProperties = {}) {
  if (!initialized) {
    return
  }

  posthog.capture(eventName, properties)
}

export function identifyUser(distinctId: string, properties: EventProperties = {}) {
  if (!initialized || !distinctId) {
    return
  }

  posthog.identify(distinctId, properties)
}
