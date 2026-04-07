from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import Activity

class Command(BaseCommand):
    help = 'Delete activities older than 7 days'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to keep activities (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Find old activities
        old_activities = Activity.objects.filter(created_at__lt=cutoff_date)
        count = old_activities.count()
        
        if dry_run:
            self.stdout.write(f"Would delete {count} activities older than {days} days")
            for activity in old_activities[:10]:  # Show first 10
                self.stdout.write(f"  - {activity.created_at}: {activity.title}")
            if count > 10:
                self.stdout.write(f"  ... and {count - 10} more")
        else:
            # Delete old activities
            deleted_count, _ = old_activities.delete()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully deleted {deleted_count} activities older than {days} days")
            )