import posthog from 'posthog-js'

type EventProperties = Record<string, string | number | boolean | null | undefined>

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY?.trim() ?? ''
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com'
const POSTHOG_UI_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST?.trim() || 'https://us.posthog.com'
const ANALYTICS_IN_DEV = import.meta.env.VITE_POSTHOG_IN_DEV === 'true'

let initialized = false

function analyticsEnabled() {
  return Boolean(POSTHOG_KEY) && (import.meta.env.PROD || ANALYTICS_IN_DEV)
}

export function initAnalytics() {
  if (initialized || !analyticsEnabled()) {
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
