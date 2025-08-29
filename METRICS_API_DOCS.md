# Metrics API Documentation

This document describes the GET /metrics endpoint that provides comprehensive API usage statistics.

## Endpoint

### GET /metrics

Returns a JSON summary with API usage statistics including total requests, average response time, and most consulted endpoint.

**Authentication**: Not required (public endpoint)

## Response Format

### Success Response (200 OK)

```json
{
  "summary": {
    "totalRequests": 1247,
    "averageResponseTime": 12,
    "mostConsultedEndpoint": {
      "endpoint": "GET /users",
      "requests": 423,
      "averageResponseTime": 10
    }
  },
  "endpointDetails": [
    {
      "endpoint": "GET /users",
      "requests": 423,
      "averageResponseTime": 10,
      "percentage": 34
    },
    {
      "endpoint": "GET /users/:id",
      "requests": 312,
      "averageResponseTime": 11,
      "percentage": 25
    },
    {
      "endpoint": "POST /auth/login",
      "requests": 198,
      "averageResponseTime": 15,
      "percentage": 16
    }
  ],
  "metadata": {
    "generatedAt": "2025-07-31T10:30:00.000Z",
    "description": "API usage metrics and statistics"
  }
}
```

## Response Fields

### Summary Object

- **totalRequests** (number): Total number of API requests processed
- **averageResponseTime** (number): Average response time across all requests in milliseconds
- **mostConsultedEndpoint** (object|null): Details about the most frequently accessed endpoint
  - **endpoint** (string): The endpoint path and HTTP method
  - **requests** (number): Number of requests to this endpoint
  - **averageResponseTime** (number): Average response time for this endpoint in milliseconds

### Endpoint Details Array

Array of endpoint statistics, sorted by request count (descending):

- **endpoint** (string): The endpoint path and HTTP method
- **requests** (number): Number of requests to this endpoint
- **averageResponseTime** (number): Average response time for this endpoint in milliseconds
- **percentage** (number): Percentage of total requests for this endpoint

### Metadata Object

- **generatedAt** (string): ISO 8601 timestamp when metrics were generated
- **description** (string): Description of the metrics data

## Request Examples

### Basic request

```bash
curl -X GET "http://localhost:3000/metrics"
```

### With pretty-printed JSON

```bash
curl -X GET "http://localhost:3000/metrics" | jq
```

## Data Sources

The metrics endpoint uses simulated data that includes:

- **Total Requests**: Currently simulated at 1,247 requests
- **Response Times**: Realistic response times between 1-50ms
- **Endpoint Coverage**: Statistics for common API endpoints:
  - GET /users (most popular)
  - POST /users
  - GET /users/:id
  - POST /auth/login
  - GET /auth/profile
  - GET /metrics

## Features

### 🔢 **Total Requests Count**

Tracks the cumulative number of API requests across all endpoints.

### ⏱️ **Average Response Time**

Calculates the mean response time across all API calls, helping identify performance trends.

### 🏆 **Most Consulted Endpoint**

Identifies the most frequently accessed endpoint with its usage statistics.

### 📊 **Detailed Endpoint Statistics**

Provides comprehensive statistics for each endpoint including:

- Request count
- Average response time
- Usage percentage

### 📅 **Real-time Timestamps**

Each metrics response includes the exact generation timestamp.

## Optional Real-time Tracking

The implementation includes an optional `trackMetrics` middleware that can be enabled for real-time metrics collection:

```javascript
// In app.js - uncomment to enable real-time tracking
app.use(trackMetrics);
```

When enabled, this middleware:

- Tracks response times for each request
- Updates endpoint-specific statistics
- Increments total request counters
- Provides accurate real-time metrics

## Use Cases

### 📈 **Performance Monitoring**

Monitor API response times and identify slow endpoints.

### 📊 **Usage Analytics**

Understand which endpoints are most popular and plan capacity accordingly.

### 🔍 **Debugging Support**

Identify problematic endpoints with high response times or unusual usage patterns.

### 📋 **Reporting**

Generate usage reports for stakeholders and API consumers.

## Example Integrations

### Dashboard Display

```javascript
fetch("/metrics")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("total-requests").textContent =
      data.summary.totalRequests;
    document.getElementById("avg-response-time").textContent =
      data.summary.averageResponseTime + "ms";
    document.getElementById("popular-endpoint").textContent =
      data.summary.mostConsultedEndpoint?.endpoint || "N/A";
  });
```

### Monitoring Alert

```javascript
fetch("/metrics")
  .then((response) => response.json())
  .then((data) => {
    if (data.summary.averageResponseTime > 100) {
      console.warn(
        "High average response time detected:",
        data.summary.averageResponseTime + "ms"
      );
    }
  });
```

## Error Responses

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An error occurred while generating metrics"
}
```

## Implementation Notes

- **Simulated Data**: Current implementation uses static/simulated data for demonstration
- **Performance**: Metrics calculation is optimized for fast response times
- **Scalability**: Ready for integration with real monitoring systems (Prometheus, DataDog, etc.)
- **Memory Usage**: Minimal memory footprint with efficient data structures

## Future Enhancements

Potential improvements for production use:

- Database persistence for historical metrics
- Time-based filtering (last hour, day, week)
- Error rate tracking
- Geographic distribution statistics
- Custom metric definitions
- Export capabilities (CSV, JSON)

This metrics endpoint provides essential insights into API usage patterns and performance characteristics, enabling data-driven optimization and monitoring decisions.
