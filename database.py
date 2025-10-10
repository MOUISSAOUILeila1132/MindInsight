# database.py (Version Synchrone avec Pymongo - Corrigée)

import os
from pymongo import MongoClient
from pymongo.database import Database # Pour le type hint de get_db
from dotenv import load_dotenv
import sys # Pour quitter en cas d'échec critique
import traceback # Utile pour le débogage

load_dotenv()

# --- Configuration MongoDB ---
# Assurez-vous que les variables d'environnement sont correctement nommées dans votre fichier .env
MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017/") # Utiliser MONGO_URI pour être cohérent avec main.py et ajouter / à la fin si pas spécifié
DATABASE_NAME = os.getenv("MONGO_DB_NAME", "docteurs_ia_db") # Utiliser MONGO_DB_NAME pour être cohérent

# Vérifier si les variables essentielles sont définies
if not MONGO_DETAILS or not DATABASE_NAME:
    print("❌ ERREUR CRITIQUE: Variables d'environnement MONGO_URI ou MONGO_DB_NAME non définies.")
    print("   ‼️ L'application ne peut pas fonctionner sans base de données. Arrêt.")
    sys.exit(1) # Quitter si la configuration manque

print(f"🗄️ Configuration MongoDB: URI={MONGO_DETAILS}, DB={DATABASE_NAME}")

# --- Gestionnaire de Connexion (Singleton simple) ---
class DBMongo:
    client: MongoClient = None
    db: Database = None

db_handler = DBMongo()

# --- Fonction pour établir la connexion (appelée au démarrage) ---
def connect_to_mongo():
    """Établit la connexion à la base de données MongoDB."""
    print("   🔧 Tentative de connexion à MongoDB...")
    try:
        # Créer le client MongoClient (synchrone)
        # serverSelectionTimeoutMS=5000 pour ne pas attendre indéfiniment
        db_handler.client = MongoClient(MONGO_DETAILS, serverSelectionTimeoutMS=5000)
        # La ligne suivante force la connexion/vérification
        db_handler.client.admin.command('ping') # Utiliser ping, plus standard
        print(f"   ✅ Connexion MongoDB établie avec succès (Base: {DATABASE_NAME}).")

        # Accéder à la base de données spécifique APRÈS avoir confirmé que le client est bon
        db_handler.db = db_handler.client[DATABASE_NAME]
        print(f"   ✅ Base de données '{DATABASE_NAME}' sélectionnée.")

    except Exception as e:
        print(f"   ❌ ERREUR CRITIQUE: Impossible de se connecter ou d'accéder à la base de données MongoDB '{DATABASE_NAME}': {e}")
        print("   ‼️ L'application ne peut pas fonctionner sans base de données. Arrêt.")
        db_handler.client = None # S'assurer que le client est bien None en cas d'échec
        db_handler.db = None     # S'assurer que db est bien None
        traceback.print_exc() # Afficher la trace complète pour le débogage
        sys.exit(1) # <-- Correction: QUITTER l'application si la connexion échoue

# --- Fonction pour fermer la connexion (appelée à l'arrêt) ---
def close_mongo_connection():
    """Ferme la connexion client MongoDB."""
    if db_handler.client:
        print("   🔌 Fermeture de la connexion MongoDB...")
        db_handler.client.close()
        print("   ✅ Connexion MongoDB fermée.")
    # Reset global pour éviter une utilisation après fermeture si jamais nécessaire
    db_handler.client = None
    db_handler.db = None


# --- Dépendance FastAPI pour obtenir l'objet DB ---
def get_db() -> Database:
    """
    Dépendance FastAPI (Synchrone): Retourne l'objet Database Pymongo initialisé.
    Lève une exception si la base de données n'a pas été initialisée correctement au démarrage.
    """
    # Avec sys.exit(1) dans connect_to_mongo, cette erreur ne devrait *jamais* se produire
    # si l'application a démarré avec succès. C'est une sauvegarde supplémentaire.
    if db_handler.db is None:
        print("   ⚠️ ERREUR INTERNE: get_db() appelé mais db_handler.db est None. Le startup a dû échouer silencieusement ou il y a une race condition.")
        # Bien que sys.exit(1) devrait empêcher cela, on laisse le raise pour un cas extrême
        raise RuntimeError("La connexion à la base de données n'est pas disponible.")
    return db_handler.db

# --- Optionnel: Helpers pour ObjectId ---
# Peuvent être utiles dans les routes pour valider et convertir les IDs MongoDB
from bson import ObjectId
from bson.errors import InvalidId

def str_to_objectid(id_str: str) -> ObjectId:
    """Convertit une string en ObjectId ou lève HTTPException si invalide."""
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise ValueError(f"L'ID fourni '{id_str}' n'est pas un ObjectId MongoDB valide.") # Utiliser ValueError ou HTTPException

def objectid_to_str(oid: ObjectId) -> str:
    """Convertit un ObjectId en string."""
    return str(oid)

# Exemple d'utilisation de str_to_objectid avec HTTPException (si vous préférez dans les routes)
# def get_valid_objectid(id_str: str):
#     try:
#         return ObjectId(id_str)
#     except InvalidId:
#         raise HTTPException(status_code=400, detail=f"ID '{id_str}' invalide")