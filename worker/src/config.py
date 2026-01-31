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

    # Bright Data API token (for LinkedIn SDK)
    bright_data_api_token: Optional[str] = None

    # OpenAI / OpenRouter
    openai_api_key: Optional[str] = None
    openai_api_base: Optional[str] = None  # Set to https://openrouter.ai/api/v1 for OpenRouter
    openai_model: str = "gpt-4o-mini"  # Use mini for cost efficiency, or OpenRouter model name
    ai_enabled: bool = True  # Can disable AI for testing

    # Health check endpoint
    health_port: int = 8080

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
