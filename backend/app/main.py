from fastapi import FastAPI
from app.database import Base, engine

from app.routers import auth, booking, resource, admin

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(resource.router)
app.include_router(booking.router)
app.include_router(admin.router)
