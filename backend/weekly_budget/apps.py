from django.apps import AppConfig

class WeeklyBudgetConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'weekly_budget'

    def ready(self):
        import weekly_budget.signals  # noqa