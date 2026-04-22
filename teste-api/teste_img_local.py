import requests
import json
import os
from dotenv import load_dotenv
import base64
from prompts import TEMPLATE_GLICEMIA_PROMPT

load_dotenv()
api_key = os.getenv("API_KEY")

def encode_image(caminho_imagem):
    with open(caminho_imagem, "rb") as img:
        return base64.b64encode(img.read()).decode("utf-8")

base64_image = encode_image("./comida")

response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
  },
  data=json.dumps({
    "model": "nvidia/nemotron-nano-12b-v2-vl:free",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": TEMPLATE_GLICEMIA_PROMPT
          },
          {
            "type": "image_url",
            "image_url": {
              "url": f"data:image/jpeg;base64,{base64_image}"
            }
          }
        ]
      }
    ],
    "reasoning": {"enabled": False}
  })
)

response = response.json()
response = response['choices'][0]['message']['content']
print(response)