/**
 * Unit tests for IframeComm.
 * Tests postMessage communication with game iframes.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { IframeComm } from '../../src/installation/IframeComm.js'

describe('IframeComm - Initialization', () => {
  let comm

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (comm) {
      comm.destroy()
    }
  })

  test('constructor initializes empty state', () => {
    comm = new IframeComm()

    expect(comm.gameOverCallbacks).toEqual([])
    expect(comm.timeoutHandle).toBeNull()
    expect(comm.listening).toBe(false)
  })

  test('MESSAGE_TYPE constant is gameOver', () => {
    expect(IframeComm.MESSAGE_TYPE).toBe('gameOver')
  })

  test('DEFAULT_TIMEOUT is 15000ms', () => {
    expect(IframeComm.DEFAULT_TIMEOUT).toBe(15000)
  })
})

describe('IframeComm - Event Listening', () => {
  let comm

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
    vi.useRealTimers()
  })

  test('startListening registers message listener', () => {
    comm.startListening()

    expect(window.addEventListener).toHaveBeenCalledWith('message', comm.handleMessage)
    expect(comm.listening).toBe(true)
  })

  test('startListening sets up timeout', () => {
    comm.startListening(5000)

    expect(comm.timeoutHandle).not.toBeNull()
  })

  test('startListening uses default timeout', () => {
    comm.startListening()

    expect(comm.timeoutHandle).not.toBeNull()
  })

  test('startListening warns if already listening', () => {
    const warnSpy = vi.spyOn(console, 'warn')

    comm.startListening()
    warnSpy.mockClear()

    comm.startListening()

    expect(warnSpy).toHaveBeenCalledWith('IframeComm already listening')
  })

  test('startListening skips timeout if timeout is 0', () => {
    comm.startListening(0)

    expect(comm.timeoutHandle).toBeNull()
    expect(comm.listening).toBe(true)
  })

  test('stopListening removes message listener', () => {
    comm.startListening()

    comm.stopListening()

    expect(window.removeEventListener).toHaveBeenCalledWith('message', comm.handleMessage)
    expect(comm.listening).toBe(false)
  })

  test('stopListening clears timeout', () => {
    comm.startListening(5000)
    const timeoutHandle = comm.timeoutHandle

    comm.stopListening()

    expect(comm.timeoutHandle).toBeNull()
  })

  test('stopListening handles not listening gracefully', () => {
    expect(() => {
      comm.stopListening()
    }).not.toThrow()
  })
})

describe('IframeComm - Message Handling', () => {
  let comm, mockSource

  beforeEach(() => {
    mockSource = {
      postMessage: vi.fn()
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
    vi.useRealTimers()
  })

  test('handleMessage accepts valid gameOver message', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).toHaveBeenCalledWith(1000)
  })

  test('handleMessage ignores non-object data', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: 'not an object',
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage ignores wrong message type', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'otherType',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage rejects invalid payload', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver',
        payload: 'not an object'
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage rejects missing payload', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver'
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage rejects non-number score', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: '1000' }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage rejects negative score', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: -100 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('handleMessage accepts zero score', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 0 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback).toHaveBeenCalledWith(0)
  })

  test('handleMessage sends acknowledgment to source', () => {
    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(mockSource.postMessage).toHaveBeenCalledWith(
      { type: 'acknowledged' },
      '*'
    )
  })

  test('handleMessage clears timeout on valid message', () => {
    comm.startListening(5000)
    const timeoutHandle = comm.timeoutHandle

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(comm.timeoutHandle).toBeNull()
  })

  test('handleMessage stops listening after valid message', () => {
    comm.startListening()

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(comm.listening).toBe(false)
  })

  test('acknowledgment errors are caught gracefully', () => {
    mockSource.postMessage.mockImplementation(() => {
      throw new Error('postMessage failed')
    })

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    expect(() => {
      comm.handleMessage(event)
    }).not.toThrow()
  })
})

describe('IframeComm - Callback System', () => {
  let comm

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
  })

  test('onGameOver registers callback', () => {
    const callback = vi.fn()

    comm.onGameOver(callback)

    expect(comm.gameOverCallbacks).toHaveLength(1)
    expect(comm.gameOverCallbacks[0]).toBe(callback)
  })

  test('onGameOver rejects non-function', () => {
    comm.onGameOver('not a function')

    expect(comm.gameOverCallbacks).toHaveLength(0)
  })

  test('multiple callbacks all get triggered', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    comm.onGameOver(callback1)
    comm.onGameOver(callback2)
    comm.onGameOver(callback3)

    comm.triggerGameOverCallbacks(5000)

    expect(callback1).toHaveBeenCalledWith(5000)
    expect(callback2).toHaveBeenCalledWith(5000)
    expect(callback3).toHaveBeenCalledWith(5000)
  })

  test('callback errors do not stop other callbacks', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Callback error')
    })
    const goodCallback = vi.fn()

    comm.onGameOver(errorCallback)
    comm.onGameOver(goodCallback)

    comm.triggerGameOverCallbacks(3000)

    expect(errorCallback).toHaveBeenCalled()
    expect(goodCallback).toHaveBeenCalled()
  })

  test('offGameOver removes callback', () => {
    const callback = vi.fn()

    comm.onGameOver(callback)
    expect(comm.gameOverCallbacks).toHaveLength(1)

    comm.offGameOver(callback)
    expect(comm.gameOverCallbacks).toHaveLength(0)
  })

  test('offGameOver handles non-existent callback gracefully', () => {
    const callback = vi.fn()

    expect(() => {
      comm.offGameOver(callback)
    }).not.toThrow()
  })
})

describe('IframeComm - Timeout Handling', () => {
  let comm

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
    vi.useRealTimers()
  })

  test('timeout triggers after delay if no message received', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.startListening(5000)

    vi.advanceTimersByTime(5000)

    expect(callback).toHaveBeenCalledWith(null)
  })

  test('timeout stops listening', () => {
    comm.startListening(5000)

    vi.advanceTimersByTime(5000)

    expect(comm.listening).toBe(false)
  })

  test('timeout does not trigger if message received', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.startListening(5000)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: { postMessage: vi.fn() }
    }

    comm.handleMessage(event)
    callback.mockClear()

    vi.advanceTimersByTime(5000)

    // Should not be called again (already called with score 1000)
    expect(callback).not.toHaveBeenCalled()
  })

  test('triggerTimeout calls callbacks with null score', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.triggerTimeout()

    expect(callback).toHaveBeenCalledWith(null)
  })

  test('triggerTimeout handles callback errors', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Timeout callback error')
    })
    const goodCallback = vi.fn()

    comm.onGameOver(errorCallback)
    comm.onGameOver(goodCallback)

    expect(() => {
      comm.triggerTimeout()
    }).not.toThrow()

    expect(errorCallback).toHaveBeenCalled()
    expect(goodCallback).toHaveBeenCalled()
  })

  test('triggerTimeout stops listening', () => {
    comm.startListening(0)  // No timeout

    comm.triggerTimeout()

    expect(comm.listening).toBe(false)
  })
})

describe('IframeComm - Lifecycle Methods', () => {
  let comm

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.useFakeTimers()

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
    vi.useRealTimers()
  })

  test('reset stops listening', () => {
    comm.startListening()

    comm.reset()

    expect(comm.listening).toBe(false)
  })

  test('reset clears callbacks', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.reset()

    expect(comm.gameOverCallbacks).toEqual([])
  })

  test('destroy stops listening', () => {
    comm.startListening()

    comm.destroy()

    expect(comm.listening).toBe(false)
  })

  test('destroy clears callbacks', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.destroy()

    expect(comm.gameOverCallbacks).toEqual([])
  })

  test('destroy clears timeout', () => {
    comm.startListening(5000)

    comm.destroy()

    expect(comm.timeoutHandle).toBeNull()
  })
})

describe('IframeComm - Integration', () => {
  let comm, mockSource

  beforeEach(() => {
    mockSource = {
      postMessage: vi.fn()
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()

    comm = new IframeComm()
  })

  afterEach(() => {
    comm.destroy()
    vi.useRealTimers()
  })

  test('complete game over flow', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    // Start listening
    comm.startListening(10000)
    expect(comm.listening).toBe(true)

    // Receive game over message
    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 15000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    // Verify callback was called
    expect(callback).toHaveBeenCalledWith(15000)

    // Verify acknowledgment sent
    expect(mockSource.postMessage).toHaveBeenCalledWith(
      { type: 'acknowledged' },
      '*'
    )

    // Verify stopped listening
    expect(comm.listening).toBe(false)

    // Verify timeout cleared
    expect(comm.timeoutHandle).toBeNull()
  })

  test('timeout flow when no message received', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.startListening(5000)

    // Wait for timeout
    vi.advanceTimersByTime(5000)

    // Verify callback called with null
    expect(callback).toHaveBeenCalledWith(null)

    // Verify stopped listening
    expect(comm.listening).toBe(false)
  })

  test('multiple sessions with reset between', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    // Session 1
    comm.onGameOver(callback1)
    comm.startListening(5000)

    const event1 = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event1)
    expect(callback1).toHaveBeenCalledWith(1000)

    // Reset
    comm.reset()
    expect(comm.gameOverCallbacks).toHaveLength(0)

    // Session 2
    comm.onGameOver(callback2)
    comm.startListening(5000)

    const event2 = {
      data: {
        type: 'gameOver',
        payload: { score: 2000 }
      },
      source: mockSource
    }

    comm.handleMessage(event2)
    expect(callback2).toHaveBeenCalledWith(2000)
    expect(callback1).toHaveBeenCalledTimes(1)  // Not called again
  })

  test('one-shot behavior stops listening after first message', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.startListening()

    // First message
    const event1 = {
      data: {
        type: 'gameOver',
        payload: { score: 1000 }
      },
      source: mockSource
    }

    comm.handleMessage(event1)
    expect(callback).toHaveBeenCalledWith(1000)
    expect(comm.listening).toBe(false)

    // Verify event listener was removed (one-shot behavior)
    // No more messages will arrive from window because listener was removed
    expect(global.window.removeEventListener).toHaveBeenCalledWith('message', comm.handleMessage)
  })

  test('callback registration and removal during session', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    comm.onGameOver(callback1)
    comm.onGameOver(callback2)

    comm.startListening()

    // Remove callback1 before message
    comm.offGameOver(callback1)

    const event = {
      data: {
        type: 'gameOver',
        payload: { score: 5000 }
      },
      source: mockSource
    }

    comm.handleMessage(event)

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledWith(5000)
  })

  test('message validation prevents invalid data', () => {
    const callback = vi.fn()
    comm.onGameOver(callback)

    comm.startListening()

    const invalidMessages = [
      { data: null, source: mockSource },
      { data: 'string', source: mockSource },
      { data: { type: 'other' }, source: mockSource },
      { data: { type: 'gameOver' }, source: mockSource },
      { data: { type: 'gameOver', payload: null }, source: mockSource },
      { data: { type: 'gameOver', payload: { score: -1 } }, source: mockSource },
      { data: { type: 'gameOver', payload: { score: 'invalid' } }, source: mockSource }
    ]

    invalidMessages.forEach(msg => comm.handleMessage(msg))

    // None should trigger callback
    expect(callback).not.toHaveBeenCalled()

    // Should still be listening (no valid message received)
    expect(comm.listening).toBe(true)
  })
})
