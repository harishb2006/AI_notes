import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import SessionLocal, engine, get_db
from app.main import app


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def setup_module(module):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db


def teardown_module(module):
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def authenticate(client: TestClient) -> dict:
    signup_payload = {
        "email": "demo@example.com",
        "username": "demo",
        "password": "strongpassword",
        "full_name": "Demo User",
    }
    resp = client.post("/api/auth/signup", json=signup_payload)
    assert resp.status_code == 201

    login_resp = client.post("/api/auth/login", json={"username": "demo", "password": "strongpassword"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_note_crud_flow():
    with TestClient(app) as client:
        headers = authenticate(client)

        note_payload = {
            "title": "Project plan",
            "content": "Outline sprint milestones and AI tasks.",
            "tags": ["planning", "ai"],
            "use_ai": True,
        }
        create_resp = client.post("/api/notes", json=note_payload, headers=headers)
        assert create_resp.status_code == 201
        note_id = create_resp.json()["id"]

        list_resp = client.get("/api/notes", headers=headers)
        assert list_resp.status_code == 200
        notes = list_resp.json()
        assert len(notes) == 1
        assert notes[0]["ai_summary"] is not None

        update_resp = client.put(
            f"/api/notes/{note_id}",
            json={"title": "v2 plan", "regenerate_ai": True},
            headers=headers,
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["title"] == "v2 plan"

        delete_resp = client.delete(f"/api/notes/{note_id}", headers=headers)
        assert delete_resp.status_code == 204

        list_resp = client.get("/api/notes", headers=headers)
        assert list_resp.status_code == 200
        assert list_resp.json() == []
