import "server-only";

import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "@/instrumentation";
import type { SearchStep } from "@/lib/search/types";

const logger = loggerProvider?.getLogger("vertex-posthog-integration");

export async function logContentRequest({
  operation,
  status,
  durationMs,
  resultCount,
  errorType,
}: {
  operation: "list_courses" | "get_course" | "get_lesson" | "get_instructor";
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

export async function logSearchRequest({
  status,
  durationMs,
  resultCount,
  failedStep,
  errorType,
  errorStatus,
  errorCode,
  errorMessage,
}: {
  status: "success" | "error";
  durationMs: number;
  resultCount?: number;
  failedStep?: SearchStep;
  errorType?: string;
  errorStatus?: number;
  errorCode?: string;
  errorMessage?: string;
}) {
  if (!loggerProvider || !logger) return;

  try {
    logger.emit({
      body: status === "success" ? "search completed" : "search failed",
      severityNumber:
        status === "success" ? SeverityNumber.INFO : SeverityNumber.ERROR,
      severityText: status === "success" ? "INFO" : "ERROR",
      attributes: {
        event: "search.request",
        status,
        duration_ms: durationMs,
        result_count: resultCount,
        failed_step: failedStep,
        error_type: errorType,
        error_status: errorStatus,
        error_code: errorCode,
        error_message: errorMessage,
      },
    });

    await loggerProvider.forceFlush();
  } catch {
    // Observability must not change the search outcome.
  }
}
