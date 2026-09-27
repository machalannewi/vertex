import "server-only";

import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "@/instrumentation";

const logger = loggerProvider?.getLogger("vertex-posthog-integration");

export async function logContentRequest({
  operation,
  status,
  durationMs,
  resultCount,
  errorType,
}: {
  operation: "list_courses" | "get_course";
  status: "success" | "error";
  durationMs: number;
  resultCount?: number;
  errorType?: string;
}) {
  if (!loggerProvider || !logger) return;

  try {
    logger.emit({
      body: "content request completed",
      severityNumber:
        status === "success" ? SeverityNumber.INFO : SeverityNumber.ERROR,
      severityText: status === "success" ? "INFO" : "ERROR",
      attributes: {
        event: "content.request",
        operation,
        status,
        duration_ms: durationMs,
        result_count: resultCount,
        error_type: errorType,
      },
    });

    await loggerProvider.forceFlush();
  } catch {
    // Observability must not change the content request outcome.
  }
}
