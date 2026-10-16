Task 02: Run the Project and Learn the Developer Tools
1. Objective
The objective of this task was to inspect the GRID IITB portal in a
browser, use Chrome Developer Tools to inspect requests and responses,
and learn how to distinguish an HTTP request failure from a successful
request that returns no data.
2. Developer Tools inspection
I opened Chrome DevTools and inspected both the Console and Network
tabs. In Network, I used the Fetch/XHR filter and selected individual
requests to inspect their Headers and Response tabs.
3. Network request observations
  ---------------------------------------------------------------------------
  Request          Method                 Observed status Response /
                                                          observation
  ---------------- ---------------- --------------------- -------------------
  `dates`          GET                           `200 OK` Response contained
                                                          a list of available
                                                          dates, including
                                                          `2026-10-14` and
                                                          earlier dates.
  `revisions`      GET                           `200 OK` Response contained
                                                          forecast revisions
                                                          such as `R23`,
                                                          `R22`, and `R21`,
                                                          with visible
                                                          statuses of
                                                          `COMPLETE`.
  `stitched`       GET                           `200 OK` Forecast records
                                                          were present, as
                                                          confirmed during
                                                          inspection.
  `actuals`        GET                           `200 OK` Response contained
                                                          `items: []` and
                                                          `seriesCount: 0`.
  `auth`           POST                          `200 OK` Response returned
                                                          user-role
                                                          information.
                                                          Sensitive user
                                                          information is
                                                          intentionally not
                                                          reproduced here.
  `logout`         POST                          `200 OK` Logout request
                                                          returned a
                                                          successful HTTP
                                                          status.
  `refresh`        fetch request    `200 OK` in the later Several refresh
                                       Network screenshot requests returned
                                                          `200 OK`; earlier
                                                          Console/Network
                                                          observations also
                                                          showed `401` errors
                                                          for an
                                                          authentication
                                                          refresh request.
                                                          These may represent
                                                          different attempts
                                                          or stages.
  ---------------------------------------------------------------------------
4. Detailed comparison: forecast and actuals
Forecast (`stitched`)
-   The request returned `200 OK`.
-   The response contained forecast records.
-   This indicates that the API returned forecast data for the inspected
    request.
Actual measurements (`actuals`)
The inspected response was:
``` json
{
  "data": {
    "items": [],
    "meta": {
      "source": "GRID_INDIA_SOLAR_API",
      "metric": "POWER_MW",
      "seriesCount": 0
    }
  }
}
```
-   The HTTP status was `200 OK`.
-   The requested date was checked and confirmed to be correct.
-   `items: []` means the response contained no actual-measurement
    records.
-   `metric: POWER_MW` identifies the metric as solar power in
    megawatts.
-   `seriesCount: 0` indicates that the response reported zero series.
Conclusion: The request succeeded at the HTTP level, but the
response did not contain actual-measurement records. The reason for the
empty result has not been established. A successful `200` status does
not guarantee that the response contains data.
6. What I learned
1.  Chrome DevTools Console helps identify browser errors and warnings.
2.  Network → Fetch/XHR shows the requests made by the page.
3.  The Headers tab shows request details such as method and HTTP
    status.
4.  The Response tab shows the data returned by an API.
5.  HTTP `200 OK` means the request succeeded at the HTTP level, but the
    returned data can still be empty.
6.  A `401` response indicates an authentication failure for that
    request, but more evidence is needed to determine why it occurred.
7.  Forecast and actual-measurement requests can return different data
    results, so their responses should be inspected separately.


