import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print("GEMINI_API_KEY found:", bool(key))

from google import genai

client = genai.Client(api_key=key)
models_to_test = [
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-2.5-pro",
]

for m in models_to_test:
    try:
        print(f"Testing model: {m}...")
        res = client.models.generate_content(
            model=m,
            contents="State the single word: READY"
        )
        print(f"SUCCESS with {m}! Response: {res.text.strip()}")
        break
    except Exception as e:
        print(f"Failed {m}: {e}")
