"""
Stage 1: Intake & Multilingual Processing

Supports Azure AI Translator for real-time translation of Hindi / Punjabi / Indian regional
languages into an English working copy for downstream routing and agent processing.
"""

import json
import os
import requests
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)


MOCK_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "complaints_sample.json"
)


def _load_complaints():
    with open(MOCK_PATH, "r") as f:
        return json.load(f)


def translate_text(text: str) -> dict:
    """Uses Azure AI Translator to detect language and translate to English."""
    key = os.getenv("AZURE_TRANSLATOR_KEY")
    region = os.getenv("AZURE_TRANSLATOR_REGION", "eastus2")
    endpoint = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")

    if not key or "<your" in key:
        return {"language": "en", "translated_text": None}

    path = "/translate?api-version=3.0&to=en"
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
    }
    body = [{"text": text}]

    try:
        response = requests.post(endpoint.rstrip("/") + path, headers=headers, json=body, timeout=5)
        if response.status_code == 200:
            res = response.json()
            detected = res[0]["detectedLanguage"]["language"]
            translated = res[0]["translations"][0]["text"]
            return {
                "language": detected,
                "translated_text": translated if not detected.startswith("en") else None,
            }
    except Exception as e:
        print(f"[Azure Translator Warning] {e}")

    return {"language": "en", "translated_text": None}


def get_complaint(complaint_id: str) -> dict:
    for c in _load_complaints():
        if c["id"] == complaint_id:
            return c
    raise ValueError(f"Unknown mock complaint id: {complaint_id}")


def list_complaints() -> list:
    return _load_complaints()


def working_text(complaint: dict) -> str:
    """The English text routing/agents should reason over."""
    return complaint.get("translated_text") or complaint["raw_text"]


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> dict:
    """
    Uses Azure Cognitive Services Speech SDK to transcribe citizen voice recordings
    (supports Hindi / Indian English), and auto-translates for downstream routing.
    """
    speech_key = os.getenv("AZURE_SPEECH_KEY")
    speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus2")

    if not speech_key or "<your" in speech_key:
        return {
            "error": "Azure Speech key not configured",
            "transcribed_text": "",
            "_source": "local_fallback"
        }

    try:
        import tempfile
        import azure.cognitiveservices.speech as speechsdk

        suffix = os.path.splitext(filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
            speech_config.speech_recognition_language = "hi-IN"
            audio_config = speechsdk.audio.AudioConfig(filename=tmp_path)
            recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

            result = recognizer.recognize_once_async().get()
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                text = result.text.strip()
                trans_res = translate_text(text)
                return {
                    "transcribed_text": text,
                    "language": trans_res.get("language", "hi"),
                    "translated_text": trans_res.get("translated_text"),
                    "_source": "Azure Cognitive Services Speech (hi-IN)"
                }
            elif result.reason == speechsdk.ResultReason.NoMatch:
                return {
                    "error": "No speech detected in audio file",
                    "transcribed_text": "",
                    "_source": "Azure Speech"
                }
            else:
                return {
                    "error": f"Recognition cancelled or unformatted audio",
                    "transcribed_text": "",
                    "_source": "Azure Speech"
                }
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
    except Exception as e:
        print(f"[Azure Speech Warning] {e}")
        return {
            "error": str(e),
            "transcribed_text": "",
            "_source": "Azure Speech Exception"
        }

