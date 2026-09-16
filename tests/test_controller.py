import unittest
from datetime import datetime, timedelta

from cortina.controller import Controller


class Motor:
    def __init__(self):
        self.running = False
        self.starts = 0

    def open(self):
        self.running = True
        self.starts += 1

    def stop(self):
        self.running = False


class ControllerTests(unittest.TestCase):
    def setUp(self):
        self.motor = Motor()
        self.saved = []
        self.control = Controller(self.motor, self.saved.append,
                                  max_run_seconds=10)
        self.now = datetime(2026, 9, 17, 8)

    def tick(self, seconds=0, now=None, **kwargs):
        options = {"clock_valid": True, **kwargs}
        self.control.tick(now or self.now, seconds, **options)

    def test_opens_at_eight_only_once(self):
        self.tick(now=self.now - timedelta(seconds=1))
        self.assertFalse(self.motor.running)
        self.tick(1)
        self.assertTrue(self.motor.running)
        self.tick(2, open_sensor=True)
        self.tick(3)
        self.assertFalse(self.motor.running)
        self.assertEqual(self.motor.starts, 1)
        self.assertEqual(self.saved, ["2026-09-17"])

    def test_next_day_opens_again(self):
        self.tick()
        self.tick(1, open_sensor=True)
        self.tick(86400, now=self.now + timedelta(days=1))
        self.assertEqual(self.motor.starts, 2)

    def test_invalid_clock_and_missed_window_do_not_start(self):
        self.tick(clock_valid=False)
        self.tick(1, now=self.now + timedelta(minutes=1))
        self.assertEqual(self.motor.starts, 0)

    def test_timeout_stops_even_if_civil_clock_changes(self):
        self.tick()
        self.tick(10, now=self.now - timedelta(hours=1), clock_valid=False)
        self.assertEqual(self.control.reason, "timeout")
        self.assertFalse(self.motor.running)
        self.tick(86400, now=self.now + timedelta(days=1))
        self.assertEqual(self.motor.starts, 1)

    def test_manual_stop_has_priority(self):
        self.tick(stop_requested=True)
        self.tick(1)
        self.assertEqual(self.control.state, "STOPPED")
        self.assertEqual(self.motor.starts, 0)

    def test_stop_while_moving(self):
        self.tick()
        self.tick(1, stop_requested=True, open_sensor=True)
        self.assertFalse(self.motor.running)
        self.assertEqual(self.control.reason, "manual_stop")

    def test_restart_does_not_repeat_attempt(self):
        self.tick()
        self.control = Controller(self.motor, self.saved.append,
                                  last_attempt=self.saved[-1])
        self.tick(1)
        self.assertEqual(self.motor.starts, 1)
        self.assertFalse(self.motor.running)

    def test_clock_backwards_does_not_repeat_previous_dates(self):
        self.control.last_attempt = "2026-09-18"
        self.tick()
        self.assertEqual(self.motor.starts, 0)

    def test_already_open_consumes_day_without_motion(self):
        self.tick(open_sensor=True)
        self.tick(1)
        self.assertEqual(self.motor.starts, 0)
        self.assertEqual(self.saved, ["2026-09-17"])

    def test_failed_storage_prevents_motion(self):
        def fail(_):
            raise OSError("disk full")
        self.control.save_attempt = fail
        self.tick()
        self.assertEqual(self.control.reason, "storage_error")
        self.assertEqual(self.motor.starts, 0)

    def test_record_is_saved_before_motor_starts(self):
        def save(value):
            self.assertFalse(self.motor.running)
            self.saved.append(value)
        self.control.save_attempt = save
        self.tick()
        self.assertTrue(self.motor.running)

    def test_motor_failure_stops_and_latches(self):
        def fail():
            self.motor.running = True
            raise OSError("driver error")
        self.motor.open = fail
        self.tick()
        self.assertFalse(self.motor.running)
        self.assertEqual(self.control.reason, "motor_error")

    def test_monotonic_regression_stops_motion(self):
        self.tick(5)
        self.tick(4)
        self.assertFalse(self.motor.running)
        self.assertEqual(self.control.state, "FAULT")

    def test_invalid_configuration_rejected(self):
        for options in ({"hour": 24}, {"minute": -1},
                        {"max_run_seconds": 0},
                        {"max_run_seconds": float("nan")},
                        {"last_attempt": "invalid"}):
            with self.subTest(options=options), self.assertRaises(ValueError):
                Controller(self.motor, self.saved.append, **options)


if __name__ == "__main__":
    unittest.main()
