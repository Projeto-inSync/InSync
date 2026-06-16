import smtplib
from email.mime.text import MIMEText
import os

def send_glycemia_alert_email(responsavel_email: str, responsavel_nome: str, filho_nome: str, glicemia: float):
    msg = MIMEText(
        f"Olá, {responsavel_nome}!\n\n"
        f"⚠️ Atenção: a glicemia de {filho_nome} está elevada.\n\n"
        f"Valor atual: {glicemia:.0f}%\n\n"
        f"Recomendamos verificar a alimentação de {filho_nome} "
        f"e consultar um profissional de saúde se necessário.\n\n"
        f"— Equipe InSync"
    )
    msg['Subject'] = f'⚠️ Alerta de Glicemia - {filho_nome} | InSync'
    msg['From'] = os.getenv('EMAIL_USER')
    msg['To'] = responsavel_email

    with smtplib.SMTP(os.getenv('EMAIL_HOST'), int(os.getenv('EMAIL_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASSWORD'))
        server.send_message(msg)

def send_reset_email(to_email: str, token: str):
    msg = MIMEText(
        f"Olá!\n\n"
        f"Seu código de recuperação de senha do InSync é:\n\n"
        f"  {token}\n\n"
        f"Ele é válido por 15 minutos.\n"
        f"Se não foi você quem solicitou, ignore este e-mail."
    )
    msg['Subject'] = 'Recuperação de senha - InSync'
    msg['From'] = os.getenv('EMAIL_USER')
    msg['To'] = to_email

    with smtplib.SMTP(os.getenv('EMAIL_HOST'), int(os.getenv('EMAIL_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASSWORD'))
        server.send_message(msg)