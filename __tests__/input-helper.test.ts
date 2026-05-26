/*
 * This file is part of the "DDEV Commit Message Checker" Action for GitHub.
 *
 * Forked from the unmaintained "GS Commit Message Checker" by Gilbertsoft LLC.
 * Copyright (C) 2019-2022 Gilbertsoft LLC (gilbertsoft.org)
 * Copyright (C) 2026 DDEV Foundation (ddev.com)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * For the full license information, please read the LICENSE file that
 * was distributed with this source code.
 */

import type { InputOptions } from '@actions/core'
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as githubFixture from '../__fixtures__/github.js'
import type { ICheckerArguments } from '../src/commit-message-checker.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => githubFixture)

const { getInputs } = await import('../src/input-helper.js')

let inputs: Record<string, string> = {}

beforeEach(() => {
  inputs = {}
  githubFixture.context.eventName = undefined
  githubFixture.context.payload = undefined

  core.getInput.mockImplementation((name: string, options?: InputOptions) => {
    const val = inputs[name] || ''
    if (options?.required && !val) {
      throw new Error(`Input required and not supplied: ${name}`)
    }
    return val.trim()
  })

  githubFixture.graphql.mockReset()
})

describe('input-helper tests', () => {
  it('requires pattern', async () => {
    await expect(getInputs()).rejects.toThrow(
      'Input required and not supplied: pattern'
    )
  })

  it('requires error message', async () => {
    inputs.pattern = 'some-pattern'
    await expect(getInputs()).rejects.toThrow(
      'Input required and not supplied: error'
    )
  })

  it('requires event', async () => {
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'Event "undefined" is not supported.'
    )
  })

  it('requires valid event', async () => {
    githubFixture.context.eventName = 'some-event'
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'Event "some-event" is not supported.'
    )
  })

  it('sets pattern', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.flags = 'abcdefgh'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.pattern).toBe('some-pattern')
  })

  it('sets flags', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.flags = 'abcdefgh'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.flags).toBe('abcdefgh')
  })

  it('sets error', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.flags = 'abcdefgh'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.error).toBe('some-error')
  })

  it('requires pull_request payload', async () => {
    githubFixture.context.eventName = 'pull_request'
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'No payload found in the context.'
    )
  })

  it('requires pull_request', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {}
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'No pull_request found in the payload.'
    )
  })

  it('requires pull_request title', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: '', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'No title found in the pull_request.'
    )
  })

  it('sets pull_request title', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-title')
  })

  it('sets pull_request title and body', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: 'some-body' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-title\n\nsome-body')
  })

  it('excludes pull_request body', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: 'some-body' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.excludeDescription = 'true'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-title')
  })

  it('excludes pull_request title', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: 'some-body' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.excludeTitle = 'true'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-body')
  })

  it('excludes pull_request title and body', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: 'some-body' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.excludeDescription = 'true'
    inputs.excludeTitle = 'true'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages).toHaveLength(0)
  })

  it('requires accessToken', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    await expect(getInputs()).rejects.toThrow(
      'The `checkAllCommitMessages` option requires a github access token.'
    )
  })

  it('requires pull_request number', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'dummy-token'
    await expect(getInputs()).rejects.toThrow(
      'No number found in the pull_request.'
    )
  })

  it('requires repository', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '', number: 12345 }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'dummy-token'
    await expect(getInputs()).rejects.toThrow(
      'No repository found in the payload.'
    )
  })

  it('requires repository name', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '', number: 12345 },
      repository: {}
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'dummy-token'
    await expect(getInputs()).rejects.toThrow(
      'No name found in the repository.'
    )
  })

  it('requires repository owner (1)', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '', number: 12345 },
      repository: { name: 'repository-name' }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'dummy-token'
    await expect(getInputs()).rejects.toThrow(
      'No owner found in the repository.'
    )
  })

  it('requires repository owner (2)', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: { title: 'some-title', body: '', number: 12345 },
      repository: { name: 'repository-name', owner: {} }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'dummy-token'
    await expect(getInputs()).rejects.toThrow(
      'No owner found in the repository.'
    )
  })

  it('sets pull_request commits', async () => {
    githubFixture.context.eventName = 'pull_request'
    githubFixture.context.payload = {
      pull_request: {
        title: 'some-title',
        body: 'some-body',
        number: 1
      },
      repository: {
        owner: { name: 'some-owner' },
        name: 'some-repo'
      }
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    inputs.excludeDescription = 'true'
    inputs.excludeTitle = 'true'
    inputs.checkAllCommitMessages = 'true'
    inputs.accessToken = 'some-token'

    githubFixture.graphql.mockResolvedValue({
      repository: {
        pullRequest: {
          commits: {
            edges: [
              {
                node: {
                  commit: {
                    message:
                      'input: make input-helper functions async\n\nIn order to work with asynchronous call like an async http request\nin an easier way, the functions getInput and getMessages were\nconverted to async.'
                  }
                }
              },
              {
                node: {
                  commit: {
                    message:
                      "input: PR options ignore title and check PR commits\n\nthis make it possible to igore partially or completely the PR payload.\nThe commits associated with the pull request can be checked instead of\nchecking the pull request payload. The parameter are:\n\n- excludeTitle: 'true | false'\n- excludeDescription: 'true | false'\n- checkAllCommitMessages: 'true | false'\n\nby default, all options comes false."
                  }
                }
              },
              {
                node: {
                  commit: {
                    message:
                      'docs: include parameters excludeTitle, checkAllCommitMessages and accessToken\n\nCo-authored-by: Gilbertsoft <25326036+gilbertsoft@users.noreply.github.com>'
                  }
                }
              }
            ]
          }
        }
      }
    })

    const result: ICheckerArguments = await getInputs()
    expect(result.pattern).toBe('some-pattern')
    expect(result.error).toBe('some-error')
    expect(result.messages).toHaveLength(3)
  })

  it('require push payload', async () => {
    githubFixture.context.eventName = 'push'
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    await expect(getInputs()).rejects.toThrow(
      'No payload found in the context.'
    )
  })

  it('push payload is optional', async () => {
    githubFixture.context.eventName = 'push'
    githubFixture.context.payload = {}
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages).toHaveLength(0)
  })

  it('push payload commits is optional', async () => {
    githubFixture.context.eventName = 'push'
    githubFixture.context.payload = { commits: {} }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages).toHaveLength(0)
  })

  it('sets correct single push payload', async () => {
    githubFixture.context.eventName = 'push'
    githubFixture.context.payload = {
      commits: [{ message: 'some-message' }]
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-message')
  })

  it('sets correct multiple push payload', async () => {
    githubFixture.context.eventName = 'push'
    githubFixture.context.payload = {
      commits: [{ message: 'some-message' }, { message: 'other-message' }]
    }
    inputs.pattern = 'some-pattern'
    inputs.error = 'some-error'
    const result: ICheckerArguments = await getInputs()
    expect(result.messages[0]).toBe('some-message')
    expect(result.messages[1]).toBe('other-message')
  })
})
