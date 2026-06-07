# NZLaw Brief Draft Shape Reference

Use the NZLaw fixture as the reference shape for HypaJump brief drafts:

- Root `README.md` explains business context, manual workflow, target automation workflow, output packages, document assets, known risks, and client questions.
- `BUILD-BRIEF.md` may exist in examples, but this skill should primarily produce `IMPLEMENTATION-SPEC.md` for build mechanics unless the user asks for a separate build brief.
- `IMPLEMENTATION-SPEC.md` captures stack, architecture, AI extraction/drafting boundaries, document generation mechanisms, review gates, and implementation phases.
- `OPERATIONS-SPEC.md` captures auth, storage, backups, audit logging, retention, data residency, and client assurance.
- `dokumen/README.md` groups copied client files by role and maps old names to new names.

Good draft behavior:

- Treat blank forms as templates.
- Treat completed forms as examples/validation fixtures.
- Treat lookup tables, wording libraries, price lists, and exports as reference data.
- Leave original files untouched.
- Make recommendations when clear; reserve questions for blockers.

## Raw Source Pattern From Original Client Package

The original NZLaw raw package used during skill design looked like this:

- `Automation-2.docx`: primary brief. It explains Part 1 form automation and Part 2 billing automation. It also contains embedded screenshots that clarify affidavit formatting, conditional legislation selection, billing UI/fee rows, and expected output files.
- `reautomation/`: Legal Aid and Letter of Engagement artifacts: blank Legal Aid application PDF, combined package example, and Adobe Sign LoE PDFs.
- `reautomation (1)/`: billing artifacts: Form32B/Form33A legacy `.dot` templates, completed invoice examples, travel-time lookup, and billing wording library.
- `reautomation (2)/`: intake/form/affidavit artifacts: court form templates, sample transcript, blank affidavit template, completed affidavit examples, police sheet, information sheet, and lawyer certificate.

When handling similar packages, first identify the primary brief, then classify each raw folder by contents. Inspect embedded images in the primary DOCX before writing specs because they may contain requirement details not visible in extracted text.

## Timeline Source Of Truth

The brief draft, not the slide generator, decides timeline. For HypaJump proposals, default to a 7-day MVP build plan in `IMPLEMENTATION-SPEC.md`. If scope is larger, keep the 7-day plan as MVP and move extra work to post-MVP/add-ons.

ZIP packages are normal client inputs. Safely extract them before applying this shape, preserve original paths in `dokumen/README.md`, and record the ZIP filename in the Source Package Summary.
