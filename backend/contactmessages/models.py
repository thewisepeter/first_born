from django.db import models

# Create your models here.
class TestimonyMessage(models.Model):
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.firstName} - {self.lastName} - {self.email}"


class ContactMessage(models.Model):
    fullName = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fullName} - {self.email}"
