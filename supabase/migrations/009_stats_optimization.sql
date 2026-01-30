-- Migration: Stats query optimization and missing indexes
-- Creates SQL function for efficient stats aggregation and adds composite indexes

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Index for filtering signals by user and ordering by detected_at
CREATE INDEX IF NOT EXISTS signals_user_detected_idx
  ON signals(user_id, detected_at DESC);

-- Index for filtering signals by user, type, and priority
CREATE INDEX IF NOT EXISTS signals_user_type_priority_idx
  ON signals(user_id, signal_type, priority);

-- Index for filtering signals by user and status
CREATE INDEX IF NOT EXISTS signals_user_status_idx
  ON signals(user_id, status);

-- ============================================
-- SQL FUNCTION FOR EFFICIENT STATS AGGREGATION
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_dashboard_stats(uuid);

-- Create optimized stats function that runs entirely in the database
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  v_total_signals int;
  v_new_signals int;
  v_high_priority int;
  v_converted int;
  v_conversion_rate int;
  v_emails_drafted int;
  v_signals_by_type json;
  v_signals_by_day json;
BEGIN
  -- Get aggregate counts in a single query
  SELECT
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE status = 'new')::int,
    COUNT(*) FILTER (WHERE priority = 'high')::int,
    COUNT(*) FILTER (WHERE status = 'converted')::int
  INTO v_total_signals, v_new_signals, v_high_priority, v_converted
  FROM signals
  WHERE user_id = p_user_id;

  -- Calculate conversion rate
  v_conversion_rate := CASE
    WHEN v_total_signals > 0 THEN ROUND((v_converted::numeric / v_total_signals) * 100)::int
    ELSE 0
  END;

  -- Get emails drafted count
  SELECT COUNT(*)::int INTO v_emails_drafted
  FROM generated_emails
  WHERE user_id = p_user_id;

  -- Get signals grouped by type
  SELECT COALESCE(json_object_agg(signal_type, cnt), '{}')
  INTO v_signals_by_type
  FROM (
    SELECT signal_type, COUNT(*)::int as cnt
    FROM signals
    WHERE user_id = p_user_id
    GROUP BY signal_type
  ) t;

  -- Get signals by day for last 7 days
  SELECT json_agg(
    json_build_object('date', day::date, 'count', COALESCE(cnt, 0))
    ORDER BY day
  )
  INTO v_signals_by_day
  FROM (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date as day
  ) days
  LEFT JOIN (
    SELECT detected_at::date as signal_date, COUNT(*)::int as cnt
    FROM signals
    WHERE user_id = p_user_id
      AND detected_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY detected_at::date
  ) signal_counts ON days.day = signal_counts.signal_date;

  -- Build the result JSON
  result := json_build_object(
    'total_signals', v_total_signals,
    'new_signals', v_new_signals,
    'high_priority', v_high_priority,
    'conversion_rate', v_conversion_rate,
    'emails_drafted', v_emails_drafted,
    'signals_by_type', v_signals_by_type,
    'signals_by_day', COALESCE(v_signals_by_day, '[]'::json)
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats(uuid) TO authenticated;
