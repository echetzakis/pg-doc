# Custom Title
## Tables 
|# |Table Name| Description|
|--:|----------|------------|
|1| [accounts](#accounts) |  |
|2| [archives](#archives) |  |
|3| [interview_items](#interview_items) |  |
|4| [interviews](#interviews) |  |
|5| [jobs](#jobs) |  |
|6| [localized_contents](#localized_contents) |  |
|7| [practice_questions](#practice_questions) |  |
|8| [recordings](#recordings) |  |
|9| [script_items](#script_items) |  |
|10| [scripts](#scripts) |  |
|11| [streams](#streams) |  |
## Details 
### accounts

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('accounts_id_seq'::regclass) | **PK** |  |
| 2 | subdomain |  character varying | YES |  |  |  |
| 3 | gdpr |  USER-DEFINED | YES | 'disabled'::account_gdpr_type |  |  |
| 4 | privacy_policy_url |  character varying | YES |  |  |  |
| 5 | theme |  jsonb | YES | '{}'::jsonb |  |  |
| 6 | created_at |  timestamp with time zone | NO | now() |  |  |
| 7 | updated_at |  timestamp with time zone | NO | now() |  |  |
| 8 | access_token |  character varying | NO | upper(md5(((random())::text \|\| (clock_timestamp())::text))) | **UNIQ** |  |
### archives

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  uuid | NO |  | **PK** |  |
| 2 | project_id |  character varying | YES |  |  |  |
| 3 | session_id |  character varying | YES |  |  |  |
| 4 | status |  USER-DEFINED | YES |  |  |  |
| 5 | output_mode |  USER-DEFINED | YES |  |  |  |
| 6 | started_at |  timestamp with time zone | YES |  |  |  |
| 7 | duration |  integer | YES |  |  |  |
| 8 | payload |  jsonb | YES | '{}'::jsonb |  |  |
| 9 | created_at |  timestamp with time zone | NO | now() |  |  |
| 10 | updated_at |  timestamp with time zone | NO | now() |  |  |
| 11 | has_thumbnail |  boolean | NO | false |  |  |
### interview_items

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('interview_items_id_seq'::regclass) | **PK** |  |
| 2 | interview_id |  integer | NO |  | **FK** ([interviews.id](#interviews)) |  |
| 3 | type |  USER-DEFINED | NO |  |  |  |
| 4 | state |  USER-DEFINED | NO | 'pending'::interview_item_state_type |  |  |
| 5 | position |  integer | NO |  |  |  |
| 6 | level |  integer | NO | 0 |  |  |
| 7 | constraints |  jsonb | YES | '{}'::jsonb |  |  |
| 8 | content |  jsonb | YES | '{}'::jsonb |  |  |
| 9 | current_recording_id |  integer | YES |  | **FK** ([recordings.id](#recordings)) |  |
| 10 | revealed_at |  timestamp with time zone | YES |  |  |  |
| 11 | created_at |  timestamp with time zone | NO | now() |  |  |
| 12 | updated_at |  timestamp with time zone | NO | now() |  |  |
| 13 | selected_recording_id |  integer | YES |  | **FK** ([recordings.id](#recordings)) |  |
| 14 | stream_id |  uuid | YES |  | **FK** ([streams.id](#streams)) |  |
### interviews

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('interviews_id_seq'::regclass) | **PK** |  |
| 2 | script_id |  integer | YES |  |  |  |
| 3 | state |  USER-DEFINED | NO | 'pending'::interview_state_type |  |  |
| 4 | account_id |  integer | NO |  | **FK** ([accounts.id](#accounts)) |  |
| 5 | job_id |  integer | NO |  | **FK** ([jobs.id](#jobs)) |  |
| 6 | parent_id |  integer | YES |  | **FK** ([interviews.id](#interviews)) |  |
| 7 | member_id |  integer | YES |  |  |  |
| 8 | member_data |  jsonb | YES | '{}'::jsonb |  |  |
| 9 | candidate_id |  integer | YES |  |  |  |
| 10 | candidate_data |  jsonb | YES | '{}'::jsonb |  |  |
| 11 | deadline |  timestamp with time zone | YES |  |  |  |
| 12 | default_locale |  character varying | YES |  |  |  |
| 13 | selected_locale |  character varying | YES |  |  |  |
| 14 | content |  jsonb | YES | '{}'::jsonb |  |  |
| 15 | preview |  USER-DEFINED | NO | 'all'::script_preview_type |  |  |
| 16 | mode |  USER-DEFINED | NO | 'normal'::interview_mode_type |  |  |
| 17 | invitation_id |  character varying | NO |  | **UNIQ** |  |
| 18 | session_id |  character varying | YES |  |  |  |
| 19 | test_session_id |  character varying | YES |  |  |  |
| 20 | available_locales |  jsonb | YES | '[]'::jsonb |  |  |
| 21 | candidate_consent_at |  timestamp with time zone | YES |  |  |  |
| 22 | created_at |  timestamp with time zone | NO | now() |  |  |
| 23 | updated_at |  timestamp with time zone | NO | now() |  |  |
| 24 | callback_url |  character varying | YES |  |  |  |
| 25 | watchable |  boolean | NO | false |  |  |
### jobs

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('jobs_id_seq'::regclass) | **PK** |  |
| 2 | data |  jsonb | YES | '{}'::jsonb |  |  |
| 3 | status |  character varying | YES |  |  |  |
| 4 | created_at |  timestamp with time zone | NO | now() |  |  |
| 5 | updated_at |  timestamp with time zone | NO | now() |  |  |
| 6 | account_id |  integer | NO |  | **FK** ([accounts.id](#accounts)) |  |
| 7 | shortcode |  character varying | NO |  |  |  |
### localized_contents

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('localized_contents_id_seq'::regclass) | **PK** |  |
| 2 | localizable_type |  character varying | NO |  |  |  |
| 3 | localizable_id |  integer | NO |  |  |  |
| 4 | locale |  character varying | NO |  |  |  |
| 5 | content |  jsonb | YES | '{}'::jsonb |  |  |
| 6 | created_at |  timestamp with time zone | NO | now() |  |  |
| 7 | updated_at |  timestamp with time zone | NO | now() |  |  |
### practice_questions

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('practice_questions_id_seq'::regclass) | **PK** |  |
| 2 | content |  jsonb | YES | '{}'::jsonb |  |  |
| 3 | created_at |  timestamp with time zone | NO | now() |  |  |
| 4 | updated_at |  timestamp with time zone | NO | now() |  |  |
### recordings

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('recordings_id_seq'::regclass) | **PK** |  |
| 2 | interview_item_id |  integer | NO |  | **FK** ([interview_items.id](#interview_items)) |  |
| 3 | archive_id |  uuid | NO |  |  |  |
| 4 | submitted_at |  timestamp with time zone | YES |  |  |  |
| 5 | state |  USER-DEFINED | NO | 'pending'::recording_state_type |  |  |
| 6 | created_at |  timestamp with time zone | NO | now() |  |  |
| 7 | updated_at |  timestamp with time zone | NO | now() |  |  |
### script_items

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('script_items_id_seq'::regclass) | **PK** |  |
| 2 | script_id |  integer | NO |  | **FK** ([scripts.id](#scripts)) |  |
| 3 | type |  USER-DEFINED | NO |  |  |  |
| 4 | position |  integer | NO |  |  |  |
| 5 | level |  integer | NO | 0 |  |  |
| 6 | constraints |  jsonb | YES | '{}'::jsonb |  |  |
| 7 | created_at |  timestamp with time zone | NO | now() |  |  |
| 8 | updated_at |  timestamp with time zone | NO | now() |  |  |
### scripts

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  integer | NO | nextval('scripts_id_seq'::regclass) | **PK** |  |
| 2 | title |  character varying | NO |  |  |  |
| 3 | account_id |  integer | NO |  | **FK** ([accounts.id](#accounts)) |  |
| 4 | state |  USER-DEFINED | NO | 'draft'::script_state_type |  |  |
| 5 | member_id |  integer | YES |  |  |  |
| 6 | deadline_interval |  integer | NO | 1 |  |  |
| 7 | deadline_interval_unit |  USER-DEFINED | NO | 'weeks'::script_interval_unit_type |  |  |
| 8 | default_locale |  character varying | NO |  |  |  |
| 9 | available_locales |  jsonb | YES | '[]'::jsonb |  |  |
| 10 | preview |  USER-DEFINED | NO | 'all'::script_preview_type |  |  |
| 11 | created_at |  timestamp with time zone | NO | now() |  |  |
| 12 | updated_at |  timestamp with time zone | NO | now() |  |  |
### streams

|# |column|type|nullable|default|constraints|description|
|--:|------|----|--------|-------|-----------|-----------|
| 1 | id |  uuid | NO |  | **PK** |  |
| 2 | archive_id |  uuid | NO |  |  |  |
| 3 | ready_to_stream |  boolean | NO | false |  |  |
| 4 | duration |  integer | NO | 0 |  |  |
| 5 | payload |  jsonb | YES | '{}'::jsonb |  |  |
| 6 | created_at |  timestamp with time zone | NO | now() |  |  |
| 7 | updated_at |  timestamp with time zone | NO | now() |  |  |
---
generated by [pg-doc](https://github.com/echetzakis/pg-doc) v0.1.0
