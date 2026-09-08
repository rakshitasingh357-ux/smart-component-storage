"""
Central configuration for the Smart Component Storage backend.
Values are loaded from environment variables / a .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./smart_storage.db"

    # JWT
    SECRET_KEY: str = "change_this_to_a_long_random_string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # SMTP / Email alerts
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Smart Component Storage"

    # Shelf-life alert behaviour
    SHELF_LIFE_ALERT_THRESHOLD_DAYS: int = 7
    ALERT_CHECK_INTERVAL_HOURS: int = 12

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
