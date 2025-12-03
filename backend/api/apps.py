from django.apps import AppConfig
from .utils.generate import generate, read_csv, check_loaded


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
            from django.conf import settings

            # Only initialize cache if not already done
            if not hasattr(settings, "CSV_CACHE"):
                osave = read_csv("osave")
                dali = read_csv("dali")
                dti = read_csv("dti")

                check_loaded(osave)
                check_loaded(dali)
                check_loaded(dti)

                settings.CSV_CACHE = {
                    "osave": osave,
                    "dali": dali,
                    "dti": dti
                }
