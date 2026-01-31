import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone
from typing import Optional
import structlog

log = structlog.get_logger()

# Global state for health tracking
_health_state = {
    "status": "starting",
    "last_scrape_time": None,
    "last_scrape_success": None,
    "scrape_count": 0,
    "error_count": 0,
}


def update_health(success: bool, scrape_count: int = 0):
    """Update health state after a scrape cycle."""
    _health_state["last_scrape_time"] = datetime.now(timezone.utc).isoformat()
    _health_state["last_scrape_success"] = success
    _health_state["scrape_count"] += scrape_count
    if success:
        _health_state["status"] = "healthy"
    else:
        _health_state["status"] = "degraded"
        _health_state["error_count"] += 1


def set_status(status: str):
    """Set worker status (starting, healthy, degraded, stopped)."""
    _health_state["status"] = status


class HealthHandler(BaseHTTPRequestHandler):
    """HTTP handler for health check requests."""

    def log_message(self, format, *args):
        # Suppress default HTTP logging, use structlog instead
        pass

    def do_GET(self):
        if self.path == "/health":
            self._handle_health()
        elif self.path == "/":
            self._handle_root()
        else:
            self.send_error(404)

    def _handle_root(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Axidex Worker")

    def _handle_health(self):
        status = _health_state["status"]
        http_code = 200 if status in ("healthy", "starting") else 503

        response = {
            "status": status,
            "last_scrape_time": _health_state["last_scrape_time"],
            "last_scrape_success": _health_state["last_scrape_success"],
            "scrape_count": _health_state["scrape_count"],
            "error_count": _health_state["error_count"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        self.send_response(http_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())


class HealthServer:
    """Threaded HTTP server for health checks."""

    def __init__(self, port: int = 8080):
        self.port = port
        self.server: Optional[HTTPServer] = None
        self.thread: Optional[threading.Thread] = None

    def start(self):
        """Start health server in background thread."""
        self.server = HTTPServer(("0.0.0.0", self.port), HealthHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        log.info("health_server_started", port=self.port)

    def stop(self):
        """Stop health server."""
        if self.server:
            self.server.shutdown()
            log.info("health_server_stopped")
