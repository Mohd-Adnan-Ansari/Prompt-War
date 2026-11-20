import os
import json
import logging
import time
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.primary_model = settings.GEMINI_PRIMARY_MODEL
        self.candidate_models = settings.GEMINI_FALLBACK_MODELS
        self.client = None
        self.client_ready = False
        self.last_error = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                self.client_ready = True
                logger.info("Initialized Google GenAI client with GEMINI_API_KEY.")
            except Exception as e:
                self.last_error = f"Failed to initialize google.genai: {str(e)}"
                logger.error(self.last_error)
        else:
            self.last_error = "GEMINI_API_KEY not configured in .env"
            logger.warning(self.last_error)

    def test_connection(self) -> Dict[str, Any]:
        """Validates the live Gemini API connection and returns detailed diagnostics."""
        if not self.api_key:
            return {
                "connected": False,
                "error": "GEMINI_API_KEY is not set in .env",
                "status_code": 401
            }

        if not self.client:
            return {
                "connected": False,
                "error": self.last_error or "GenAI client could not be created",
                "status_code": 500
            }

        start = time.time()
        for model_name in self.candidate_models:
            try:
                res = self.client.models.generate_content(
                    model=model_name,
                    contents="Reply with the single word: OK"
                )
                latency = round((time.time() - start) * 1000, 1)
                return {
                    "connected": True,
                    "model_used": model_name,
                    "response": res.text.strip(),
                    "latency_ms": latency,
                    "api_version": "google.genai SDK",
                    "status": "Operational"
                }
            except Exception as e:
                err_str = str(e)
                logger.warning(f"Connection test on {model_name} failed: {err_str}")
                continue

        return {
            "connected": False,
            "error": "Failed to connect to any Gemini models in fallback chain. Possible quota exhaustion or temporary service unavailability.",
            "status_code": 503
        }

    def generate_json(self, prompt: str, system_prompt: str = "") -> Optional[Dict[str, Any]]:
        """
        Generates structured JSON output using Gemini API.
        Automatically retries across candidate models on transient failures or quota issues.
        Returns parsed dict on success, or None on failure to trigger safe fallback.
        """
        if not self.client_ready or not self.client:
            return None

        from google.genai import types

        # Build config with JSON schema requirement
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            system_instruction=system_prompt if system_prompt else None,
            temperature=0.2, # Low temperature for accurate crisis classification & planning
        )

        for model_name in self.candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                )
                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    logger.info(f"Gemini API ({model_name}) successfully generated structured response.")
                    return parsed
            except json.JSONDecodeError as jde:
                logger.warning(f"Gemini model {model_name} returned non-JSON text: {jde}")
                # Try basic cleanup if wrapped in markdown blocks
                try:
                    raw = response.text.strip()
                    if raw.startswith("```json"):
                        raw = raw[7:]
                    if raw.endswith("```"):
                        raw = raw[:-3]
                    return json.loads(raw.strip())
                except Exception:
                    continue
            except Exception as e:
                err_msg = str(e)
                # Specific error classification
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                    logger.warning(f"Gemini quota limit reached for {model_name}: {err_msg}")
                elif "401" in err_msg or "403" in err_msg:
                    logger.error(f"Gemini authorization error (invalid API key): {err_msg}")
                    break # Don't retry if the key is unauthorized
                elif "503" in err_msg or "UNAVAILABLE" in err_msg:
                    logger.warning(f"Gemini model {model_name} temporarily overloaded (503): {err_msg}")
                else:
                    logger.warning(f"Gemini API call on {model_name} failed: {err_msg}")
                continue

        logger.info("All Gemini model attempts exhausted; engaging deterministic fallback engine.")
        return None

    def generate_text(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        """Generates natural language response for CrisisAI Assistant grounded in platform data."""
        if not self.client_ready or not self.client:
            return None

        from google.genai import types

        config = types.GenerateContentConfig(
            system_instruction=system_prompt if system_prompt else None,
            temperature=0.3,
        )

        for model_name in self.candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini text generation failed on {model_name}: {e}")
                continue

        return None

llm_service = LLMService()
