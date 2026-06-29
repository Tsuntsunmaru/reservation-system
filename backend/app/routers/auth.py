from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db,SessionLocal
from app.models.user import User
from app.models.booking import Booking
from app.core.auth import *
from app.schemas.user import UserCreate, LoginUser
from app.core.deps import get_user
from pydantic import BaseModel

router = APIRouter()

@router.options("/login")
def options_login():
    return {}

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str


@router.post("/register")
def register(user: UserCreate, current_user: User = Depends(get_user),db: Session = Depends(get_db)):
    try:
        if current_user.role not in ["admin", "leader"]:
            raise HTTPException(403, "ユーザー登録権限がありません")

        allowed_roles = ["user", "leader", "hq", "admin"]
        if user.role not in allowed_roles:
            raise HTTPException(400, "無効なroleです")

        allowed_centers = ["gyoda_minami", "hanasaki", "kazo", "hq"]
        if user.center not in allowed_centers:
            raise HTTPException(400, "無効なcenterです")

        if current_user.role == "leader":
            if user.center != current_user.center:
                raise HTTPException(403, "他センターのユーザーは登録できません")

            if user.role != "user":
                raise HTTPException(403, "leaderは一般ユーザーのみ登録できます")
        
        new_user = User(
            email=user.email,
            username=user.username,
            password=hash_password(user.password),
            role=user.role,
            center=user.center
        )
        db.add(new_user)
        db.commit()
        
        return {"msg": "ok"}
    except Exception:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        print("REGISTER ERROR:", e)
        raise

@router.post("/login")
def login(user: LoginUser):

    for i in range(5):
        db = None
        
        try:
            db = SessionLocal()
            db_user = db.query(User).filter(User.email == user.email).first()

            if not db_user or not verify_password(user.password, db_user.password):
                raise HTTPException(status_code=401, detail="Unauthorized")
        
            return {"access_token": create_token({"user_id": db_user.id,"role":db_user.role}),
                   "user":{
                       "id":db_user.id,
                       "email": db_user.email,
                       "username": db_user.username,
                       "role": db_user.role,
                       "center": db_user.center
                   }
            }

        except HTTPException:
            raise

        except OperationalError as e:
            print("DB not ready retry:", i, e)
            time.sleep(3)
            
        except Exception as e:
            print("login retry:",i , e)
            time.sleep(2)
        
        finally:db.close()
            
    raise HTTPException(status_code=500, detail="DB接続不安定")
    
   


@router.put("/users/me")
def update_user(
    username: str,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        
        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")
            
        db_user.username = username
            
        bookings = db.query(Booking).filter(Booking.user_id == user.id).all()
        for b in bookings:
            b.user_name = username
        
        db.commit()
                
        return {"msg": "updated"}
    except Exception:
        db.rollback()
        raise


@router.put("/users/password")
def update_password(
    data: PasswordUpdate,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        
        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")
            
        if not verify_password(data.old_password, db_user.password):
            raise HTTPException(400, "現在のパスワードが違います")
            
        db_user.password = hash_password(data.new_password)
        
        db.commit()
        
        return {"msg": "パスワード変更成功"}
    except Exception:
        db.rollback()
        raise


class AdminPasswordUpdate(BaseModel):
    email: str
    new_password: str


@router.put("/admin/users/password")
def admin_update_password(
    data: AdminPasswordUpdate,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        if user.role != "admin":
            raise HTTPException(403, "権限がありません")

        db_user = db.query(User).filter(User.email == data.email).first()

        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")

        db_user.password = hash_password(data.new_password)

        db.commit()

        return {"msg": "管理者によるパスワード変更成功"}

    except Exception:
        db.rollback()
        raise
