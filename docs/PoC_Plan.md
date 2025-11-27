# PoC Plan

## stack

- next.js 16 (app router)
- prisma + sqlite
- auth.js (next-auth v5) w/ google oauth
- openai (users bring their own key)
- tailwind

## phases

### 1. setup

get next.js running with prisma/sqlite. set up the schema (users, job applications, events, emails)

### 2. gmail auth

hook up auth.js with google. need gmail readonly scope. store tokens in db.

need to set up google cloud console oauth creds

### 3. email fetching

build gmail api wrapper. add a sync button that pulls last 30 days of emails. save to emails table.

### 4. classification

settings page where user enters their openai key (encrypt it). send emails to openai, get back structured data, create job application records.

### 5. dashboard

install shadcn/ui for components (`npx shadcn@latest init`, then add table/button/input/badge)

main table view of applications - company, role, status, etc. click into one to see the email timeline. add filtering/sorting.

### 6. polish

csv export, loading states, error handling

## end goal

working local app where i can sign in with google, sync my emails, and see my job applications tracked automatically
