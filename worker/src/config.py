from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    scrape_interval_minutes: int = 30
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
