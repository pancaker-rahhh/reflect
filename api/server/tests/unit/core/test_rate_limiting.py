from freezegun import freeze_time
from app.core.rate_limiting import (
    check_rate_limit,
    get_rate_limit_config,
    get_anonymous_ip_limit_config,
    RATE_LIMITS,
    ANONYMOUS_IP_LIMITS,
)


class TestCheckRateLimit:
    def test_enforces_limits_correctly(self, mock_rate_limit_storage):
        client_ip = '127.0.0.1'
        endpoint_type = 'feedback_submission'
        for i in range(5):
            result = check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
            assert result is True
        result = check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
        assert result is False

    def test_different_limits_anonymous_vs_authenticated(self, mock_rate_limit_storage):
        client_ip = '127.0.0.1'
        endpoint_type = 'feedback_submission'
        for i in range(3):
            result = check_rate_limit(client_ip, endpoint_type, is_anonymous=True)
            assert result is True
        result = check_rate_limit(client_ip, endpoint_type, is_anonymous=True)
        assert result is False

    def test_ip_based_tracking(self, mock_rate_limit_storage):
        ip1 = '127.0.0.1'
        ip2 = '192.168.1.1'
        endpoint_type = 'feedback_submission'
        for _ in range(5):
            check_rate_limit(ip1, endpoint_type, is_anonymous=False)
        result = check_rate_limit(ip2, endpoint_type, is_anonymous=False)
        assert result is True

    @freeze_time('2025-01-01 12:00:00')
    def test_period_expiration(self, mock_rate_limit_storage):
        client_ip = '127.0.0.1'
        endpoint_type = 'feedback_submission'
        for _ in range(5):
            check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
        assert check_rate_limit(client_ip, endpoint_type, is_anonymous=False) is False
        with freeze_time('2025-01-01 12:01:01'):
            result = check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
            assert result is True

    def test_rate_limit_exceeded_logging(self, mock_rate_limit_storage, caplog):
        client_ip = '127.0.0.1'
        endpoint_type = 'feedback_submission'
        for _ in range(5):
            check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
        check_rate_limit(client_ip, endpoint_type, is_anonymous=False)
        assert 'Rate limit exceeded' in caplog.text


class TestRateLimitConfig:
    def test_get_rate_limit_config(self):
        config = get_rate_limit_config('feedback_submission')
        assert config['calls'] == 5
        assert config['period'] == 60

    def test_get_rate_limit_config_default(self):
        config = get_rate_limit_config('unknown_type')
        assert config == RATE_LIMITS['general_public']

    def test_get_anonymous_ip_limit_config(self):
        config = get_anonymous_ip_limit_config('feedback_submission')
        assert config['calls'] == 3
        assert config['period'] == 300

    def test_endpoint_limits(self):
        assert RATE_LIMITS['feedback_submission']['calls'] == 5
        assert RATE_LIMITS['widget_access']['calls'] == 30
        assert RATE_LIMITS['voting']['calls'] == 20
        assert RATE_LIMITS['subscription_change']['calls'] == 1
        assert RATE_LIMITS['general_public']['calls'] == 40
        assert ANONYMOUS_IP_LIMITS['feedback_submission']['calls'] == 3
        assert ANONYMOUS_IP_LIMITS['voting']['calls'] == 10
