You are a senior Next.js frontend developer and UI/UX engineer.

I need to refactor the Customer Reviews section on the homepage.

Current Situation:
- The review cards are currently hardcoded/static.
- I already have a custom Reviews API endpoint available.
- API Documentation:
  @API Documentation.md

Please analyze the existing Reviews section implementation and make the following changes.

Requirements
------------

1. Conditional Section Rendering

- If the Reviews API returns one or more reviews, display the Reviews section.
- If no reviews are returned, do not render the entire Reviews section.
- Avoid rendering empty containers, headings, or placeholders.

2. Replace Static Reviews with Dynamic Data

- Remove all hardcoded review data.
- Fetch review data from the custom Reviews API endpoint.
- Render reviews dynamically from the API response.

3. Support Multiple Review Types

The API may return:

A. Text Reviews
- Rating
- Review text
- Customer name
- Customer image (optional)

B. Image Reviews
- Rating
- Review image(s)
- Customer name
- Customer image (optional)

Rendering Logic:

- Always display the review rating.
- If review text exists, display the review text.
- If review text is empty but review image exists, display the image instead.
- If both text and image exist, prioritize displaying both in a clean layout.
- Handle missing fields gracefully.

4. Customer Information Area

Current card footer contains:
- Customer Name
- Location/Address
- Status Badge

Update this area:

Keep:
- Customer Name
- Customer Profile Image (if available)

Remove:
- Location / Address
- City
- Country
- Any location-related information
- Status badges

The footer should be simplified and cleaner.

5. Review Card UI Improvements

Review cards should:
- Have a consistent height
- Handle long text gracefully
- Support image reviews cleanly
- Be responsive on desktop, tablet, and mobile
- Avoid layout shifts

6. Loading & Error States

Add:
- Loading state while fetching reviews
- Error handling if API fails
- Empty state handling

7. Code Quality

- Use reusable components where appropriate.
- Follow existing project architecture.
- Keep styling consistent with the homepage design.
- Do not introduce breaking changes.

Deliverables
------------

1. Updated Reviews component
2. API integration implementation
3. Loading state implementation
4. Error handling implementation
5. Updated UI structure
6. Explanation of all changes made

Before implementing, first analyze the existing Reviews section code and explain what needs to be changed.