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

import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import type { ICheckerArguments } from '../src/commit-message-checker.js'

jest.unstable_mockModule('@actions/core', () => core)

const { checkCommitMessages } = await import('../src/commit-message-checker.js')

describe('commit-message-checker tests', () => {
  it('requires pattern', async () => {
    const args: ICheckerArguments = {
      pattern: '',
      flags: '',
      error: '',
      messages: []
    }
    await expect(checkCommitMessages(args)).rejects.toThrow(
      'PATTERN not defined.'
    )
  })

  it('requires valid flags', async () => {
    const args: ICheckerArguments = {
      pattern: 'some-pattern',
      flags: 'abcdefgh',
      error: '',
      messages: []
    }
    await expect(checkCommitMessages(args)).rejects.toThrow(
      'FLAGS contains invalid characters "abcdefh".'
    )
  })

  it('requires error message', async () => {
    const args: ICheckerArguments = {
      pattern: 'some-pattern',
      flags: '',
      error: '',
      messages: []
    }
    await expect(checkCommitMessages(args)).rejects.toThrow(
      'ERROR not defined.'
    )
  })

  it('requires messages', async () => {
    const args: ICheckerArguments = {
      pattern: 'some-pattern',
      flags: '',
      error: 'some-error',
      messages: []
    }
    await expect(checkCommitMessages(args)).rejects.toThrow(
      'MESSAGES not defined.'
    )
  })

  it('check fails single message', async () => {
    const args: ICheckerArguments = {
      pattern: 'some-pattern',
      flags: '',
      error: 'some-error',
      messages: ['some-message']
    }
    await expect(checkCommitMessages(args)).rejects.toThrow('some-error')
  })

  it('check fails multiple messages', async () => {
    const args: ICheckerArguments = {
      pattern: 'some-pattern',
      flags: '',
      error: 'some-error',
      messages: ['some-message', 'some-pattern']
    }
    await expect(checkCommitMessages(args)).rejects.toThrow('some-error')
  })

  it('check succeeds on single message', async () => {
    const args: ICheckerArguments = {
      pattern: '.*',
      flags: '',
      error: 'some-error',
      messages: ['some-message']
    }
    await expect(checkCommitMessages(args)).resolves.toBeUndefined()
  })

  it('check succeeds on multiple messages', async () => {
    const args: ICheckerArguments = {
      pattern: '.*',
      flags: '',
      error: 'some-error',
      messages: ['some-message', 'other-message']
    }
    await expect(checkCommitMessages(args)).resolves.toBeUndefined()
  })
})
