/**
 * Unit tests for VideoGradientRenderer.
 * Tests Video Gradient rendering using Canvas API patterns.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { VideoGradientRenderer } from '../../src/rendering/VideoGradientRenderer.js'
import { GoLEngine } from '../../src/core/GoLEngine.js'

describe('VideoGradientRenderer - Initialization', () => {
    let p5Mock, renderer, videoMock

    beforeEach(() => {
        videoMock = {
            hide: vi.fn(),
            loop: vi.fn(),
            volume: vi.fn(),
            elt: {} // Mock DOM element
        }

        // Mock p5.js instance
        p5Mock = {
            createVideo: vi.fn(() => videoMock),
            push: vi.fn(),
            pop: vi.fn(),
            noStroke: vi.fn(),
            drawingContext: {
                createPattern: vi.fn(() => 'mock-pattern'),
                fillStyle: null,
                fillRect: vi.fn()
            }
        }
    })

    test('constructor initializes with p5 instance', () => {
        renderer = new VideoGradientRenderer(p5Mock)
        expect(renderer.p5).toBe(p5Mock)
    })

    test('loads and configures video', () => {
        renderer = new VideoGradientRenderer(p5Mock)

        expect(p5Mock.createVideo).toHaveBeenCalledWith(['/videos/gradient.mp4'])
        expect(videoMock.hide).toHaveBeenCalled()
        expect(videoMock.loop).toHaveBeenCalled()
        expect(videoMock.volume).toHaveBeenCalledWith(0)
    })
})

describe('VideoGradientRenderer - renderMaskedGrid', () => {
    let p5Mock, renderer, engine, videoMock

    beforeEach(() => {
        videoMock = {
            hide: vi.fn(),
            loop: vi.fn(),
            volume: vi.fn(),
            elt: { tagName: 'VIDEO' }
        }

        p5Mock = {
            createVideo: vi.fn(() => videoMock),
            push: vi.fn(),
            pop: vi.fn(),
            noStroke: vi.fn(),
            drawingContext: {
                createPattern: vi.fn(() => 'mock-pattern'),
                fillStyle: null,
                fillRect: vi.fn()
            }
        }

        renderer = new VideoGradientRenderer(p5Mock)
        engine = new GoLEngine(5, 5, 10)
    })

    test('creates pattern from video element', () => {
        engine.setCell(2, 2, 1)
        renderer.renderMaskedGrid(engine, 0, 0, 10, {})

        expect(p5Mock.drawingContext.createPattern).toHaveBeenCalledWith(videoMock.elt, 'repeat')
        expect(p5Mock.drawingContext.fillStyle).toBe('mock-pattern')
    })

    test('uses native fillRect for alive cells', () => {
        engine.clearGrid()
        engine.setCell(1, 1, 1)
        engine.setCell(3, 3, 1)

        renderer.renderMaskedGrid(engine, 0, 0, 10, {})

        // Should call fillRect for each alive cell
        expect(p5Mock.drawingContext.fillRect).toHaveBeenCalledTimes(2)
    })

    test('calculates correct screen positions for fillRect', () => {
        engine.clearGrid()
        engine.setCell(2, 2, 1)

        renderer.renderMaskedGrid(engine, 100, 200, 30, {})

        // Should render at (100 + 2*30, 200 + 2*30) = (160, 260)
        expect(p5Mock.drawingContext.fillRect).toHaveBeenCalledWith(160, 260, 30, 30)
    })

    test('handles empty grid gracefully', () => {
        engine.clearGrid()

        expect(() => {
            renderer.renderMaskedGrid(engine, 0, 0, 10, {})
        }).not.toThrow()

        expect(p5Mock.drawingContext.fillRect).not.toHaveBeenCalled()
    })
})

describe('VideoGradientRenderer - Animation Control', () => {
    let p5Mock, renderer, videoMock

    beforeEach(() => {
        videoMock = {
            hide: vi.fn(),
            loop: vi.fn(),
            volume: vi.fn(),
            elt: {}
        }
        p5Mock = {
            createVideo: vi.fn(() => videoMock),
            drawingContext: {}
        }
        renderer = new VideoGradientRenderer(p5Mock)
    })

    test('play() calls video loop', () => {
        videoMock.loop.mockClear()
        renderer.play()
        expect(videoMock.loop).toHaveBeenCalled()
    })

    test('updateAnimation() is a no-op (video loops automatically)', () => {
        expect(() => {
            renderer.updateAnimation()
        }).not.toThrow()
    })
})

describe('VideoGradientRenderer - Shader Warmup', () => {
    let p5Mock, renderer, videoMock

    beforeEach(() => {
        videoMock = {
            hide: vi.fn(),
            loop: vi.fn(),
            volume: vi.fn(),
            elt: {
                readyState: HTMLMediaElement.HAVE_CURRENT_DATA,
                addEventListener: vi.fn()
            }
        }
        p5Mock = {
            createVideo: vi.fn(() => videoMock),
            drawingContext: {}
        }
        renderer = new VideoGradientRenderer(p5Mock)
    })

    test('waitForVideoReady resolves immediately if video ready', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        const promise = renderer.waitForVideoReady()
        await expect(promise).resolves.toBeUndefined()
    })

    test('waitForVideoReady waits for loadeddata event if not ready', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_NOTHING

        const promise = renderer.waitForVideoReady()

        // Verify event listener was added
        expect(videoMock.elt.addEventListener).toHaveBeenCalledWith(
            'loadeddata',
            expect.any(Function),
            { once: true }
        )

        // Simulate loadeddata event
        const callback = videoMock.elt.addEventListener.mock.calls[0][1]
        callback()

        await expect(promise).resolves.toBeUndefined()
    })

    test('warmupShaders waits for video ready', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        const waitSpy = vi.spyOn(renderer, 'waitForVideoReady')
        await renderer.warmupShaders([])

        expect(waitSpy).toHaveBeenCalled()
    })

    test('warmupShaders creates temporary canvas', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        // Mock document.createElement
        const mockCanvas = {
            width: 0,
            height: 0,
            getContext: vi.fn(() => ({
                createPattern: vi.fn(() => 'mock-pattern'),
                fillStyle: null,
                fillRect: vi.fn(),
                getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
            }))
        }
        const originalCreateElement = document.createElement
        document.createElement = vi.fn(() => mockCanvas)

        await renderer.warmupShaders([{ name: 'test' }])

        expect(document.createElement).toHaveBeenCalledWith('canvas')
        expect(mockCanvas.width).toBe(32)
        expect(mockCanvas.height).toBe(32)
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', { willReadFrequently: false })

        // Restore
        document.createElement = originalCreateElement
    })

    test('warmupShaders processes each gradient config', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        const mockContext = {
            createPattern: vi.fn(() => 'mock-pattern'),
            fillStyle: null,
            fillRect: vi.fn(),
            getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
        }
        const mockCanvas = {
            width: 32,
            height: 32,
            getContext: vi.fn(() => mockContext)
        }
        const originalCreateElement = document.createElement
        document.createElement = vi.fn(() => mockCanvas)

        const gradientConfigs = [
            { name: 'gradient1' },
            { name: 'gradient2' },
            { name: 'gradient3' }
        ]

        await renderer.warmupShaders(gradientConfigs)

        // Should create pattern for each gradient
        expect(mockContext.createPattern).toHaveBeenCalledTimes(3)
        expect(mockContext.getImageData).toHaveBeenCalledTimes(3)

        // Restore
        document.createElement = originalCreateElement
    })

    test('warmupShaders draws test pattern cells', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        const mockContext = {
            createPattern: vi.fn(() => 'mock-pattern'),
            fillStyle: null,
            fillRect: vi.fn(),
            getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
        }
        const mockCanvas = {
            width: 32,
            height: 32,
            getContext: vi.fn(() => mockContext)
        }
        const originalCreateElement = document.createElement
        document.createElement = vi.fn(() => mockCanvas)

        await renderer.warmupShaders([{ name: 'test' }])

        // Should draw 2×2 block pattern (4 cells alive in 4×4 grid)
        // Cells at (1,1), (2,1), (1,2), (2,2)
        expect(mockContext.fillRect).toHaveBeenCalledTimes(4)
        expect(mockContext.fillRect).toHaveBeenCalledWith(8, 8, 8, 8)   // (1,1)
        expect(mockContext.fillRect).toHaveBeenCalledWith(16, 8, 8, 8)  // (2,1)
        expect(mockContext.fillRect).toHaveBeenCalledWith(8, 16, 8, 8)  // (1,2)
        expect(mockContext.fillRect).toHaveBeenCalledWith(16, 16, 8, 8) // (2,2)

        // Restore
        document.createElement = originalCreateElement
    })

    test('warmupShaders handles empty gradient array', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        await expect(renderer.warmupShaders([])).resolves.toBeUndefined()
    })

    test('warmupShaders forces GPU flush with getImageData', async () => {
        videoMock.elt.readyState = HTMLMediaElement.HAVE_CURRENT_DATA

        const mockContext = {
            createPattern: vi.fn(() => 'mock-pattern'),
            fillStyle: null,
            fillRect: vi.fn(),
            getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
        }
        const mockCanvas = {
            width: 32,
            height: 32,
            getContext: vi.fn(() => mockContext)
        }
        const originalCreateElement = document.createElement
        document.createElement = vi.fn(() => mockCanvas)

        await renderer.warmupShaders([{ name: 'test' }])

        // Should call getImageData to flush GPU commands
        expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 1, 1)

        // Restore
        document.createElement = originalCreateElement
    })
})

describe('VideoGradientRenderer - getGradientColor', () => {
    let p5Mock, renderer, videoMock

    beforeEach(() => {
        videoMock = {
            hide: vi.fn(),
            loop: vi.fn(),
            volume: vi.fn(),
            elt: {
                videoWidth: 1920,
                videoHeight: 1080
            }
        }
        p5Mock = {
            createVideo: vi.fn(() => videoMock),
            drawingContext: {},
            width: 1200,
            height: 1920,
            frameCount: 1
        }
        renderer = new VideoGradientRenderer(p5Mock)
    })

    test('returns RGB array with 3 values', () => {
        const [r, g, b] = renderer.getGradientColor(100, 200)

        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(255)
        expect(g).toBeGreaterThanOrEqual(0)
        expect(g).toBeLessThanOrEqual(255)
        expect(b).toBeGreaterThanOrEqual(0)
        expect(b).toBeLessThanOrEqual(255)
    })

    test('uses lookup cache for performance', () => {
        // Mock lookup canvas and context
        const mockImageData = {
            data: new Uint8ClampedArray([255, 128, 64, 255])  // RGBA at (0,0)
        }
        renderer.lookupCtx = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => mockImageData)
        }

        // First call should update cache
        p5Mock.frameCount = 1
        renderer.getGradientColor(0, 0)
        expect(renderer.lookupCtx.drawImage).toHaveBeenCalledTimes(1)
        expect(renderer.lookupCtx.getImageData).toHaveBeenCalledTimes(1)

        // Second call in same frame should reuse cache
        renderer.getGradientColor(10, 10)
        expect(renderer.lookupCtx.drawImage).toHaveBeenCalledTimes(1)  // Still 1
        expect(renderer.lookupCtx.getImageData).toHaveBeenCalledTimes(1)  // Still 1
    })

    test('updates cache on new frame', () => {
        const mockImageData = {
            data: new Uint8ClampedArray([255, 128, 64, 255])
        }
        renderer.lookupCtx = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => mockImageData)
        }

        // Frame 1
        p5Mock.frameCount = 1
        renderer.getGradientColor(0, 0)
        expect(renderer.lookupCtx.drawImage).toHaveBeenCalledTimes(1)

        // Frame 2 - should update cache
        p5Mock.frameCount = 2
        renderer.getGradientColor(0, 0)
        expect(renderer.lookupCtx.drawImage).toHaveBeenCalledTimes(2)
    })

    test('maps screen coordinates to lookup texture correctly', () => {
        const mockImageData = {
            data: new Uint8ClampedArray(480 * 270 * 4)  // Full lookup texture
        }
        // Set specific color at known position
        const testX = 100  // Lookup coords
        const testY = 50
        const index = (testY * 480 + testX) * 4
        mockImageData.data[index] = 200      // R
        mockImageData.data[index + 1] = 150  // G
        mockImageData.data[index + 2] = 100  // B
        mockImageData.data[index + 3] = 255  // A

        renderer.lookupCtx = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => mockImageData)
        }
        renderer.cachedImageData = mockImageData

        // Screen coords that map to (100, 50) in lookup texture
        // lookupX = (screenX / 1200) * 480 = 100 → screenX = 250
        // lookupY = (screenY / 1920) * 270 = 50 → screenY = 355.55 ≈ 356
        const screenX = 250
        const screenY = 356

        const [r, g, b] = renderer.getGradientColor(screenX, screenY)
        expect(r).toBe(200)
        expect(g).toBe(150)
        expect(b).toBe(100)
    })
})
