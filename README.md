# SFGS Admin Portal (Internal Overview)

This is a private, school-branded administration portal designed for managing all core student and communication workflows at SFGS. The system is not intended for public or third-party use.

## System Overview

The SFGS Admin Portal provides a unified interface for school administrators to:

- Maintain up-to-date student records
- Manage class assignments and promotions
- Communicate efficiently with parents
- Track student birthdays and send greetings
- Import and synchronize student data from Google Sheets
- Archive and restore student records as needed
- Maintain a full audit trail of syncs and communications

## Main Modules

- **Students**: View, add, edit, archive, and unarchive student records. Filter and search by class, name, or ID.
- **Student Promotion**: Promote students to the next class in bulk, with support for custom class flows.
- **Google Sheets Sync**: Import and update student data from a designated Google Sheet, with audit logging of all syncs.
- **Email Queue**: Queue and send emails to parents, including support for attachments and delivery status tracking.
- **Birthday Reminders**: See upcoming student birthdays and send automated greetings.
- **File Management**: Upload and manage files related to students.
- **Audit & History**: View logs of all sync attempts, sent emails, and failed emails for transparency and troubleshooting.
- **Settings**: Configure system-wide options, including Google Sheets integration and sync controls.

## Access & Security

- The portal is restricted to authorized school administrators only.
- All sensitive operations (student data, email, sync) are logged for accountability.

## Branding & Customization

- The portal is branded for SFGS, including logo and color scheme.
- Class names, promotion logic, and other school-specific settings are tailored to SFGS requirements.

## Technical Notes

- Built with React, Supabase, and Google Cloud integrations.
- Uses Supabase for database and file storage.
- Google Sheets integration is via a service account and secure API.
- Email delivery is queued and tracked for reliability.

---

**For internal use only.** For questions, support, or access requests, please contact the SFGS IT administrator.


