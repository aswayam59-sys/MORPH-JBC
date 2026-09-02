"""Focused MVP smoke tests that do not require production credentials."""

from fastapi.testclient import TestClient

from main import app


def test_root_is_available() -> None:
    response = TestClient(app).get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_is_available_without_database_secret() -> None:
    response = TestClient(app).get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
