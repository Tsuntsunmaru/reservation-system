from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import booking,resource,auth,admin

from app.database import engine
from sqlalchemy import text

app = FastAPI()

@app.api_route("/", methods=["GET","HEAD"])
def root():
    return {"message": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tsuntsunmaru.github.io/"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking.router)
app.include_router(resource.router)
app.include_router(auth.router)
app.include_router(admin.router)

with engine.connect() as conn:
        
    res = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='users' AND column_name='username';
    """))

    if res.fetchone() is None:
        conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR;"))
        conn.commit()
        
    res = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='bookings' AND column_name='title';
    """))

    if res.fetchone() is None:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN title VARCHAR;"))
        conn.commit()

    res = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='bookings' AND column_name='note';
    """))

    if res.fetchone() is None:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN note TEXT;"))
        conn.commit()
