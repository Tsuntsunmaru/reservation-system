from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import booking  # ←1つだけ入れる

app = FastAPI()

@app.get("/")
def root():
    return {"message": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking.router)
