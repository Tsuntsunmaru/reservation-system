from fastapi import FastAPI
from app.database import Base, engine
from sqlalchemy import text

from app.routers import auth, booking, resource, admin

app = FastAPI()

def fix_db():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN user_name VARCHAR;"))
            conn.commit()
        except Exception:
            pass

fix_db()
@app.get("/")
def root():
    return {"message": "ok"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(resource.router)
app.include_router(booking.router)
app.include_router(admin.router)
