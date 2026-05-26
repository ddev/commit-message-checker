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

import * as core from '@actions/core'
import * as inputHelper from './input-helper.js'
import * as commitMessageChecker from './commit-message-checker.js'

export async function run(): Promise<void> {
  try {
    const checkerArguments = await inputHelper.getInputs()
    if (checkerArguments.messages.length === 0) {
      core.info(`No commits found in the payload, skipping check.`)
    } else {
      await commitMessageChecker.checkCommitMessages(checkerArguments)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      throw error
    }
  }
}
