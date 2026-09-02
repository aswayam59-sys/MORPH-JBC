"""Authentication request and response contracts."""

from pydantic import BaseModel, Field


class TeamLoginRequest(BaseModel):
    team_number: int = Field(gt=0)
    access_code: str = Field(min_length=1, max_length=128)


class AdminLoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=256)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    team_id: str
    team_number: int
