Task 01: Project Map
Goal
Learn how this portal receives a browser request, gets data on the server, and displays the
result in the dashboard. This task is a code-reading exercise: no application code needs to
change.
Project commands
Command  |  Purpose
| --- | --- |
‘npm run dev‘  |  Start the local development server.
‘npm run lint‘  |  Check the code for linting problems.
‘npm run build‘  |  Create a production build.
‘npm run start‘  |  Run the production build.
‘npm run test:v2‘  |  Run tests for the V2 API/data layer.
‘npm run test:security‘  |  Run security tests.
The project requires Node.js ‘>=22.12.0‘.
Project landmarks
Role  |  Actual file  |  Runs where?  |  What it does
| --- | --- | --- | --- |
Home/dashboard page  |  ‘src/app/page.tsx‘  |  Browser  |  The main forecast dashboard at ‘/‘.
It gathers selections, requests data, stores results in React state, and renders dashboard
components.
Login page  |  ‘src/app/login/page.tsx‘  |  Browser  |  The ‘/login‘ page. It submits
credentials through the shared API helper and navigates to the dashboard after sign-in.
Dashboard component  |  ‘src/components/dashboard/Graphs.tsx‘  |  Browser  |  Renders chart data
supplied by the dashboard page.
Dashboard component  |  ‘src/components/dashboard/DataPanel.tsx‘  |  Browser  |  Renders and
exports forecast/actual table data.
Client API helper  |  ‘src/lib/api.ts‘  |  Browser when called from a client component  |
Centralizes ‘fetch‘: it adds the API base path, includes session cookies, handles a ‘401‘, and
unwraps the ‘{ data: ... }‘ response envelope.
Request gateway  |  ‘src/proxy.ts‘  |  Server/edge request handling  |  Checks requests and
rewrites public ‘/api/*‘ paths to the internal V2 handler paths.
API route  |  ‘src/app/api/v2/actuals/route.ts‘  |  Server  |  Defines the ‘GET‘ handler for
actual-measurement data. It validates ‘plant_id‘ and ‘date‘, authenticates, then calls the
repository.
HTTP wrapper  |  ‘src/server/v2/http.ts‘  |  Server  |  Performs the authenticated, validated
request flow and serializes successful results as ‘{ data: ... }‘ JSON.
Data repository  |  ‘src/server/v2/repo/actuals.ts‘  |  Server  |  Looks up an allowed plant and
queries the measurement data for an IST day.
Database access  |  ‘src/lib/dbV2.ts‘  |  Server  |  Provides the database transaction used by
V2 server modules.
Files beginning with ‘"use client"‘, including the dashboard, login page, ‘Graphs.tsx‘, and
‘DataPanel.tsx‘, execute in the browser. Route handlers, ‘src/server/‘, and database modules
execute on the server.
One real request: plant actuals
The dashboard’s ‘fetchData‘ function in ‘src/app/page.tsx‘ runs when a user submits a
selected plant and date. For a single plant it requests both a forecast series and actual
measurements. The actual-measurement call is conceptually:
api.get(‘/actuals?plant_id=${submitted.plant}&date=${dateStr}‘)
The user-facing request URL is ‘/api/actuals?...‘, not ‘/api/v2/actuals?...‘.
‘src/lib/config.ts‘ gives the helper a default API base URL of ‘/api‘, and ‘src/proxy.ts‘
maps that public URL to the V2 implementation.
Browser
  src/app/page.tsx
    | User selects a plant and date; the dashboard starts loading data.
    v
  src/lib/api.ts
    | Builds a GET request, includes cookies, and sends it to /api/actuals.
    v
  GET /api/actuals?plant_id=<uuid>&date=YYYY-MM-DD
    | This is the stable public API address used by the frontend.
    v
  src/proxy.ts
    | Verifies the session at the gateway and rewrites this path internally.
    v
  GET /api/v2/actuals?plant_id=<uuid>&date=YYYY-MM-DD
    | This is an internal rewrite; the browser still sees /api/actuals.
    v
  src/app/api/v2/actuals/route.ts
    | Validates the query values, authenticates the V2 caller, and delegates data work.
    v
  src/server/v2/http.ts (v2Get)
    | Opens a read-only V2 transaction and wraps a successful result in JSON.
    v
  src/server/v2/repo/actuals.ts (plantActuals)
    | Confirms the plant is in the caller’s allowed scope and queries measurement tables.
    v
  PostgreSQL through src/lib/dbV2.ts
    | Returns timestamped solar actuals, values, quality, and metadata.
    v
  JSON response: { data: { items: [...], meta: {...} } }
    | The response travels back through the same HTTP request.
    v
  src/lib/api.ts
    | Reads JSON and returns the inner data object to the dashboard.
    v
  src/app/page.tsx
    | Combines actuals with forecast data, transforms the rows, and saves graph/table state.
    v
  Graphs.tsx and DataPanel.tsx
    | Receive data as props and render the visible charts and table.
How to explain the arrows without framework jargon
1. The page reacts to the user’s chosen plant and date.
2. The API helper is a shared function that sends the browser request consistently.
3. ‘/api/actuals‘ is the simple public address the browser calls.
4. The proxy is the server’s traffic controller: it checks the request and sends it to the
internal V2 endpoint.
5. The route file is the HTTP entry point. It checks that the request is valid and
authorized.
6. The repository is where the data question is answered: it queries measurement records for
that plant and day.
7. The server returns data as JSON, with the useful payload inside ‘data‘.
8. The page turns raw API records into the values expected by the table and charts.
9. Dashboard components display those values to the user.
Login path (short map)
‘src/app/login/page.tsx‘ sends ‘api.post("/auth", { username, password })‘ through
‘src/lib/api.ts‘. The browser calls ‘/api/auth‘; ‘src/proxy.ts‘ rewrites that public path to
‘/api/v2/auth‘; and ‘src/app/api/v2/auth/route.ts‘ handles authentication. On a successful
sign-in, the page navigates to ‘/‘, the dashboard.
What I learned- The dashboard does not query the database directly; only server-side modules do.- API calls use public ‘/api/*‘ URLs even though the route handlers are stored under
‘src/app/api/v2/*‘.- The proxy rewrite keeps that V2 routing detail off the browser-facing API.- ‘src/lib/api.ts‘ makes client API behavior consistent across pages and components