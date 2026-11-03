# PRD 1 — Custom Review System for Headless WooCommerce API Plugin

## Project Overview

This PRD defines the implementation plan for building a scalable custom product review system inside the existing custom Headless WooCommerce API integration plugin.

The goal is to:

- Replace or bypass native WooCommerce review limitations
- Provide scalable review APIs for headless commerce
- Support advanced review functionality
- Keep WooCommerce product compatibility
- Support Next.js frontend consumption
- Maintain SEO-friendly rating aggregation

This implementation MUST follow the existing plugin architecture and coding standards.

---

# Objectives

## Primary Objectives

- Create a scalable custom review system
- Build dedicated REST API endpoints
- Support verified buyer reviews
- Support rating aggregation
- Support review media uploads
- Support review filtering and sorting
- Support moderation workflow
- Provide optimized APIs for Next.js frontend

---

# Existing System Context

## Existing Stack

| Layer | Technology |
|---|---|
| CMS | WordPress |
| Ecommerce | WooCommerce |
| Plugin | Custom Headless API Plugin |
| Frontend | Next.js |
| API | WP REST API |

---

# Architecture Overview

```txt
Next.js Frontend
        ↓
Custom Review REST API
        ↓
Custom Review Service Layer
        ↓
Custom Review Database Tables
        ↓
WooCommerce Product Sync
        ↓
Cache + Aggregates
```

---

# Database Architecture

## Custom Tables

The system MUST use dedicated review tables.

Native wp_comments MUST NOT be used for primary review storage.

---

## Table: wp_custom_product_reviews

### Purpose
Stores all review records.

### Columns

| Column | Type |
|---|---|
| id | BIGINT UNSIGNED |
| product_id | BIGINT UNSIGNED |
| user_id | BIGINT UNSIGNED |
| order_id | BIGINT UNSIGNED |
| reviewer_name | VARCHAR(255) |
| reviewer_email | VARCHAR(255) |
| rating | TINYINT |
| title | VARCHAR(255) |
| content | LONGTEXT |
| status | VARCHAR(50) |
| verified | TINYINT |
| helpful_count | INT |
| unhelpful_count | INT |
| created_at | DATETIME |
| updated_at | DATETIME |

---

## Table: wp_custom_review_media

### Purpose
Stores review media attachments.

### Columns

| Column | Type |
|---|---|
| id | BIGINT UNSIGNED |
| review_id | BIGINT UNSIGNED |
| attachment_id | BIGINT UNSIGNED |
| media_url | TEXT |
| media_type | VARCHAR(50) |
| created_at | DATETIME |

---

## Table: wp_custom_review_votes

### Purpose
Stores helpful/unhelpful votes.

### Columns

| Column | Type |
|---|---|
| id | BIGINT UNSIGNED |
| review_id | BIGINT UNSIGNED |
| user_id | BIGINT UNSIGNED |
| vote_type | VARCHAR(20) |
| created_at | DATETIME |

---

## Table: wp_custom_review_aggregates

### Purpose
Stores precalculated rating aggregates.

### Columns

| Column | Type |
|---|---|
| product_id | BIGINT UNSIGNED |
| average_rating | DECIMAL(3,2) |
| total_reviews | INT |
| total_ratings | INT |
| rating_1 | INT |
| rating_2 | INT |
| rating_3 | INT |
| rating_4 | INT |
| rating_5 | INT |
| updated_at | DATETIME |

---

# Plugin Structure Requirements

Implementation MUST follow existing plugin structure.

## Recommended Structure

```txt
plugin-root/
├── includes/
│   ├── api/
│   │   └── reviews/
│   ├── database/
│   ├── services/
│   ├── repositories/
│   ├── hooks/
│   ├── admin/
│   ├── frontend/
│   └── helpers/
├── assets/
└── templates/
```

---

# REST API Requirements

## Base Namespace

```txt
/wp-json/headless/v1/reviews
```

---

# API Endpoints

## Create Review

### Endpoint

```txt
POST /reviews/create
```

### Features

- Validate rating
- Validate product
- Validate purchase history
- Sanitize content
- Support media upload
- Prevent duplicate reviews
- Trigger moderation workflow

### Request Payload

```json
{
  "product_id": 123,
  "rating": 5,
  "title": "Amazing Product",
  "content": "This product is excellent",
  "media": []
}
```

---

## Get Product Reviews

### Endpoint

```txt
GET /reviews/product/{product_id}
```

### Features

- Pagination
- Sorting
- Filtering
- Media support
- Verified badge support

### Query Parameters

| Parameter | Description |
|---|---|
| page | Current page |
| per_page | Reviews per page |
| sort | Sorting option |
| rating | Rating filter |
| verified | Verified only |
| media | Media only |

---

## Vote Review

### Endpoint

```txt
POST /reviews/vote
```

### Features

- Helpful vote
- Unhelpful vote
- Prevent duplicate voting

---

## Upload Review Media

### Endpoint

```txt
POST /reviews/media/upload
```

### Features

- Image upload
- Video upload
- MIME validation
- File size restriction
- Malware protection

---

## Delete Review

### Endpoint

```txt
DELETE /reviews/{review_id}
```

---

# Business Logic Requirements

# Purchase Verification

The system MUST verify product purchase.

## Verification Logic

- Match product ID
- Match customer email
- Match customer user ID
- Match completed orders only

---

# Moderation Workflow

## Review Statuses

| Status |
|---|
| pending |
| approved |
| rejected |
| spam |

---

# Aggregate Rating Engine

## Requirements

The system MUST:

- Precalculate averages
- Store aggregate counts
- Avoid live recalculation
- Update aggregates after review changes

---

# Review Sorting Requirements

Supported sorting:

| Sort Type |
|---|
| newest |
| oldest |
| highest_rating |
| lowest_rating |
| most_helpful |
| verified_first |
| media_first |

---

# Filtering Requirements

Supported filters:

| Filter |
|---|
| rating |
| verified |
| media |
| date |
| helpful |

---

# Media Requirements

## Supported Media Types

| Type |
|---|
| jpg |
| png |
| webp |
| mp4 |

---

## Upload Restrictions

| Restriction | Value |
|---|---|
| Max image size | 5MB |
| Max video size | 25MB |
| Max files per review | 5 |

---

# WooCommerce Compatibility

The system MUST sync:

| WooCommerce Meta |
|---|
| _average_rating |
| _review_count |
| _rating_count |

This preserves:

- SEO schema
- Theme compatibility
- Product star ratings
- Existing integrations

---

# Performance Requirements

## Requirements

- Use dedicated DB indexes
- Use object caching
- Avoid heavy JOIN queries
- Use aggregate tables
- Paginate all review APIs
- Use lazy loading for media

---

# Security Requirements

## API Security

- Nonce validation
- Rate limiting
- Sanitization
- Permission checks
- Spam detection
- File validation

---

# Admin Panel Requirements

## Admin Menu

```txt
WooCommerce → Custom Reviews
```

---

## Features

- Review moderation
- Media management
- Spam management
- Aggregate analytics
- Rating analytics
- Bulk actions

---

# Hooks & Extensibility

## Custom Actions

```php
headless_reviews_before_create
headless_reviews_after_create
headless_reviews_after_approve
headless_reviews_after_delete
```

---

## Custom Filters

```php
headless_reviews_prepare_response
headless_reviews_query_args
headless_reviews_permissions
```

---

# SEO Requirements

## Structured Data

The API MUST expose:

- AggregateRating
- Review schema
- Rating counts

---

# Caching Requirements

## Cache Strategy

| Layer | Cache |
|---|---|
| Product aggregates | Redis/Object Cache |
| Review lists | Transients/Redis |
| Media metadata | Object Cache |

---

# Error Handling

## Standard API Errors

| Error |
|---|
| invalid_product |
| already_reviewed |
| invalid_rating |
| unauthorized |
| upload_failed |
| spam_detected |

---

# Future Expansion

Future-ready architecture MUST support:

- AI review summaries
- Review translation
- Review reactions
- Question & Answer system
- Review badges
- Sentiment analysis
- External review sync

---

# Deliverables

## Backend Deliverables

- Custom DB schema
- Review REST APIs
- Aggregate engine
- Media upload system
- Admin moderation panel
- WooCommerce compatibility sync
- Cache layer
- API documentation



# PRD 2 — Next.js Integration for Custom Review System

# Project Overview

This PRD defines how the custom review system will be implemented inside the existing Next.js headless storefront.

The implementation MUST follow the existing Next.js architecture and UI patterns.

---

# Objectives

## Primary Objectives

- Consume custom review APIs
- Build scalable review UI
- Support filtering and sorting
- Support media reviews
- Support review submission
- Support review voting
- Optimize frontend performance
- Maintain SEO compatibility

---

# Existing Frontend Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| UI | React |
| API | REST API |
| State | Existing app state system |
| Styling | Existing design system |

---

# Frontend Architecture

```txt
Product Page
     ↓
Review Components
     ↓
Review API Layer
     ↓
Custom Headless API
```

---

# Directory Structure Requirements

Implementation MUST follow existing project structure.

## Recommended Structure

```txt
src/
├── components/
│   ├── reviews/
│   ├── review-form/
│   ├── review-media/
│   └── review-filters/
├── services/
│   └── reviews/
├── hooks/
├── store/
├── types/
└── utils/
```

---

# Required Frontend Components

# Review List Component

## Responsibilities

- Render reviews
- Render pagination
- Render sorting
- Render filtering
- Render media gallery

---

# Review Card Component

## Responsibilities

- Display rating
- Display reviewer info
- Display verified badge
- Display media
- Display helpful votes
- Display timestamps

---

# Review Form Component

## Responsibilities

- Rating selection
- Review submission
- Media upload
- Validation
- Loading states
- Error handling

---

# Review Filter Component

## Supported Filters

| Filter |
|---|
| rating |
| verified |
| media |
| sort |

---

# Review Media Gallery

## Features

- Image preview
- Video preview
- Lightbox support
- Lazy loading

---

# API Integration Layer

## Service Layer

Example:

```txt
services/reviews/review.service.ts
```

---

# Required API Methods

| Method |
|---|
| getProductReviews |
| createReview |
| uploadReviewMedia |
| voteReview |
| deleteReview |

---

# API Response Shape

## Product Reviews Response

```json
{
  "reviews": [],
  "pagination": {},
  "aggregates": {
    "average_rating": 4.8,
    "total_reviews": 125,
    "distribution": {}
  }
}
```

---

# State Management Requirements

The review system MUST:

- Avoid unnecessary re-renders
- Support optimistic updates
- Cache review lists
- Support pagination state
- Support filter state

---

# UX Requirements

# Loading States

Required loading states:

- Skeleton loaders
- Media upload progress
- Button loading states
- Pagination loading states

---

# Error States

Required error states:

- Failed uploads
- Validation errors
- Network failures
- Unauthorized submission

---

# Empty States

Examples:

```txt
No reviews yet
Be the first reviewer
```

---

# Performance Requirements

## Requirements

- Lazy load review images
- Infinite scroll optional
- Virtualized lists optional
- API caching
- Debounced filtering
- Avoid duplicate requests

---

# SEO Requirements

## Structured Data

Frontend MUST support:

- AggregateRating schema
- Review schema
- SSR-compatible metadata

---

# Accessibility Requirements

## Requirements

- Keyboard navigation
- Screen reader labels
- Accessible star ratings
- Accessible media previews

---

# Mobile Requirements

## Mobile Features

- Responsive review cards
- Swipeable media gallery
- Mobile upload support
- Optimized touch interactions

---

# Authentication Requirements

## Auth Flow

The frontend MUST support:

- Logged-in reviews
- Guest reviews (optional)
- Token authentication
- Session persistence

---

# Media Upload Flow

```txt
Select Media
      ↓
Preview Media
      ↓
Upload API
      ↓
Temporary Upload State
      ↓
Attach to Review
      ↓
Submit Review
```

---

# Review Submission Flow

```txt
Open Form
    ↓
Select Rating
    ↓
Write Review
    ↓
Upload Media
    ↓
Submit Review
    ↓
API Validation
    ↓
Success/Error State
    ↓
Refresh Review List
```

---

# Product Page Requirements

## Required Sections

| Section |
|---|
| Review summary |
| Average rating |
| Rating distribution |
| Review filters |
| Review list |
| Review form |
| Media gallery |

---

# Rating Summary UI

## Features

- Average rating display
- Total review count
- Rating breakdown bars
- Verified review count

---

# Review Voting UX

## Features

- Helpful button
- Prevent duplicate votes
- Real-time count updates

---

# Cache Strategy

## Frontend Cache

| Layer | Strategy |
|---|---|
| API data | SWR/React Query |
| Media | CDN |
| Review aggregates | Cached API |

---

# Analytics Requirements

Track:

- Review submissions
- Helpful votes
- Media uploads
- Filter usage
- Review engagement

---

# Error Handling Requirements

## Required Handling

- API failures
- Upload failures
- Timeout handling
- Retry logic
- Validation messaging

---

# Security Requirements

## Frontend Security

- Sanitize user-generated content
- Validate uploads
- Secure token storage
- Prevent XSS rendering

---

# Future Expansion Support

Frontend architecture MUST support:

- AI summaries
- Review translation
- Video reviews
- Review reactions
- Q&A system
- Customer badges
- Infinite scrolling

---

# Deliverables

## Frontend Deliverables

- Review components
- API service layer
- Review form system
- Media upload system
- Review filtering UI
- Review sorting UI
- Rating summary UI
- SEO integration
- Mobile optimization
- Accessibility support

