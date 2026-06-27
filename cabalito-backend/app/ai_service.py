import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
_model = genai.GenerativeModel("gemini-2.5-flash")


def validate_price(reported_price: float, historical_avg: float) -> str:
    """Anti-troll filter: returns VALID or INVALID."""
    if historical_avg <= 0:
        return "VALID"
    ratio = reported_price / historical_avg
    if ratio < 0.1 or ratio > 10:
        return "INVALID"
    prompt = (
        f"Eres un validador de precios de mercado en Bolivia. "
        f"El precio histórico promedio de un producto es {historical_avg:.2f} Bs. "
        f"Un usuario reporta el precio de {reported_price:.2f} Bs. "
        f"Responde SOLO con la palabra 'VALID' si el precio es plausible, "
        f"o 'INVALID' si parece un error o trolleo. Sin explicaciones."
    )
    try:
        resp = _model.generate_content(prompt)
        result = resp.text.strip().upper()
        return "VALID" if "VALID" in result else "INVALID"
    except Exception:
        return "VALID"


def explain_event(event_description: str, region_name: str, event_type: str) -> str:
    """Generate empathetic economic impact explanation."""
    prompt = (
        f"Eres 'La Casera IA', una asistente empática que ayuda a familias bolivianas. "
        f"Ha ocurrido un evento de tipo '{event_type}' en '{region_name}': {event_description}. "
        f"Explica en 3 oraciones cómo este evento afectará los precios de la canasta familiar, "
        f"usando un tono cercano, humano y esperanzador. Habla en español boliviano."
    )
    try:
        resp = _model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return f"El evento '{event_type}' en {region_name} podría generar alzas temporales en los precios. Mantente atento a las alternativas."


def casera_chat(user_message: str, green_products: list[str], product_name: str) -> str:
    """Chatbot La Casera IA — savings advice based on GREEN products."""
    green_list = ", ".join(green_products) if green_products else "arroz, zanahoria, aceite"
    prompt = (
        f"Eres 'La Casera IA', una asistente cariñosa y experta en cocina boliviana económica. "
        f"El usuario consulta sobre el producto '{product_name}' que está caro o escaso. "
        f"Los productos actualmente disponibles y con buen precio en el mercado son: {green_list}. "
        f"El usuario dice: '{user_message}'. "
        f"Responde con alternativas de ahorro, recetas fáciles y consejos prácticos usando SOLO los productos disponibles. "
        f"Usa un tono cálido, cercano y boliviano. Máximo 4 oraciones."
    )
    try:
        resp = _model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return f"Te recomiendo usar {green_list} como alternativas económicas. ¡Son nutritivos y están a buen precio hoy!"
