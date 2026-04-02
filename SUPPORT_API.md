# Support API Documentation

**Base URL:** `/api/v1/`  
**Authentication:** All endpoints (except `POST /support/contact`) require a valid session cookie.  
**XSRF Protection:** Include `X-XSRF-TOKEN` header (value from `Runnatics-XSRF-TOKEN` cookie).

---

## Table of Contents

1. [Get Support Counts](#1-get-support-counts)
2. [List Support Queries](#2-list-support-queries)
3. [Get Query by ID](#3-get-query-by-id)
4. [Update Query](#4-update-query)
5. [Add Comment](#5-add-comment)
6. [Send Comment Email](#6-send-comment-email)
7. [Delete Comment](#7-delete-comment)
8. [Submit Contact Us](#8-submit-contact-us)
9. [Get Query Types](#9-get-query-types)
10. [Get Admin Users](#10-get-admin-users)

---

## Data Models

### `SupportQueryCounts`
| Field          | Type     | Description                        |
|----------------|----------|------------------------------------|
| `total`        | `number` | Total queries across all statuses  |
| `newQuery`     | `number` | Count of "New Query" tickets       |
| `wip`          | `number` | Count of "WIP" tickets             |
| `closed`       | `number` | Count of "Closed" tickets          |
| `pending`      | `number` | Count of "Pending" tickets         |
| `notYetStarted`| `number` | Count of "Not Yet Started" tickets |
| `rejected`     | `number` | Count of "Rejected" tickets        |
| `duplicate`    | `number` | Count of "Duplicate" tickets       |

### `SupportQueryListItem`
| Field            | Type              | Description                              |
|------------------|-------------------|------------------------------------------|
| `id`             | `number`          | Unique ticket ID                         |
| `subject`        | `string`          | Ticket subject line                      |
| `submitterEmail` | `string`          | Email address of the person who submitted|
| `commentCount`   | `number`          | Total number of comments on the ticket   |
| `lastUpdated`    | `string`          | ISO 8601 datetime of last update         |
| `assignedToName` | `string \| null`  | Full name of assigned admin user         |
| `statusName`     | `string`          | Human-readable status label              |

### `SupportQueryDetail`
| Field              | Type                      | Description                              |
|--------------------|---------------------------|------------------------------------------|
| `id`               | `number`                  | Unique ticket ID                         |
| `subject`          | `string`                  | Ticket subject line                      |
| `body`             | `string`                  | Full ticket message body                 |
| `submitterEmail`   | `string`                  | Email of the submitter                   |
| `statusId`         | `number`                  | Numeric status ID (see Status Options)   |
| `statusName`       | `string`                  | Human-readable status label              |
| `assignedToUserId` | `number \| null`          | ID of the assigned admin user            |
| `assignedToName`   | `string \| null`          | Full name of the assigned admin user     |
| `queryTypeId`      | `number \| null`          | ID of the query type category            |
| `queryTypeName`    | `string \| null`          | Name of the query type category          |
| `createdAt`        | `string`                  | ISO 8601 creation datetime               |
| `updatedAt`        | `string`                  | ISO 8601 last update datetime            |
| `comments`         | `SupportQueryComment[]`   | Array of comments on this ticket         |

### `SupportQueryComment`
| Field              | Type             | Description                                |
|--------------------|------------------|--------------------------------------------|
| `id`               | `number`         | Unique comment ID                          |
| `commentText`      | `string`         | Text body of the comment                   |
| `ticketStatusId`   | `number`         | Status ID recorded when comment was added  |
| `ticketStatusName` | `string`         | Status label recorded when comment was added|
| `notificationSent` | `boolean`        | Whether email notification was sent        |
| `createdAt`        | `string`         | ISO 8601 creation datetime                 |
| `createdByName`    | `string \| null` | Full name of the admin who added the comment|

### `AdminUser`
| Field      | Type     | Description           |
|------------|----------|-----------------------|
| `id`       | `number` | Admin user ID         |
| `fullName` | `string` | Full display name     |

### `QueryTypeOption`
| Field  | Type     | Description           |
|--------|----------|-----------------------|
| `id`   | `number` | Query type ID         |
| `name` | `string` | Query type label      |

### Status Options
| ID | Name            |
|----|-----------------|
| 1  | New Query       |
| 2  | WIP             |
| 3  | Closed          |
| 4  | Pending         |
| 5  | Not Yet Started |
| 6  | Rejected        |
| 7  | Duplicate       |

---

## Endpoints

---

### 1. Get Support Counts

Returns the count of tickets grouped by status.

```
GET /api/v1/support/counts
```

**Input:** None

**Output:**
```json
{
  "total": 142,
  "newQuery": 12,
  "wip": 8,
  "closed": 98,
  "pending": 15,
  "notYetStarted": 4,
  "rejected": 3,
  "duplicate": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| See [`SupportQueryCounts`](#supportquerycounts) | | |

---

### 2. List Support Queries

Returns a paginated list of support queries with optional filters.

```
GET /api/v1/support
```

**Query Parameters (all optional):**

| Parameter          | Type     | Description                                      |
|--------------------|----------|--------------------------------------------------|
| `submitterEmail`   | `string` | Filter by submitter email (partial match)        |
| `statusId`         | `number` | Filter by status ID (see Status Options)         |
| `queryTypeId`      | `number` | Filter by query type ID                          |
| `assignedToUserId` | `number` | Filter by assigned admin user ID                 |
| `page`             | `number` | Page number, 1-based (default: `1`)              |
| `pageSize`         | `number` | Items per page (default: `10`, max: `50`)        |

**Example Request:**
```
GET /api/v1/support?statusId=1&page=1&pageSize=10
```

**Output:**
```json
{
  "items": [
    {
      "id": 42,
      "subject": "Cannot register for event",
      "submitterEmail": "user@example.com",
      "commentCount": 3,
      "lastUpdated": "2026-03-28T10:30:00Z",
      "assignedToName": "John Smith",
      "statusName": "New Query"
    }
  ],
  "totalCount": 142
}
```

| Field        | Type                      | Description                       |
|--------------|---------------------------|-----------------------------------|
| `items`      | `SupportQueryListItem[]`  | Array of query list items         |
| `totalCount` | `number`                  | Total matching records (for pagination) |

---

### 3. Get Query by ID

Returns full details of a single support query including all comments.

```
GET /api/v1/support/{id}
```

**Path Parameters:**

| Parameter | Type     | Description      |
|-----------|----------|------------------|
| `id`      | `number` | Ticket ID        |

**Input:** None

**Output:**
```json
{
  "id": 42,
  "subject": "Cannot register for event",
  "body": "I am trying to register for the 5K event but the page keeps timing out...",
  "submitterEmail": "user@example.com",
  "statusId": 2,
  "statusName": "WIP",
  "assignedToUserId": 7,
  "assignedToName": "John Smith",
  "queryTypeId": 3,
  "queryTypeName": "Technical Issue",
  "createdAt": "2026-03-25T08:00:00Z",
  "updatedAt": "2026-03-28T10:30:00Z",
  "comments": [
    {
      "id": 101,
      "commentText": "We are looking into this. The issue appears to be server-side.",
      "ticketStatusId": 2,
      "ticketStatusName": "WIP",
      "notificationSent": true,
      "createdAt": "2026-03-26T09:15:00Z",
      "createdByName": "John Smith"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| See [`SupportQueryDetail`](#supportquerydetail) | | |

---

### 4. Update Query

Updates the status, assigned user, and/or query type of a support ticket.

```
PUT /api/v1/support/{id}
```

**Path Parameters:**

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `id`      | `number` | Ticket ID   |

**Request Body:**
```json
{
  "statusId": 2,
  "assignedToUserId": 7,
  "queryTypeId": 3
}
```

| Field              | Type             | Required | Description                             |
|--------------------|------------------|----------|-----------------------------------------|
| `statusId`         | `number`         | Yes      | New status ID (see Status Options)      |
| `assignedToUserId` | `number \| null` | Yes      | Admin user ID, or `null` to unassign   |
| `queryTypeId`      | `number \| null` | Yes      | Query type ID, or `null` to clear      |

**Output:** `204 No Content` (empty body)

---

### 5. Add Comment

Adds a comment to a support ticket and optionally records the status transition.

```
POST /api/v1/support/{id}/comments
```

**Path Parameters:**

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `id`      | `number` | Ticket ID   |

**Request Body:**
```json
{
  "commentText": "We have resolved the issue on our end. Please try again.",
  "ticketStatusId": 3,
  "sendNotification": true
}
```

| Field              | Type      | Required | Description                                              |
|--------------------|-----------|----------|----------------------------------------------------------|
| `commentText`      | `string`  | Yes      | Comment message text                                     |
| `ticketStatusId`   | `number`  | Yes      | Status ID to record with this comment (see Status Options)|
| `sendNotification` | `boolean` | Yes      | If `true`, an email notification is queued to the submitter |

**Output:**
```json
{
  "id": 102,
  "commentText": "We have resolved the issue on our end. Please try again.",
  "ticketStatusId": 3,
  "ticketStatusName": "Closed",
  "notificationSent": false,
  "createdAt": "2026-03-28T11:00:00Z",
  "createdByName": "John Smith"
}
```

| Field | Type | Description |
|-------|------|-------------|
| See [`SupportQueryComment`](#supportquerycomment) | | |

> **Note:** `notificationSent` will be `false` immediately after creation. It becomes `true` once the email is dispatched via [Send Comment Email](#6-send-comment-email).

---

### 6. Send Comment Email

Sends an email notification to the ticket submitter for a specific comment. Can only be called once per comment.

```
POST /api/v1/support/comments/{commentId}/send-email
```

**Path Parameters:**

| Parameter   | Type     | Description |
|-------------|----------|-------------|
| `commentId` | `number` | Comment ID  |

**Request Body:** None

**Output:** `200 OK` (empty body)

> **Note:** If `notificationSent` is already `true` on the comment, this endpoint will return an error.

---

### 7. Delete Comment

Permanently deletes a comment from a support ticket.

```
DELETE /api/v1/support/comments/{commentId}
```

**Path Parameters:**

| Parameter   | Type     | Description |
|-------------|----------|-------------|
| `commentId` | `number` | Comment ID  |

**Input:** None

**Output:** `204 No Content` (empty body)

> **Warning:** This action is irreversible.

---

### 8. Submit Contact Us

Creates a new support ticket from the public Contact Us form. Does **not** require authentication.

```
POST /api/v1/support/contact
```

**Request Body:**
```json
{
  "subject": "Question about race registration",
  "body": "Hi, I wanted to ask about...",
  "submitterEmail": "runner@example.com"
}
```

| Field            | Type     | Required | Description                                     |
|------------------|----------|----------|-------------------------------------------------|
| `subject`        | `string` | Yes      | Brief subject of the query (non-empty)          |
| `body`           | `string` | Yes      | Full message body (non-empty)                   |
| `submitterEmail` | `string` | Yes      | Valid email address of the person submitting    |

**Output:** `200 OK` (empty body)

> The newly created ticket will appear in the admin list with status **New Query (ID: 1)**.

---

### 9. Get Query Types

Returns all available query type categories for classifying support tickets.

```
GET /api/v1/support/query-types
```

**Input:** None

**Output:**
```json
[
  { "id": 1, "name": "General Enquiry" },
  { "id": 2, "name": "Billing" },
  { "id": 3, "name": "Technical Issue" },
  { "id": 4, "name": "Account Access" }
]
```

| Field  | Type     | Description       |
|--------|----------|-------------------|
| `id`   | `number` | Query type ID     |
| `name` | `string` | Query type label  |

---

### 10. Get Admin Users

Returns all admin users available for assignment to support tickets.

```
GET /api/v1/users/admins
```

**Input:** None

**Output:**
```json
[
  { "id": 7,  "fullName": "John Smith" },
  { "id": 12, "fullName": "Sarah Connor" }
]
```

| Field      | Type     | Description       |
|------------|----------|-------------------|
| `id`       | `number` | Admin user ID     |
| `fullName` | `string` | Full display name |

---

## Error Responses

All endpoints return errors in the following shape:

```json
{
  "message": "A human-readable error description."
}
```

| HTTP Status | Meaning                                                        |
|-------------|----------------------------------------------------------------|
| `400`       | Bad Request — validation failed or required fields missing     |
| `401`       | Unauthorized — session invalid or expired                      |
| `403`       | Forbidden — insufficient permissions                           |
| `404`       | Not Found — ticket or comment ID does not exist                |
| `409`       | Conflict — e.g. email already sent for this comment            |
| `500`       | Internal Server Error — unexpected server-side failure         |

---

## Frontend Integration

| Service Method              | HTTP            | Endpoint                                   |
|-----------------------------|-----------------|--------------------------------------------|
| `SupportService.getCounts()`         | `GET`   | `/api/v1/support/counts`                   |
| `SupportService.getQueries(params)`  | `GET`   | `/api/v1/support`                          |
| `SupportService.getQueryById(id)`    | `GET`   | `/api/v1/support/{id}`                     |
| `SupportService.updateQuery(id, data)`| `PUT`  | `/api/v1/support/{id}`                     |
| `SupportService.addComment(id, data)`| `POST`  | `/api/v1/support/{id}/comments`            |
| `SupportService.sendCommentEmail(commentId)` | `POST` | `/api/v1/support/comments/{commentId}/send-email` |
| `SupportService.deleteComment(commentId)` | `DELETE` | `/api/v1/support/comments/{commentId}` |
| `SupportService.submitContactUs(data)`| `POST` | `/api/v1/support/contact`                  |
| `SupportService.getQueryTypes()`     | `GET`   | `/api/v1/support/query-types`              |
| `SupportService.getAdminUsers()`     | `GET`   | `/api/v1/users/admins`                     |

> Source: `src/main/src/services/SupportService.ts`  
> URL constants: `src/main/src/models/ServiceUrls.ts`
