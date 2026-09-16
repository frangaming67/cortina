"""Control de referencia para simulación en CPython, no firmware."""

from datetime import date, datetime
from math import isfinite


class Controller:
    def __init__(self, motor, save_attempt, hour=8, minute=0,
                 max_run_seconds=30, last_attempt=None):
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            raise ValueError("Horario inválido")
        if not isfinite(max_run_seconds) or max_run_seconds <= 0:
            raise ValueError("Tiempo máximo inválido")
        if last_attempt is not None:
            date.fromisoformat(last_attempt)
        self.motor = motor
        self.save_attempt = save_attempt
        self.hour, self.minute = hour, minute
        self.max_run_seconds = max_run_seconds
        self.last_attempt = last_attempt
        self.state = "IDLE"
        self.reason = None
        self.started_at = None
        self.previous_tick = None
        self.motor.stop()

    def _stop(self, state, reason):
        self.motor.stop()
        self.state, self.reason = state, reason
        self.started_at = None

    def tick(self, local_now, monotonic_seconds, *, clock_valid,
             open_sensor=False, stop_requested=False):
        """Llamar periódicamente con hora local y segundos monotónicos."""
        if (not isfinite(monotonic_seconds) or
                (self.previous_tick is not None and
                 monotonic_seconds < self.previous_tick)):
            self._stop("FAULT", "invalid_monotonic_clock")
            return
        self.previous_tick = monotonic_seconds
        if stop_requested:
            self._stop("STOPPED", "manual_stop")
            return
        if self.state in ("FAULT", "STOPPED"):
            return
        if self.state == "OPENING":
            if open_sensor:
                self._stop("IDLE", "open_sensor")
            elif monotonic_seconds - self.started_at >= self.max_run_seconds:
                self._stop("FAULT", "timeout")
            return
        if not clock_valid or not isinstance(local_now, datetime):
            return
        if (local_now.hour, local_now.minute) != (self.hour, self.minute):
            return
        today = local_now.date().isoformat()
        if self.last_attempt is not None and today <= self.last_attempt:
            return
        try:
            self.save_attempt(today)
        except Exception:
            self._stop("FAULT", "storage_error")
            return
        self.last_attempt = today
        if open_sensor:
            self.reason = "already_open"
            return
        try:
            self.motor.open()
        except Exception:
            self._stop("FAULT", "motor_error")
            return
        self.started_at = monotonic_seconds
        self.state, self.reason = "OPENING", "scheduled"
