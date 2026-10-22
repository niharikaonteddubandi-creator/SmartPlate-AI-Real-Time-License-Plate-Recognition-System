import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base
from app import models

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "SmartPlate AI" in data["app"]

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_status" in data

def test_get_samples():
    response = client.get("/api/recognize/samples")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_login_invalid():
    response = client.post("/api/auth/login", json={
        "username_or_email": "nonexistent_user_999",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
