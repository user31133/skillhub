from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router
from routes.reviews import router as reviews_router
from routes.skills import router as skills_router
from routes.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="SkillHub API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(skills_router)
app.include_router(reviews_router)
app.include_router(users_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {"message": "SkillHub API"}
