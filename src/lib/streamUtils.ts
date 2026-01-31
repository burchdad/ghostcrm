/**
 * REAL-TIME STREAMING UTILITY
 * Manages Server-Sent Events connections and broadcasting
 */

// Track active connections
const activeConnections = new Set<WritableStreamDefaultWriter>();

// Function to broadcast updates to all connected clients
export function broadcastUpdate(data: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encodedMessage = encoder.encode(message);

  // Send to all active connections
  for (const writer of activeConnections) {
    writer.write(encodedMessage).catch(() => {
      // Remove failed connections
      activeConnections.delete(writer);
    });
  }
}

// Export for use in other modules
export { activeConnections };