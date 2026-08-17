# Welleni — Personal Data Breach Runbook

**Status: FOR LEGAL REVIEW.** This runbook was drafted by an engineering-level DPDP
compliance audit, not by a lawyer. The legal timelines below were verified against public
summaries of the Digital Personal Data Protection Rules, 2025 (Rule 7) as of August 2026,
but **must be confirmed with counsel** before you rely on them operationally, and kept
current — the DPDP Act's substantive obligations (including breach notification) are on a
phased rollout, with full enforcement expected by ~May 2027. Building this now, while
enforcement is still ramping up, is the cheap time to do it — waiting until a breach
happens, or until the deadline, is not.

Owner: **[LEGAL REVIEW: name the person accountable for running this — likely you, the
founder, until you have a dedicated security/compliance hire.]**

---

## 1. What counts as a "personal data breach" here

Any unauthorised access, disclosure, loss, alteration, or destruction of personal data
processed by Welleni. Given what this codebase actually collects (see `DPDP_PROGRESS.md`),
realistic scenarios include:

- The Supabase anon key (public by design) being paired with weak/absent Row Level
  Security, allowing an outsider to read the `patients` or `hospitals` tables directly
- The hardcoded Fast2SMS API key being scraped from the client bundle and abused (SMS
  pumping fraud) — a security incident, and a data-exposure risk if it lets someone flood
  real users' phones
- A lost/stolen device or leaked credential giving someone access to the Supabase project
  dashboard (service-role key, not just anon key)
- A bug that returns one user's data (health records, appointments) to another user
- A third-party vendor (Supabase, Razorpay, Fast2SMS) itself suffering a breach that
  exposes Welleni user data they hold

## 2. Immediate response timeline

| When | Action | Who |
|---|---|---|
| **On discovery (T+0)** | Contain: rotate the exposed credential/key, disable the affected endpoint/account, or take the affected feature offline if needed. Do not wait for a full investigation to contain. | Founder / whoever's on call |
| **As soon as possible, "without delay"** | Notify the **Data Protection Board of India** and any affected users, per Rule 7 of the DPDP Rules, 2025. This is not a "wait 72 hours" grace period — the initial notice goes out as soon as you reasonably can. | Founder |
| **Within 72 hours of becoming aware** (or longer if the Board grants an extension on written request) | Submit a **detailed follow-up report** to the Data Protection Board: nature/extent/timing/location of the breach, root cause, remedial steps taken, and — where known — who caused it. | Founder + counsel |
| **Ongoing** | Keep affected users updated if the picture changes; document everything for the Board and for your own record. | Founder |

**Related, separate obligation to check with counsel:** CERT-In's cybersecurity incident
reporting rules require certain categories of incidents to be reported to CERT-In within
**6 hours** of detection — this is a different regulator with a different (shorter) clock
than the DPDP Board notification above. `[LEGAL REVIEW: confirm whether Welleni's incidents
would fall under CERT-In's mandatory reporting categories.]`

## 3. Step-by-step response process

1. **Detect & triage** — Whoever notices (error alert, user report, vendor notice) escalates
   immediately to the founder. Log the time of discovery — this starts the clock.
2. **Contain** — Rotate leaked keys/passwords, revoke sessions, take down the affected
   feature if needed. Preserve logs before they roll over; don't "clean up" evidence yet.
3. **Assess scope** — What data, how many users, what categories (is health data
   involved? that raises the stakes). Use the data map in `DPDP_PROGRESS.md` /
   `page-privacy` to figure out what tables/fields could be affected.
4. **Notify the Data Protection Board of India** — without delay, per Rule 7.
   `[LEGAL REVIEW: confirm the current notification channel/portal for the Board, as this
   is a new body and the process may still be settling.]`
5. **Notify affected users** — without delay, in clear plain language (template below).
6. **File the detailed 72-hour report** to the Board (template below).
7. **Remediate** — fix the root cause, not just the symptom.
8. **Post-incident review** — write up what happened and what changes as a result; keep it
   with the consent/DSR records for audit purposes.

## 4. Notification templates

### 4a. Data Protection Board of India — initial notice ("without delay")

```
Subject: Personal Data Breach Notification — Welleni

Data Fiduciary: Welleni [LEGAL REVIEW: full registered entity name & address]
Date/time of discovery: [ISO timestamp]
Nature of breach (brief): [what happened, in one or two sentences]
Categories of personal data involved: [e.g. names, mobiles, emails, health records]
Approximate number of Data Principals affected: [number or best estimate]
Immediate containment steps taken: [what you've already done]
Point of contact for follow-up: [Grievance Officer name, email, phone]

A detailed follow-up report will be submitted within 72 hours of discovery, or such
longer period as the Board may permit.
```

### 4b. Data Protection Board of India — detailed 72-hour follow-up report

```
Subject: Personal Data Breach — Detailed Report (Follow-up to notice dated [date])

1. Description of the breach: nature, extent, timing and location of occurrence
2. Root cause / how it happened
3. Categories and approximate number of Data Principals and personal data records affected
4. Remedial measures taken to date, and mitigation measures to prevent recurrence
5. Findings regarding the person(s) who caused the breach, if known
6. Confirmation of notifications sent to affected Data Principals (date, channel, content)
7. Point of contact: [Grievance Officer name, email, phone]
```

### 4c. Affected user notice (plain language, DPDP-required content)

```
Subject: Important: a security incident affected your Welleni account

Hi [name],

We're writing to let you know about a data security incident that may have affected
some of your personal information on Welleni.

What happened: [plain-language description — nature, timing]
What information was involved: [be specific and honest — e.g. "your name, mobile
number and appointment history" — don't minimise or over-technicalise]
What we've done: [containment + fix, in plain terms]
What you can do: [e.g. "change your password", "watch for suspicious messages
claiming to be from Welleni"]
Who to contact: our Grievance Officer, privacy@welleni.com

We take this seriously and we're sorry this happened. We've also notified the Data
Protection Board of India, as required by law.

— The Welleni team
```

## 5. After the incident

- Update `DPDP_PROGRESS.md` with a dated entry describing the incident and the fix.
- If the breach reveals a gap this audit already flagged (e.g. the hardcoded Fast2SMS
  key, or missing RLS), treat that as confirmation to prioritise it — don't just fix the
  immediate symptom.
- Consider whether the Privacy Notice needs updating as a result.

---
`[LEGAL REVIEW: this runbook assumes a small team without a dedicated DPO. If/when
Welleni is designated a Significant Data Fiduciary, additional obligations apply
(mandatory DPO, annual audits, DPIAs) — out of scope for this draft.]`
