"""
Unit tests for deduplication logic.

Tests content hash computation and duplicate detection strategies.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.dedup import compute_content_hash, is_duplicate, get_content_hash


class TestComputeContentHash:
    """Tests for compute_content_hash function."""

    def test_content_hash_deterministic(self):
        """Test that same inputs produce same hash."""
        h1 = compute_content_hash("VP Sales", "Stripe")
        h2 = compute_content_hash("VP Sales", "Stripe")
        assert h1 == h2

    def test_content_hash_case_insensitive(self):
        """Test that hash is case-insensitive."""
        h1 = compute_content_hash("VP Sales", "STRIPE")
        h2 = compute_content_hash("vp sales", "stripe")
        assert h1 == h2

    def test_content_hash_strips_whitespace(self):
        """Test that hash strips leading/trailing whitespace."""
        h1 = compute_content_hash("VP Sales", "Stripe")
        h2 = compute_content_hash("  VP Sales  ", "  Stripe  ")
        assert h1 == h2

    def test_content_hash_different_for_different_inputs(self):
        """Test that different inputs produce different hashes."""
        h1 = compute_content_hash("VP Sales", "Stripe")
        h2 = compute_content_hash("Director Marketing", "Stripe")
        h3 = compute_content_hash("VP Sales", "Shopify")
        assert h1 != h2
        assert h1 != h3
        assert h2 != h3

    def test_content_hash_length(self):
        """Test that hash is 32 characters (SHA256 truncated)."""
        h = compute_content_hash("VP Sales", "Stripe")
        assert len(h) == 32
        assert h.isalnum()


class TestGetContentHash:
    """Tests for get_content_hash function."""

    def test_returns_dict_with_content_hash(self):
        """Test that function returns dict with content_hash key."""
        result = get_content_hash("VP Sales", "Stripe")
        assert "content_hash" in result
        assert isinstance(result["content_hash"], str)

    def test_hash_matches_compute_function(self):
        """Test that returned hash matches compute_content_hash."""
        result = get_content_hash("VP Sales", "Stripe")
        expected = compute_content_hash("VP Sales", "Stripe")
        assert result["content_hash"] == expected


class TestIsDuplicate:
    """Tests for is_duplicate function."""

    @patch("src.db.dedup.get_client")
    def test_is_duplicate_checks_url_first(self, mock_get_client):
        """Test that URL match is checked first."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        # Mock URL match found
        mock_url_result = MagicMock()
        mock_url_result.data = [{"id": "123"}]

        mock_client.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_url_result

        result = is_duplicate("VP Sales", "Stripe", "https://linkedin.com/jobs/123")

        assert result is True
        # Verify URL was checked
        mock_client.table.assert_called_with("signals")

    @patch("src.db.dedup.get_client")
    def test_is_duplicate_checks_hash_when_no_url_match(self, mock_get_client):
        """Test that hash is checked when URL doesn't match."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        # Mock no URL match
        mock_url_result = MagicMock()
        mock_url_result.data = []

        # Mock hash match found
        mock_hash_result = MagicMock()
        mock_hash_result.data = [{"id": "456"}]

        # Mock prefix check (shouldn't reach this)
        mock_prefix_result = MagicMock()
        mock_prefix_result.data = []

        # Chain the mock calls
        table_mock = MagicMock()
        mock_client.table.return_value = table_mock

        # URL check returns no match
        url_chain = MagicMock()
        url_chain.execute.return_value = mock_url_result
        table_mock.select.return_value.eq.return_value.limit.return_value = url_chain

        # Hash check returns match
        hash_chain = MagicMock()
        hash_chain.execute.return_value = mock_hash_result
        table_mock.select.return_value.contains.return_value.limit.return_value = hash_chain

        result = is_duplicate("VP Sales", "Stripe", "https://linkedin.com/jobs/new")

        assert result is True

    @patch("src.db.dedup.get_client")
    def test_is_duplicate_checks_prefix_when_no_hash_match(self, mock_get_client):
        """Test that title prefix is checked when hash doesn't match."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        table_mock = MagicMock()
        mock_client.table.return_value = table_mock

        # Mock all checks returning no match, then prefix returns match
        select_mock = MagicMock()
        table_mock.select.return_value = select_mock

        # URL check - no match
        url_chain = MagicMock()
        url_chain.execute.return_value.data = []
        select_mock.eq.return_value.limit.return_value = url_chain

        # Hash check - no match
        hash_chain = MagicMock()
        hash_chain.execute.return_value.data = []
        select_mock.contains.return_value.limit.return_value = hash_chain

        # Prefix check - match found
        prefix_chain = MagicMock()
        prefix_chain.execute.return_value.data = [{"id": "789"}]
        select_mock.ilike.return_value.eq.return_value.limit.return_value = prefix_chain

        result = is_duplicate("VP Sales East Region", "Stripe", "https://linkedin.com/jobs/unique")

        assert result is True

    @patch("src.db.dedup.get_client")
    def test_is_duplicate_returns_false_when_no_match(self, mock_get_client):
        """Test that False is returned when no duplicate strategies match."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        table_mock = MagicMock()
        mock_client.table.return_value = table_mock

        select_mock = MagicMock()
        table_mock.select.return_value = select_mock

        # All checks return no match
        empty_result = MagicMock()
        empty_result.data = []

        select_mock.eq.return_value.limit.return_value.execute.return_value = empty_result
        select_mock.contains.return_value.limit.return_value.execute.return_value = empty_result
        select_mock.ilike.return_value.eq.return_value.limit.return_value.execute.return_value = empty_result

        result = is_duplicate("Brand New Role", "New Company", "https://linkedin.com/jobs/new")

        assert result is False
