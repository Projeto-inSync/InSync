from google import genai
from google.genai import types
from PIL import Image
import io
import base64
import os
from dotenv import load_dotenv
import time

load_dotenv()
client = genai.Client(api_key=os.getenv("API_KEY"))

classification_functions = {
    "carbohydrates": lambda status: status.adicionar_carboidratos(),
    "carbs":         lambda status: status.adicionar_carboidratos(),
    "fruits":        lambda status: status.adicionar_frutas(),
    "fruit":         lambda status: status.adicionar_frutas(),
    "vegetables":    lambda status: status.adicionar_legumes(),
    "veggies":       lambda status: status.adicionar_legumes(),
    "dairy":         lambda status: status.adicionar_leite_e_derivados(),
    "milk":          lambda status: status.adicionar_leite_e_derivados(),
    "proteins":      lambda status: status.adicionar_carnes(),
    "protein":       lambda status: status.adicionar_carnes(),
    "meat":          lambda status: status.adicionar_carnes(),
    "nuts":          lambda status: status.adicionar_oleaginosas(),
    "sweets":        lambda status: status.adicionar_doces(),
    "candy":         lambda status: status.adicionar_doces(),
    "snacks":        lambda status: status.adicionar_snacks(),
    "snack":         lambda status: status.adicionar_snacks(),
    "sausages":      lambda status: status.adicionar_embutidos(),
    "sausage":       lambda status: status.adicionar_embutidos(),
}

PROMPT = (
    "You are a food classifier for a health app designed for diabetic children. "
    "Look carefully at the image. "
    "If there is any food, packaging, label, or edible item visible, classify it using exactly ONE of these words: "
    "Carbohydrates, Fruits, Vegetables, Dairy, Proteins, Legumes, Nuts, "
    "Sweets, Snacks, Sausages. "
    "\n\nGuidelines:\n"
    "- Sweets: candy, chocolate, cake, ice cream, cookies with sugar, soda, juice box with sugar.\n"
    "- Snacks: chips, crackers, popcorn (flavored), instant noodles, fast food, processed snack packs.\n"
    "- Sausages: hot dog, salami, mortadella, ham, pepperoni.\n"
    "- If multiple foods are visible, classify the predominant or most harmful one.\n"
    "Only reply 'nfound' if there is absolutely no food or food-related item in the image. "
    "Reply with ONE word only, no punctuation, no explanation."
)

def process_image_service(image_base64: str, status):
    max_tentativas = 3

    for tentativa in range(max_tentativas):
        try:
            antes = {k: v for k, v in status.dados.items()}

            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert("RGB")
            image.thumbnail((1024, 1024))

            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=[PROMPT, image],
            )

            classification = response.text.strip().rstrip(".").strip()
            key = classification.lower()

            print(f"Classificação recebida: '{classification}' -> chave: '{key}'")

            if key in classification_functions:
                classification_functions[key](status)
            else:
                print(f"Classificação '{key}' não reconhecida, nenhum status alterado.")
            
            delta = {k: round(status.dados[k] - antes[k], 2) for k in status.dados}
            return classification, delta
        
        except Exception as e:
            print(f"Tentativa {tentativa + 1} falhou: {e}")
            if tentativa < max_tentativas - 1:
                time.sleep(2)

    return "error", {"carboidrato": 0, "glicemia": 0, "proteina": 0, "xp": 0}