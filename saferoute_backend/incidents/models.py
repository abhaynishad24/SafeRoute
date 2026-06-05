from django.db import models

class Incident(models.Model):
    location = models.CharField(max_length=200)
    incident_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, default="Medium")
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    category =models.CharField(max_length=50, default="other")

    def __str__(self):
        return self.incident_type