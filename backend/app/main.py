from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware

from app.routers import booking as booking_router
from app.routers import resource as resource_router
from app.routers import auth as auth_router
from app.routers import admin as admin_router

from app.database import engine
from sqlalchemy import text

from sqlalchemy.orm import Session
from app.database import get_db


app = FastAPI()





@app.api_route("/", methods=["GET","HEAD"])
def root():
    return {"message": "ok"}

@app.get("/ping")
def ping(db: Session = Depends(get_db)):
    return {"status": "ok"}

from app.database import Base
from app.models import user, resource, booking, blocked, holiday
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(booking_router.router)
app.include_router(resource_router.router)
app.include_router(auth_router.router)
app.include_router(admin_router.router)


#try:
   # with engine.connect() as conn:
    #    res = conn.execute(text("""
     #       SELECT column_name
      #      FROM information_schema.columns
       #     WHERE table_name='users' AND column_name='username';
        #"""))
        #
        #if res.fetchone() is None:
         #   conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR;"))
          #  conn.commit()
           # 
#        res = conn.execute(text("""
 #           SELECT column_name
  #          FROM information_schema.columns
   #         WHERE table_name='bookings' AND column_name='title';
    #    """))
     #   
      #  if res.fetchone() is None:
       #     conn.execute(text("ALTER TABLE bookings ADD COLUMN title VARCHAR;"))
        #    conn.commit()
            
#        res = conn.execute(text("""
 #           SELECT column_name
  #          FROM information_schema.columns
   #         WHERE table_name='bookings' AND column_name='note';
    #    """))
     #   
      #  if res.fetchone() is None:
       #     conn.execute(text("ALTER TABLE bookings ADD COLUMN note TEXT;"))
        #    conn.commit()
#except Exception as e:
 #   print("DB init error:", e)
