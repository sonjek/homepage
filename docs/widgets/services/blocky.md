---
title: Blocky
description: Blocky Widget Configuration
---

Learn more about [Blocky](https://github.com/0xERR0R/blocky).

Allowed fields: `["queries", "blocked", "denylist"]`.

Note: This widget displays cumulative statistics (total queries and blocked requests since Blocky startup) using Prometheus metrics, not daily statistics like Pi-hole.

```yaml
widget:
  type: blocky
  url: http://blocky.host.or.ip
```

#### Prometheus Metrics

Blocky must have Prometheus metrics enabled.
The widget fetches data from the `/metrics` endpoint and parses the following metrics:

- `blocky_query_total`: Total DNS queries processed
- `blocky_response_total`: DNS responses by type (used to count blocked requests)
- `blocky_denylist_cache_entries`: Number of entries in the denylist cache

!!! note

    Unlike Pi-hole which shows daily statistics, Blocky displays cumulative totals since the service was last restarted. This is consistent with how Prometheus metrics work.
