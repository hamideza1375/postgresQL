import { NextResponse } from 'next/server';
import client from 'prom-client';

// Create a registry for metrics
const register = new client.Registry();

// Add default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for HTTP requests
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000] // milliseconds
});

register.registerMetric(httpRequestDurationMicroseconds);

// Metric for database queries
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'table'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500]
});

register.registerMetric(dbQueryDuration);

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': register.contentType,
    },
  });
}