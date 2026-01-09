# Syllabus Import Workflow

## Overview
This system allows structured import of LUOA syllabus data into Notion's School Calendar for AI-assisted scheduling.

## CSV Template Format

```csv
Course Code,Assignment Name,Type,Due Date,Estimated Hours,Live Session,Notes
```

### Fields

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| Course Code | Yes | Text | LAN1002 |
| Assignment Name | Yes | Text | Unit 1 Quiz |
| Type | Yes | Quiz/Test/Assignment/Live Session/Project/Reading | Assignment |
| Due Date | Yes | YYYY-MM-DD | 2026-01-19 |
| Estimated Hours | No | Decimal | 1.5 |
| Live Session | Conditional | Day HH:MM AM/PM | Tue 10:00 AM |
| Notes | No | Text | First draft |

### Course Codes (Spring 2026)

| Code | Course | Category |
|------|--------|----------|
| LAN1002 | English 10 | English |
| MAT1002 | Geometry | Math |
| SCI1102 | Chemistry | Science |
| HIS0952 | World Geography | History |
| LAN2302 | Spanish II | Foreign Language |
| BIB1001 | Apologetics | Bible/Religion |
| HPEG250 | Girls PE II | Health/PE |
| APP2050 | Academic & Career Success | Elective |

## How to Create Syllabus CSV

### Option 1: Manual Entry
1. Open each course syllabus in LUOA/Canvas
2. Enter each assignment/deadline into the CSV
3. Include live session times as recurring entries

### Option 2: Screenshot + AI
1. Screenshot the syllabus/schedule from Canvas
2. Share with Claude to extract structured data
3. Claude generates CSV format

### Option 3: PDF/Doc Upload
1. Download syllabus PDF from Canvas
2. Share with Claude for extraction
3. Claude parses and generates CSV

## Import Process

1. **Prepare CSV** - One file per course or combined
2. **Share with Claude** - "Import this syllabus data"
3. **Review conflicts** - Claude checks against Training Calendar
4. **Approve** - Claude adds to School Calendar in Notion

## Scheduling Rules

- School time blocks: 8 AM - 1:30 PM (before Plyos), 5 PM+ (after Track)
- Prioritize NCAA core courses
- Live sessions are fixed - schedule around them
- Buffer 15 min between subject switches
- Max 5 hours school per day during track season

## Files

- `syllabus-template.csv` - Empty template with examples
- `spring-2026/*.csv` - Course-specific syllabi (when populated)
