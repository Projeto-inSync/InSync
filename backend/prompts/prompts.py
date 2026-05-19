TEMPLATE_GLICEMIA_PROMPT = """
Considerando a imagem enviada, estime a quantidade de cada item e calcule o índice glicêmico de cada item, a totalidade da composição, por fim, uma classificação do quão adequada é a refeição.

Exemplo:
- Em um prato com uma banana e uma maçã:
Resposta esperada:
- Maçã: IG baixo (36 a 44)
- Banana: IG moderado (30 a 62)

Total acumulado:
- IG baixo: (~80)

Sua resposta deve conter apenas o formato descrito, sem nenhum raciocínio ou explicação adicional

Response:
"""