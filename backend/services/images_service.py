from google import genai
from google.genai import types
from PIL import Image
import io
import base64
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("API_KEY"))

classification_functions = {
    "Carbohydrates": lambda status: status.adicionar_carboidratos(),
    "carbohydrates": lambda status: status.adicionar_carboidratos(),
    "Carbs": lambda status: status.adicionar_carboidratos(),
    "carbs": lambda status: status.adicionar_carboidratos(),
    "Fruits": lambda status: status.adicionar_frutas(),
    "Fruit": lambda status: status.adicionar_frutas(),
    "fruits": lambda status: status.adicionar_frutas(),
    "fruit": lambda status: status.adicionar_frutas(),
    "Vegetables": lambda status: status.adicionar_legumes(),
    "vegetables": lambda status: status.adicionar_legumes(),
    "Veggies": lambda status: status.adicionar_legumes(),
    "veggies": lambda status: status.adicionar_legumes(),
    "Dairy": lambda status: status.adicionar_leite_e_derivados(),
    "dairy": lambda status: status.adicionar_leite_e_derivados(),
    "Milk": lambda status: status.adicionar_leite_e_derivados(),
    "milk": lambda status: status.adicionar_leite_e_derivados(),
    "Proteins": lambda status: status.adicionar_carnes(),
    "proteins": lambda status: status.adicionar_carnes(),
    "Protein": lambda status: status.adicionar_carnes(),
    "protein": lambda status: status.adicionar_carnes(),
    "Meat": lambda status: status.adicionar_carnes(),
    "meat": lambda status: status.adicionar_carnes(),
    "Nuts": lambda status: status.adicionar_oleaginosas(),
    "nuts": lambda status: status.adicionar_oleaginosas(),
    "Sweets": lambda status: status.adicionar_doces(),
    "sweets": lambda status: status.adicionar_doces(),
    "Candy": lambda status: status.adicionar_doces(),
    "candy": lambda status: status.adicionar_doces(),
    "Sausages": lambda status: status.adicionar_embutidos(),
    "sausages": lambda status: status.adicionar_embutidos(),
    "Sausage": lambda status: status.adicionar_embutidos(),
    "sausage": lambda status: status.adicionar_embutidos(),
}

PROMPT = (
    "Classify the food in the image using exactly ONE of these words: "
    "Carbohydrates, Fruits, Vegetables, Dairy, Proteins, Legumes, Nuts, Sweets, Sausages, Snacks. "
    "If there is no food, reply: nfound. "
    "If there are multiple foods, classify the predominant one. "
    "Reply with ONE word only, no punctuation, no explanation."
)

def process_image_service(image_base64: str, status):
    try:
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[PROMPT, image],
        )

        classification = response.text.strip().rstrip(".")
        key = classification.lower()

        if key in classification_functions:
            classification_functions[key](status)

        return classification, status.dados
    
    except Exception as e:
        print(f"Erro no image_service: {e}")
        return "nfound", status.dados