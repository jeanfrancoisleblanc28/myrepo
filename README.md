# Gestionnaire de prêts à terme

Application web de gestion des prêts à terme pour les organismes de développement économique.

---

## Fonctionnalités

- **Gestion des emprunteurs** — créer, consulter et modifier les dossiers clients.
- **Gestion des prêts** — créer des prêts avec génération automatique du calendrier d'amortissement (convention 30/360).
- **Enregistrement des paiements** — allocation automatique : intérêts d'abord, puis capital ; historique immuable.
- **Rapports et exports CSV** — rapport sommaire de tous les prêts, historique des paiements par prêt.
- **Indicateurs comptables** — solde capital, intérêts courus, prochaine échéance, jours en retard.

---

## Démarrage rapide

### Prérequis

- Python 3.12 ou supérieur
- pip

### Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/jeanfrancoisleblanc28/myrepo.git
cd myrepo

# 2. Créer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Démarrer le serveur
uvicorn app.main:app --reload
```

Ouvrir [http://localhost:8000](http://localhost:8000) dans votre navigateur.

### Avec Docker

```bash
docker compose up --build
```

L'application est disponible à [http://localhost:8000](http://localhost:8000).

---

## Structure du projet

```
app/
├── main.py                  # Point d'entrée FastAPI
├── database.py              # Configuration SQLAlchemy + SQLite
├── models.py                # Modèles ORM (Borrower, Loan, Payment, AmortizationEntry)
├── schemas.py               # Schémas Pydantic
├── templates_config.py      # Configuration Jinja2
├── routers/
│   ├── borrowers.py         # Routes emprunteurs
│   ├── loans.py             # Routes prêts + amortissement
│   ├── payments.py          # Routes paiements
│   └── reports.py           # Routes rapports + CSV
├── services/
│   ├── amortization.py      # Calcul du calendrier d'amortissement
│   └── payment_service.py   # Allocation des paiements
└── templates/               # Gabarits HTML (Jinja2)
alembic/                     # Migrations de base de données
tests/
├── test_amortization.py     # Tests d'amortissement
└── test_payments.py         # Tests d'allocation des paiements
```

---

## Convention de calcul

- **Day-count convention** : **30/360** — chaque mois est traité comme 30 jours, l'année comme 360 jours.
- **Taux mensuel** : `APR / 12`
- **Paiement mensuel fixe** : `PMT = P × r / (1 − (1+r)^-n)`
- **Allocation d'un paiement** : intérêts courus en premier, puis réduction du capital.

---

## Tests

```bash
python -m pytest tests/ -v
```

---

## API REST

La documentation interactive est disponible à :

- Swagger UI : [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc : [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Migration de base de données (Alembic)

```bash
# Appliquer les migrations
alembic upgrade head

# Générer une nouvelle migration
alembic revision --autogenerate -m "description"
```

---

## Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives de contribution.

## Licence

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour les détails.

---

## English summary

This is a **Term Loan Manager** web application built with Python + FastAPI + SQLite.
It allows economic development organizations to manage their term loan portfolio:
record borrowers and loans, generate amortization schedules, record payments with
automatic interest-first allocation, and export CSV reports.

**Quick start:** `pip install -r requirements.txt && uvicorn app.main:app --reload`