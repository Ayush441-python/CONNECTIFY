# Connectify — Frontend, Backend & Product Quality Bounty

**Status:** Open for contributions  
**Project:** Connectify  
**Currency:** Indian Rupees (INR)  
**Bounty model:** Fixed rewards per accepted, verified contribution

Connectify is looking for contributors who can make the product feel polished, reliable, fast, secure, and ready for real users. This bounty covers frontend improvements, backend bug fixes, and end-to-end product quality.

> **Important:** Rewards below are proposed starting amounts. The maintainer must confirm the scope and reward before work begins. One issue cannot be claimed by multiple contributors unless the maintainer explicitly allows it.

---

## 1. Bounty Summary

| Category | Reward range |
|---|---:|
| Small UI/UX fix | ₹500–₹1,500 |
| Medium frontend improvement | ₹1,500–₹4,000 |
| Major frontend feature or page redesign | ₹4,000–₹10,000 |
| Small backend bug fix | ₹1,000–₹2,500 |
| Medium backend/API fix | ₹2,500–₹6,000 |
| Complex backend or data-integrity fix | ₹6,000–₹12,000 |
| Security or performance issue | ₹2,000–₹10,000 |
| Full end-to-end feature / substantial product polish | ₹10,000–₹20,000 |

**Suggested initial bounty pool: ₹50,000.**  
This is a planning budget, not a guaranteed payment or an automatic entitlement. Rewards are paid only for approved work, according to the acceptance criteria in this document.

---

## 2. Frontend Bounties

Help Connectify deliver a consistent, intuitive, responsive, and professional user experience.

### Eligible work

- Improve the visual design and consistency of existing pages.
- Fix broken layouts, spacing, typography, alignment, and component states.
- Make the website responsive on mobile, tablet, laptop, and large screens.
- Improve navigation, menus, forms, buttons, dialogs, and feedback states.
- Add useful loading, empty, success, and error states.
- Fix accessibility issues, including keyboard navigation, focus visibility, labels, and contrast.
- Improve perceived performance and eliminate unnecessary re-renders where practical.
- Remove dead UI, placeholder content, broken links, and inconsistent styling.
- Ensure forms validate input and show clear, actionable messages.

### Reward guidance

| Contribution | Suggested reward |
|---|---:|
| Small visual or responsive fix | ₹500–₹1,500 |
| Reusable component improvement | ₹1,500–₹3,000 |
| Complete page polish | ₹3,000–₹6,000 |
| Major page redesign or complex frontend flow | ₹6,000–₹10,000 |

### Frontend acceptance criteria

- The change works at common mobile, tablet, and desktop widths.
- Existing design patterns and the project's current tech stack are respected.
- No new console errors or broken interactions are introduced.
- Forms, buttons, navigation, and interactive states work as expected.
- Accessibility and usability are not made worse.
- Screenshots or a short recording are included for substantial visual changes.

---

## 3. Backend Bounties

Make the application stable, predictable, secure, and maintainable.

### Eligible work

- Reproduce and fix existing API or server-side bugs.
- Fix incorrect response codes, response formats, and error handling.
- Resolve authentication, authorization, and session-management defects.
- Fix validation, database queries, relationships, and data-integrity issues.
- Prevent duplicate submissions and unsafe repeated operations where relevant.
- Fix pagination, filtering, sorting, and search behavior.
- Improve file upload handling and validation where applicable.
- Resolve race conditions, timeouts, and reliability problems.
- Improve logging without exposing passwords, tokens, or personal data.
- Add or repair automated tests for affected backend behavior.
- Improve slow endpoints or inefficient database operations with evidence.

### Reward guidance

| Contribution | Suggested reward |
|---|---:|
| Small reproducible bug | ₹1,000–₹2,500 |
| API or validation fix | ₹2,500–₹4,000 |
| Authentication or data-integrity fix | ₹4,000–₹8,000 |
| Complex backend reliability/performance fix | ₹6,000–₹12,000 |

### Backend acceptance criteria

- The bug is reproducible before the fix or the improvement is demonstrated clearly.
- The fix addresses the root cause rather than hiding the symptom.
- Relevant tests are added or updated.
- Existing API contracts and expected behavior are preserved unless a change is agreed in advance.
- Sensitive information is not exposed in logs, responses, or error messages.
- Database changes include safe migrations or documented steps when needed.

---

## 4. Security & Performance

Security and performance findings are especially valuable. Report security issues privately to the maintainer; do not publish exploit details or access other users' data.

Examples include:

- Broken access control or authorization bypass.
- Exposure of secrets, credentials, or private user data.
- Injection vulnerabilities and unsafe input handling.
- Missing rate limits on sensitive endpoints.
- Insecure file upload or download behavior.
- Serious performance bottlenecks, memory leaks, or repeated expensive queries.

**Suggested rewards:** ₹2,000–₹10,000 depending on severity, impact, reproducibility, and fix complexity.

Do not perform destructive testing, denial-of-service testing, social engineering, or tests against systems/data you do not own or have permission to access.

---

## 5. Full Product Polish Bounty

A larger reward is available for a coordinated contribution that meaningfully improves Connectify end to end.

**Suggested reward: ₹10,000–₹20,000**

A qualifying submission should include several of the following:

- A cohesive and responsive frontend experience.
- Critical frontend and backend bugs fixed.
- Reliable loading, empty, success, and error states.
- Working primary user journeys from start to finish.
- Appropriate validation and access control.
- Automated tests for important flows.
- No major regressions in existing functionality.
- Clear setup, testing, and change documentation.

The maintainer will agree on the exact scope and reward before implementation begins.

---

## 6. How to Claim a Bounty

1. Review the repository and existing issues.
2. Open an issue describing the bug or proposed improvement.
3. Include reproduction steps, expected behavior, actual behavior, and screenshots/logs where useful.
4. Wait for maintainer approval and confirmation of the bounty amount.
5. Work on the approved issue in a separate branch.
6. Submit a pull request referencing the issue.
7. Explain the root cause, implementation, and how the change was tested.
8. Wait for review and acceptance.

**Do not begin substantial work until the maintainer has approved the issue and reward in writing.** This avoids duplicate effort and disagreements about scope or payment.

---

## 7. Pull Request Requirements

Every bounty pull request must:

- Have a clear title and reference the approved issue.
- Explain what changed and why.
- Include steps to reproduce the original issue when applicable.
- Include tests or a clear manual testing checklist.
- Include before/after screenshots for UI changes.
- Avoid unrelated refactors and unnecessary dependencies.
- Follow the repository's formatting, linting, and coding conventions.
- Never include API keys, passwords, tokens, private user data, or production secrets.
- Update documentation or environment examples if the change requires it.

---

## 8. Review & Payment

A bounty is eligible for payment when:

- The contribution matches the approved scope.
- The maintainer can reproduce and verify the result.
- Required tests pass, or any test limitations are documented and accepted.
- The pull request is merged or explicitly accepted by the maintainer.
- The contributor has complied with the project's security and contribution rules.

The maintainer should confirm the reward amount before work starts and communicate the payment method and expected payment date before accepting the contribution. Contributors are responsible for any applicable taxes or reporting obligations.

Rewards are not guaranteed for duplicate reports, already-known issues, unapproved work, incomplete submissions, or changes that do not meet the acceptance criteria.

---

## 9. Out of Scope

Unless explicitly approved, the following are not bounty-eligible:

- Cosmetic changes with no meaningful improvement.
- Reformatting or rewriting unrelated code.
- Features unrelated to Connectify's product goals.
- Changes that break existing functionality.
- Automated or AI-generated submissions without contributor review and testing.
- Vulnerability testing against third-party services or real user accounts.
- Issues already reported, fixed, or assigned to another contributor.

---

## 10. Contributor Checklist

Before submitting, confirm:

- [ ] I discussed the issue and received approval.
- [ ] The bounty amount and scope were confirmed.
- [ ] I tested the change locally.
- [ ] I added or updated relevant tests.
- [ ] I checked responsive behavior for frontend changes.
- [ ] I checked logs and responses for accidental secret or personal-data exposure.
- [ ] I documented setup or migration changes.
- [ ] My pull request is focused and clearly explained.

---

## 11. Maintainer Configuration

Before publishing this bounty, the Connectify maintainer should fill in:

- **Repository:** Add the official repository link.
- **Issue tracker:** Add the approved issue tracker link.
- **Contact:** Add a maintainer contact or security-reporting channel.
- **Payment method:** State the supported payment method(s).
- **Payment schedule:** State when accepted bounties are paid.
- **Contribution rules:** Link the project's `CONTRIBUTING.md` and code of conduct, if available.

---

**Goal:** Make Connectify feel like a complete product—not just a website that works, but one that is polished, dependable, secure, and pleasant to use.
