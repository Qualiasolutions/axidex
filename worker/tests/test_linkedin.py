"""
Unit tests for LinkedIn scraper.

Tests parsing logic and priority assessment without making real API calls.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.models import Signal


class TestLinkedInScraper:
    """Tests for LinkedInScraper class."""

    @pytest.fixture
    def mock_settings(self):
        """Create mock settings for testing."""
        settings = MagicMock()
        settings.bright_data_api_token = "test_token"
        settings.proxy_url = None
        return settings

    @pytest.fixture
    def mock_settings_no_token(self):
        """Create mock settings without API token."""
        settings = MagicMock()
        settings.bright_data_api_token = None
        settings.proxy_url = None
        return settings

    @pytest.fixture
    def scraper(self, mock_settings):
        """Create a LinkedInScraper instance with mocked settings."""
        with patch('src.scrapers.linkedin.get_settings', return_value=mock_settings):
            with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
                from src.scrapers.linkedin import LinkedInScraper
                return LinkedInScraper()

    @pytest.fixture
    def disabled_scraper(self, mock_settings_no_token):
        """Create a disabled LinkedInScraper instance (no token)."""
        with patch('src.scrapers.linkedin.get_settings', return_value=mock_settings_no_token):
            from src.scrapers.linkedin import LinkedInScraper
            return LinkedInScraper()

    def test_parse_job_extracts_required_fields(self, scraper):
        """Test that _parse_job_to_signal extracts all required fields."""
        mock_job = {
            "title": "VP of Sales",
            "company_name": "Acme Corp",
            "url": "https://linkedin.com/jobs/123",
            "description": "We are looking for a VP of Sales to lead our team.",
            "location": "San Francisco, CA"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
            signal = scraper._parse_job_to_signal(mock_job, "Fallback Company")

        assert signal is not None
        assert signal.company_name == "Acme Corp"
        assert "VP of Sales" in signal.title
        assert signal.source_url == "https://linkedin.com/jobs/123"
        assert signal.source_name == "LinkedIn"
        assert signal.metadata.get("location") == "San Francisco, CA"

    def test_parse_job_uses_fallback_company(self, scraper):
        """Test that fallback company is used when job data missing company."""
        mock_job = {
            "title": "Director of Marketing",
            "url": "https://linkedin.com/jobs/456",
            "description": "Great opportunity",
            "location": "New York, NY"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
            signal = scraper._parse_job_to_signal(mock_job, "Fallback Corp")

        assert signal is not None
        assert signal.company_name == "Fallback Corp"

    def test_parse_job_filters_non_signal_titles(self, scraper):
        """Test that job titles without keywords return None."""
        mock_job = {
            "title": "Software Engineer",  # Not a signal keyword
            "company_name": "Tech Corp",
            "url": "https://linkedin.com/jobs/789",
            "description": "Build software",
            "location": "Austin, TX"
        }

        signal = scraper._parse_job_to_signal(mock_job, "Tech Corp")

        assert signal is None

    def test_parse_job_returns_none_missing_title(self, scraper):
        """Test that missing title returns None."""
        mock_job = {
            "company_name": "Tech Corp",
            "url": "https://linkedin.com/jobs/789",
        }

        signal = scraper._parse_job_to_signal(mock_job, "Tech Corp")

        assert signal is None

    def test_parse_job_returns_none_missing_url(self, scraper):
        """Test that missing URL returns None."""
        mock_job = {
            "title": "VP of Sales",
            "company_name": "Tech Corp",
        }

        signal = scraper._parse_job_to_signal(mock_job, "Tech Corp")

        assert signal is None

    def test_parse_job_skips_duplicates(self, scraper):
        """Test that duplicate jobs are skipped."""
        mock_job = {
            "title": "VP of Sales",
            "company_name": "Tech Corp",
            "url": "https://linkedin.com/jobs/789",
            "description": "Great role",
            "location": "Seattle, WA"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=True):
            signal = scraper._parse_job_to_signal(mock_job, "Tech Corp")

        assert signal is None

    def test_assess_priority_high_for_vp(self, scraper):
        """Test VP titles get high priority."""
        assert scraper._assess_priority("VP of Sales") == "high"
        assert scraper._assess_priority("VP Engineering") == "high"

    def test_assess_priority_high_for_director(self, scraper):
        """Test Director titles get high priority."""
        assert scraper._assess_priority("Director of Marketing") == "high"
        assert scraper._assess_priority("Sales Director") == "high"

    def test_assess_priority_high_for_head_of(self, scraper):
        """Test Head of titles get high priority."""
        assert scraper._assess_priority("Head of Growth") == "high"

    def test_assess_priority_high_for_c_suite(self, scraper):
        """Test C-suite titles get high priority."""
        assert scraper._assess_priority("Chief Revenue Officer") == "high"
        assert scraper._assess_priority("CRO") == "high"
        assert scraper._assess_priority("CMO") == "high"
        assert scraper._assess_priority("CSO") == "high"

    def test_assess_priority_high_for_svp_evp(self, scraper):
        """Test SVP/EVP titles get high priority."""
        assert scraper._assess_priority("SVP Sales") == "high"
        assert scraper._assess_priority("EVP Revenue") == "high"

    def test_assess_priority_medium_for_others(self, scraper):
        """Test regular titles get medium priority."""
        assert scraper._assess_priority("Account Executive") == "medium"
        assert scraper._assess_priority("Sales Manager") == "medium"
        assert scraper._assess_priority("Marketing Manager") == "medium"
        assert scraper._assess_priority("Business Development Rep") == "medium"

    def test_scraper_disabled_without_token(self, disabled_scraper):
        """Test that scraper is disabled when no token configured."""
        assert disabled_scraper._enabled is False

    def test_scraper_enabled_with_token(self, scraper):
        """Test that scraper is enabled when token configured."""
        assert scraper._enabled is True

    @pytest.mark.asyncio
    async def test_scrape_returns_empty_when_disabled(self, disabled_scraper):
        """Test that scrape() returns empty list when disabled."""
        signals = await disabled_scraper.scrape()
        assert signals == []

    def test_signal_type_is_hiring(self, scraper):
        """Test that all LinkedIn signals have signal_type 'hiring'."""
        mock_job = {
            "title": "VP of Sales",
            "company_name": "Acme Corp",
            "url": "https://linkedin.com/jobs/123",
            "description": "Great opportunity",
            "location": "NYC"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
            signal = scraper._parse_job_to_signal(mock_job, "Acme Corp")

        assert signal.signal_type == "hiring"

    def test_description_truncation(self, scraper):
        """Test that long descriptions are truncated."""
        long_description = "A" * 500  # 500 characters
        mock_job = {
            "title": "Director of Sales",
            "company_name": "Acme Corp",
            "url": "https://linkedin.com/jobs/123",
            "description": long_description,
            "location": "NYC"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
            signal = scraper._parse_job_to_signal(mock_job, "Acme Corp")

        assert len(signal.summary) == 303  # 300 chars + "..."
        assert signal.summary.endswith("...")

    def test_default_summary_when_no_description(self, scraper):
        """Test that a default summary is generated when no description."""
        mock_job = {
            "title": "VP of Sales",
            "company_name": "Acme Corp",
            "url": "https://linkedin.com/jobs/123",
            "description": "",
            "location": "NYC"
        }

        with patch('src.scrapers.linkedin.is_duplicate', return_value=False):
            signal = scraper._parse_job_to_signal(mock_job, "Acme Corp")

        assert "VP of Sales" in signal.summary
        assert "Acme Corp" in signal.summary
