from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import booking,resource,auth,admin

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
app.include_router(resource.router)
app.include_router(auth.router)
app.include_router(admin.router)
