export interface MockWebSocketOptions {
  autoRespond?: boolean
  responseDelay?: number
}

export class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  private options: MockWebSocketOptions
  private responseTimeout: NodeJS.Timeout | null = null

  constructor(url: string, options: MockWebSocketOptions = {}) {
    this.url = url
    this.options = {
      autoRespond: true,
      responseDelay: 1000,
      ...options,
    }

    // Simulate connection delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event("open"))
      }
      console.log("[v0] Mock WebSocket connected")
    }, 100)
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      console.warn("[v0] Mock WebSocket not open, message queued")
      return
    }

    console.log("[v0] Mock WebSocket sent:", data)

    // Auto-respond with a mock message if enabled
    if (this.options.autoRespond) {
      this.responseTimeout = setTimeout(() => {
        this.simulateIncomingMessage(data)
      }, this.options.responseDelay)
    }
  }

  close() {
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout)
    }

    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent("close"))
    }
    console.log("[v0] Mock WebSocket closed")
  }

  private simulateIncomingMessage(originalData: string) {
    try {
      const originalMessage = JSON.parse(originalData)

      // Create a mock response
      const mockResponse = {
        id: crypto.randomUUID(),
        content: this.generateMockResponse(originalMessage.content),
        timestamp: new Date(),
        sender: "Assistant",
        type: "system",
      }

      if (this.onmessage) {
        this.onmessage(
          new MessageEvent("message", {
            data: JSON.stringify(mockResponse),
          }),
        )
      }
    } catch (error) {
      console.warn("[v0] Failed to parse message for mock response:", error)
    }
  }

  private generateMockResponse(userMessage: string): string {
    const responses = [
      "Thanks for your message! This is a demo response.",
      'I received your message: "' + userMessage + '"',
      "This is a mock WebSocket response for testing purposes.",
      "Your message has been processed successfully!",
      "Hello! This chat is running in demo mode.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }
}
