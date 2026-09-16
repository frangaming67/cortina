"""Demostración acelerada; no usa pines ni controla motores reales."""

import argparse
from datetime import datetime, timedelta, timezone

from cortina.controller import Controller


class SimulatedMotor:
    def open(self):
        print("  MOTOR SIMULADO: subir")

    def stop(self):
        print("  MOTOR SIMULADO: apagado")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=("normal", "timeout", "stop"),
                        default="normal")
    args = parser.parse_args()
    attempts = []
    controller = Controller(SimulatedMotor(), attempts.append,
                            max_run_seconds=10)
    start = datetime(2026, 9, 17, 7, 59, 58,
                     tzinfo=timezone(timedelta(hours=-3)))
    print("SIMULACIÓN: los 10 segundos de límite no son calibración real.")
    for elapsed in range(16):
        now = start + timedelta(seconds=elapsed)
        controller.tick(now, elapsed, clock_valid=True,
                        open_sensor=args.scenario == "normal" and elapsed >= 7,
                        stop_requested=args.scenario == "stop" and elapsed == 5)
        print(now.strftime("%H:%M:%S"), controller.state, controller.reason or "")
    print("Intentos registrados (sólo en memoria):", attempts)


if __name__ == "__main__":
    main()
