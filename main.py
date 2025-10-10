# main.py - Version Corrigée avec événements FastAPI

# --- Standard Libraries ---
import os
import time
import traceback # Pour un meilleur débogage
import sys # Pour utiliser sys.exit() si nécessaire (bien que database.py le fasse déjà)

# --- Third-Party Libraries ---
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException # Importer ici une seule fois
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import BertTokenizer, BertForSequenceClassification
import tweepy
import pandas as pd
from dotenv import load_dotenv

# --- Local Application Imports ---
import database  # Importe le module database pour accéder à ses fonctions
from routers import doctors, patients # Importe le routeur depuis le dossier routers

# --- Configuration & Initialisation (exécuté une seule fois au démarrage du script) ---
print("🚀 Démarrage du script principal de l'API...")
load_dotenv() # Charge les variables depuis .env

# --- Configuration IA & Twitter ---
MODEL_PATH = os.getenv("MODEL_PATH", "model/bert_mental_health_model.bin") # Utiliser getenv avec défaut
BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

if not BEARER_TOKEN:
    print("❌ ERREUR CRITIQUE: TWITTER_BEARER_TOKEN non trouvé dans les variables d'environnement.")
    sys.exit(1) # Utiliser sys.exit(1) ici aussi pour cohérence

print("🐦 Initialisation du client Twitter...")
try:
    twitter_client = tweepy.Client(
        bearer_token=BEARER_TOKEN,
        wait_on_rate_limit=True,
        # connection_timeout=10, # Optionnel: timeout de connexion
        # request_timeout=30     # Optionnel: timeout de requête
    )
    # Note: Une simple initialisation ne garantit pas la connexion. Un appel test peut être utile.
    # Ex: user_info = twitter_client.get_me()
    # if not user_info.data:
    #     raise Exception("Impossible de récupérer les informations de l'utilisateur Twitter (Bearer Token invalide ?)")
    print("✅ Client Twitter initialisé.")
except tweepy.errors.TweepyException as e:
     print(f"❌ ERREUR CRITIQUE: Échec de l'initialisation du client Twitter: {e}")
     sys.exit(1) # Quitter en cas d'échec critique
except Exception as e:
    print(f"❌ ERREUR CRITIQUE: Erreur inattendue lors de l'initialisation de Twitter: {e}")
    sys.exit(1) # Quitter en cas d'échec critique


print("🧠 Chargement du tokenizer et du modèle BERT...")
try:
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    # Assurez-vous que NUM_LABELS est défini AVANT de charger le modèle
    # !! Assurez-vous que CLASS_LABELS est défini et correct pour votre modèle !!
    CLASS_LABELS = ["Normal", "Stressed", "Anxiety", "Depression", "Potential Suicide Post"] # Les 5 labels corrects
    NUM_LABELS = len(CLASS_LABELS)

    model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=NUM_LABELS)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Utilisation du device: {device}")

    if not os.path.exists(MODEL_PATH):
         print(f"❌ ERREUR CRITIQUE: Fichier modèle non trouvé à l'emplacement: {MODEL_PATH}")
         sys.exit(1)

    # Charger les poids du modèle avec map_location
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.to(device) # Mettre le modèle sur le bon device
    model.eval() # Mettre le modèle en mode évaluation (désactive dropout, etc.)
    print("✅ Modèle BERT chargé avec succès.")

except FileNotFoundError:
     print(f"❌ ERREUR CRITIQUE: Fichier modèle non trouvé à l'emplacement: {MODEL_PATH}")
     sys.exit(1) # Redondant avec la vérification os.path.exists, mais clair
except Exception as e:
    print(f"❌ ERREUR CRITIQUE: Erreur lors du chargement du modèle/tokenizer BERT: {e}")
    traceback.print_exc()
    sys.exit(1) # Quitter en cas d'échec critique


# --- Définition des Fonctions d'aide (Analyse IA) ---
# ... (Les fonctions get_user_tweets et predict_mental_state restent identiques) ...

def get_user_tweets(username: str, max_results: int = 10):
    """Récupère les tweets d'un utilisateur Twitter."""
    print(f"\n🔍 Tentative de récupération des tweets pour @{username} (max: {max_results})....")
    try:
        # 1. Obtenir l'ID de l'utilisateur
        print(f"   Obtention de l'ID utilisateur pour @{username}...")
        user_response = twitter_client.get_user(username=username)
        if not user_response.data:
            print(f"   ⚠️ Utilisateur Twitter @{username} non trouvé.")
            raise HTTPException(status_code=404, detail=f"L'utilisateur Twitter @{username} n'a pas été trouvé.")
        user_id = user_response.data.id
        print(f"   ID Utilisateur: {user_id}")

        # 2. Récupérer les tweets
        print(f"   Récupération des {max_results} derniers tweets...")
        fetch_count = max(5, min(100, max_results)) # Assurer que c'est dans les limites de l'API

        tweets_response = twitter_client.get_users_tweets(
            id=user_id,
            max_results=fetch_count,
            tweet_fields=["created_at", "public_metrics"] # Champs nécessaires
        )

        if not tweets_response.data:
            print(f"   ℹ️ Aucun tweet récent trouvé pour @{username}.")
            return [] # Retourner une liste vide est cohérent

        # 3. Formater les tweets
        formatted_tweets = []
        for tweet in tweets_response.data:
            likes = tweet.public_metrics.get("like_count", 0) if tweet.public_metrics else 0
            retweets = tweet.public_metrics.get("retweet_count", 0) if tweet.public_metrics else 0
            formatted_tweets.append({
                "id": tweet.id,
                "text": tweet.text,
                "created_at": str(tweet.created_at), # Convertir en string pour JSON
                "likes": likes,
                "retweets": retweets
            })

        print(f"✅ Récupéré {len(formatted_tweets)} tweets pour @{username}.")
        return formatted_tweets

    except tweepy.errors.NotFound:
         print(f"   ⚠️ Utilisateur Twitter @{username} non trouvé (Tweepy NotFound).")
         raise HTTPException(status_code=404, detail=f"L'utilisateur Twitter @{username} n'a pas été trouvé.")
    except tweepy.errors.TweepyException as e:
        print(f"   ❌ Erreur API Twitter pour @{username}: {e}")
        error_detail = f"Erreur de l'API Twitter: {e}"
        try:
             if hasattr(e, 'api_codes') and e.api_codes and hasattr(e, 'api_errors') and e.api_errors:
                  error_detail = f"Erreur API Twitter {e.api_codes[0]}: {e.api_errors[0]}"
        except Exception:
            pass
        raise HTTPException(status_code=503, detail=error_detail)
    except Exception as e:
        print(f"   ❌ Erreur inattendue lors de la récupération des tweets pour @{username}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne inattendue lors de la récupération des tweets.")


def predict_mental_state(text: str):
    """Prédit l'état mental à partir d'un texte en utilisant le modèle BERT."""
    if not text or not isinstance(text, str):
        print("   ⚠️ Texte invalide fourni pour la prédiction.")
        return "Invalid Input", {label: 0.0 for label in CLASS_LABELS}

    try:
        inputs = tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)[0]
        predicted_index = torch.argmax(probabilities).item()
        predicted_label = CLASS_LABELS[predicted_index]

        probabilities_dict = {
            CLASS_LABELS[i]: round(probabilities[i].item() * 100, 2)
            for i in range(len(CLASS_LABELS))
        }

        return predicted_label, probabilities_dict

    except Exception as e:
        print(f"   ❌ Erreur pendant la prédiction BERT pour le texte '{text[:50]}...': {e}")
        traceback.print_exc()
        return "Prediction Error", {label: 0.0 for label in CLASS_LABELS}


# --- FastAPI Application Setup ---
app = FastAPI(
    title="API Analyse IA & Gestion Docteurs",
    description="Combine l'analyse IA de profils Twitter et l'inscription/gestion des docteurs.",
    version="1.1.0"
)

# --- Handlers d'Événements de Démarrage et d'Arrêt ---
# !! C'est l'ajout clé pour l'initialisation de la base de données !!

@app.on_event("startup")
def startup_event():
    """
    Fonction exécutée par FastAPI au démarrage de l'application.
    Initialise la connexion à la base de données et d'autres ressources si nécessaire.
    """
    print("🚀 Événement de démarrage déclenché par FastAPI.")
    # Appelle la fonction de connexion définie dans database.py
    # Si la connexion échoue, database.connect_to_mongo() appelle sys.exit(1)
    # et l'application s'arrête.
    database.connect_to_mongo()
    # Ici vous pourriez ajouter d'autres initialisations si besoin (ex: chargement de caches, etc.)
    print("✅ Événement de démarrage terminé.")


@app.on_event("shutdown")
def shutdown_event():
    """
    Fonction exécutée par FastAPI à l'arrêt de l'application.
    Ferme la connexion à la base de données et libère d'autres ressources si nécessaire.
    """
    print("👋 Événement d'arrêt déclenché par FastAPI.")
    # Appelle la fonction de fermeture définie dans database.py
    database.close_mongo_connection()
    # Ici vous pourriez ajouter d'autres nettoyages si besoin
    print("✅ Événement d'arrêt terminé.")


# --- CORS Middleware Configuration ---
# IMPORTANT: Ajustez les origines selon l'URL exacte de votre frontend React
origins = [
    "http://localhost:8080",  # Si votre React tourne sur le port 8080
    "http://127.0.0.1:8080",
    "http://localhost:3000", # Ajoutez ceci si votre React tourne sur le port 3000 par défaut
    "http://127.0.0.1:3000",
    # Ajoutez l'URL de votre frontend déployé ici en production
]

print(f"🔧 Configuration CORS - Origines Autorisées: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Liste des origines autorisées
    allow_credentials=True,      # Permet les cookies/authentification si nécessaire
    allow_methods=["*"],         # Autorise toutes les méthodes (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],         # Autorise tous les en-têtes (ex: Content-Type, Authorization)
)

# --- Inclure les Routeurs ---
# Ajoute toutes les routes définies dans routers/doctors.py (préfixées par /api)
# Ces routes vont utiliser la dépendance get_db() qui s'attend à ce que db_handler.db soit initialisé
app.include_router(doctors.router, prefix="/api") # Ajout explicite du préfixe /api pour clarté
print("✅ Routeur pour les docteurs (/api/...) inclus.")

app.include_router(patients.router, prefix="/api") # <--- GARDEZ CETTE LIGNE
print("✅ Routeur pour les patients (/api/patients/...) inclus.")


# --- Modèles Pydantic pour la route /analyze ---
class AnalyzeRequest(BaseModel):
    username: str = Field(..., description="Nom d'utilisateur Twitter à analyser (sans le @)")
    max_tweets: int = Field(10, gt=0, le=100, description="Nombre max de tweets à analyser (entre 1 et 100)")

class TweetPrediction(BaseModel):
     id: int
     text: str
     created_at: str
     likes: int
     retweets: int
     predicted_state: str
     probabilities: dict[str, float]

class AnalysisResult(BaseModel):
    username: str
    tweets_analyzed: int
    overall_summary: dict[str, float]
    predictions: list[TweetPrediction]


# --- Routes principales définies dans main.py ---

@app.get("/", summary="Vérification de l'état de l'API", tags=["Général"])
async def root():
    """Endpoint simple pour confirmer que l'API est en ligne et fonctionnelle."""
    return {"message": "API Analyse IA & Gestion Docteurs est en ligne"}

@app.post("/analyze",
          response_model=AnalysisResult,
          summary="Analyser les tweets d'un utilisateur",
          tags=["Analyse IA"])
async def analyze_profile(request: AnalyzeRequest):
    """
    Récupère les tweets d'un utilisateur Twitter, prédit l'état mental
    pour chaque tweet et retourne un résumé global.
    """
    print(f"⚡ Requête reçue pour analyser @{request.username} (max_tweets: {request.max_tweets})")

    user_tweets = get_user_tweets(request.username, max_results=request.max_tweets)

    if not user_tweets:
        print(f"   ℹ️ Aucun tweet analysable trouvé pour @{request.username}.")
        return AnalysisResult(
             username=request.username,
             tweets_analyzed=0,
             overall_summary={label: 0.0 for label in CLASS_LABELS},
             predictions=[]
         )

    results = []
    total_predictions = {label: 0 for label in CLASS_LABELS}
    num_valid_predictions = 0

    print(f"   🤖 Analyse des {len(user_tweets)} tweets récupérés...")
    for i, tweet_data in enumerate(user_tweets):
        print(f"      Tweet {i+1}/{len(user_tweets)}: '{tweet_data['text'][:60]}...'")
        predicted_label, probabilities = predict_mental_state(tweet_data['text'])

        if predicted_label not in ["Invalid Input", "Prediction Error"]:
            total_predictions[predicted_label] += 1
            num_valid_predictions += 1

        results.append(TweetPrediction(
             id=tweet_data['id'],
             text=tweet_data['text'],
             created_at=tweet_data['created_at'],
             likes=tweet_data['likes'],
             retweets=tweet_data['retweets'],
             predicted_state=predicted_label,
             probabilities=probabilities
        ))

    overall_summary_percent = {}
    if num_valid_predictions > 0:
        for label, count in total_predictions.items():
            percentage = round((count / num_valid_predictions) * 100, 1)
            overall_summary_percent[label] = percentage
        print(f"   📊 Résumé calculé sur {num_valid_predictions} prédictions valides.")
    else:
         print(f"   ⚠️ Aucune prédiction valide n'a pu être faite.")
         overall_summary_percent = {label: 0.0 for label in CLASS_LABELS}

    print(f"✅ Analyse terminée pour @{request.username}. Résumé: {overall_summary_percent}")

    return AnalysisResult(
        username=request.username,
        tweets_analyzed=len(results),
        overall_summary=overall_summary_percent,
        predictions=results
    )


# --- Point d'entrée pour Uvicorn (lancement via terminal) ---
# L'utilisation de cette section n'est pas recommandée pour un lancement standard avec 'uvicorn main:app'
# car elle pourrait bypasser certains setups d'environnement ou de rechargement automatique.
# Conservez-la si vous lancez spécifiquement avec 'python main.py'
# if __name__ == "__main__":
#     import uvicorn
#     print("🚀 Lancement du serveur Uvicorn depuis main.py (pour développement)...")
#     # Note: Les événements startup/shutdown sont gérés par uvicorn lorsqu'il est lancé via cette méthode
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=8000,
#         reload=True,
#         log_level="info"
#     )

print("✅ Exécution du script principal terminée. Prêt à être démarré par Uvicorn.")
# Le message "API Analyse IA & Gestion Docteurs est en ligne" sera affiché
# lorsque l'événement startup sera terminé par Uvicorn.