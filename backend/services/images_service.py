import requests
import json
import os
from dotenv import load_dotenv
import base64
from prompts.prompts import TEMPLATE_GLICEMIA_PROMPT

load_dotenv()
api_key = os.getenv("API_KEY")

def process_image_service(imagem_b64, status):
    try:
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
                                    "url": f"data:image/jpeg;base64,{imagem_b64}"
                                }
                            }
                        ]
                    }
                ],
                "reasoning": {"enabled": False}
            })
        )

        print("Status OpenRouter:", response.status_code)
        print("Resposta OpenRouter:", response.text)

        data = response.json()

        if 'error' in data:
            raise Exception(f"OpenRouter error: {data['error']}")

        content = data['choices'][0]['message']['content']
        return content, 200

    except Exception as e:
        print(f"ERRO no LLM: {str(e)}")
        return f"Erro ao chamar LLM: {str(e)}", 500