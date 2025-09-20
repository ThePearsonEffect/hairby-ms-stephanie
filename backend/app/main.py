from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": pwd_context.hash("admin123"),
        "is_active": True
    },
    "stephanie": {
        "username": "stephanie", 
        "hashed_password": pwd_context.hash("stephanie123"),
        "is_active": True
    }
}

content_db = {
    "hero_title": "Hair by Ms. Stephanie",
    "hero_subtitle": "Stress-Free Bridal Hair Stylist",
    "hero_description": "Luxury website design that leaves a lasting impression",
    "about_title": "Invite high-end, luxury clients into your bridal hairstyling business",
    "about_description": "As a discerning brand with affluent clientele, your website needs to set the tone for your white glove experience. These clients expect the highest-level of service from their first touch point - and that starts on your website.",
    "services": [
        {"name": "Bridal Hair Styling", "description": "Elegant bridal hairstyles for your special day"},
        {"name": "Wedding Party Hair", "description": "Beautiful styles for bridesmaids and family"},
        {"name": "Hair Consultations", "description": "Personalized consultations for your perfect look"}
    ]
}

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str

class ContentUpdate(BaseModel):
    key: str
    value: str

class ServiceUpdate(BaseModel):
    services: List[dict]

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = authenticate_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/content")
async def get_content():
    return content_db

@app.put("/content")
async def update_content(content: ContentUpdate, current_user: dict = Depends(get_current_user)):
    if content.key in content_db:
        content_db[content.key] = content.value
        return {"message": "Content updated successfully", "key": content.key, "value": content.value}
    else:
        raise HTTPException(status_code=404, detail="Content key not found")

@app.put("/services")
async def update_services(service_data: ServiceUpdate, current_user: dict = Depends(get_current_user)):
    content_db["services"] = service_data.services
    return {"message": "Services updated successfully", "services": service_data.services}

@app.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"]}
