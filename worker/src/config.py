from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    scrape_interval_minutes: int = 30
    log_level: str = "INFO"

    # Bright Data proxy (optional - for job boards)
    bright_data_username: Optional[str] = None
    bright_data_password: Optional[str] = None

    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"  # Use mini for cost efficiency, upgrade to gpt-4o for quality
    ai_enabled: bool = True  # Can disable AI for testing

    @property
    def proxy_url(self) -> Optional[str]:
        if self.bright_data_username and self.bright_data_password:
            return f"http://{self.bright_data_username}:{self.bright_data_password}@brd.superproxy.io:22225"
        return None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    """Lazy-load settings to allow imports without env vars."""
    return Settings()
