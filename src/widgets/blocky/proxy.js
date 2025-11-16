import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("blockyProxyHandler");

async function blockyProxyHandler(req, res) {
  const widget = await getServiceWidget(req.query.group, req.query.service, req.query.index);

  if (!widget) {
    logger.error("Widget configuration not found");
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  try {
    const urlString = formatApiCall(widgets[widget.type].api, widget);
    const [status, , data] = await httpProxy(urlString);

    if (status !== 200) {
      logger.error("Blocky API returned status %d", status);
      return res.status(status).json({ error: "Blocky API Error" });
    }

    // Parse Prometheus metrics from buffer object
    const textData = Buffer.isBuffer(data) ? data.toString() : data;
    const { totalQueries, blockedResponses, denylistCacheEntries } = textData.split("\n").reduce(
      (acc, rawLine) => {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
          return acc;
        }

        const parts = line.split(/\s+/);
        if (parts.length < 2) {
          return acc;
        }

        const metricName = parts[0];
        const value = Number(parts[parts.length - 1]);
        if (!Number.isFinite(value)) {
          return acc;
        }

        if (metricName.startsWith("blocky_query_total")) {
          acc.totalQueries += value;
        } else if (
          metricName.startsWith("blocky_response_total") &&
          line.includes('response_type="BLOCKED"')
        ) {
          acc.blockedResponses += value;
        } else if (metricName.startsWith("blocky_denylist_cache_entries")) {
          acc.denylistCacheEntries += value;
        }

        return acc;
      },
      { totalQueries: 0, blockedResponses: 0, denylistCacheEntries: 0 },
    );

    const blockedPercentage = totalQueries > 0 ? (blockedResponses / totalQueries) * 100 : 0;

    return res.status(200).json({
      queries: totalQueries,
      blocked: blockedResponses,
      blocked_percentage: blockedPercentage,
      denylist: denylistCacheEntries,
    });
  } catch (error) {
    logger.error("Blocky API exception: %s", error.message);
    return res.status(500).json({ error: "Blocky API Error", message: error.message });
  }
}

export default blockyProxyHandler;
