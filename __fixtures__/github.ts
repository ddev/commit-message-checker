import { jest } from '@jest/globals'

// Mutable context — tests reassign properties between cases.
export const context: { eventName?: string; payload?: unknown } = {}

// graphql mock returned from getOctokit(); tests override its
// implementation per-case to feed back a fake GraphQL response.
export const graphql =
  jest.fn<(query: string, vars?: unknown) => Promise<unknown>>()

export const getOctokit = jest.fn(() => ({ graphql }))
