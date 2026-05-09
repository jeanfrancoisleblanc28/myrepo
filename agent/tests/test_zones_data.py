"""Tests de schéma pour agent/data/zones_industrielles.json.

Ces tests verrouillent le contrat de données utilisé par les handlers de
l'agent (handle_processus_achat, handle_zones_disponibles, etc.). Toute
dérive de la structure JSON sera détectée ici plutôt qu'en runtime devant
l'utilisateur final.

On évite délibérément d'ajouter une dépendance à `jsonschema` — le contrat
reste minimal et lisible en pur Python pour respecter `requirements.txt`.
"""

import commissaire_industriel as ci


def _data():
    return ci.load_data()


# ---------------------------------------------------------------------------
# Forme générale
# ---------------------------------------------------------------------------


class TestTopLevel:
    def test_required_top_level_keys_present(self):
        data = _data()
        for key in (
            "mrc",
            "region_administrative",
            "description",
            "municipalites",
            "avantages_concurrentiels",
            "programmes_aide",
            "contacts_cles",
            "reglementation_cle",
            "etapes_transaction",
        ):
            assert key in data, f"clé manquante : {key}"

    def test_mrc_is_pierre_de_saurel(self):
        # Le contenu est lié à la mission de la MRC — verrouillage nominal.
        assert _data()["mrc"] == "Pierre-De Saurel"


# ---------------------------------------------------------------------------
# municipalites[*].zones[*]
# ---------------------------------------------------------------------------


class TestMunicipalites:
    def test_municipalites_have_required_fields(self):
        for mun in _data()["municipalites"]:
            assert "nom" in mun
            assert isinstance(mun["nom"], str) and mun["nom"]

    def test_each_zone_has_code_and_type(self):
        for mun in _data()["municipalites"]:
            for zone in mun.get("zones", []):
                assert "code" in zone, f"zone sans code dans {mun['nom']}"
                assert "type" in zone, f"zone sans type dans {mun['nom']}"

    def test_zone_codes_are_known(self):
        # Les handlers et la logique de recommandation supposent des codes
        # M-1 / M-2. Une nouvelle valeur doit être un choix conscient.
        allowed_prefixes = ("M-1", "M-2")
        for mun in _data()["municipalites"]:
            for zone in mun.get("zones", []):
                assert zone["code"].startswith(
                    allowed_prefixes
                ), f"code de zone inattendu : {zone['code']} dans {mun['nom']}"

    def test_numeric_fields_are_numbers_when_present(self):
        for mun in _data()["municipalites"]:
            for zone in mun.get("zones", []):
                for k in ("superficie_disponible_ha", "prix_moyen_pied_carre"):
                    if k in zone:
                        assert isinstance(
                            zone[k], (int, float)
                        ), f"{k} doit être numérique dans {mun['nom']}/{zone['code']}"


# ---------------------------------------------------------------------------
# etapes_transaction
# ---------------------------------------------------------------------------


class TestEtapesTransaction:
    def test_has_acquisition_and_vente(self):
        data = _data()
        assert "acquisition" in data["etapes_transaction"]
        assert "vente" in data["etapes_transaction"]

    def test_each_etape_has_required_fields(self):
        data = _data()
        for kind in ("acquisition", "vente"):
            etapes = data["etapes_transaction"][kind]
            assert isinstance(etapes, list) and len(etapes) > 0
            for e in etapes:
                assert "etape" in e
                assert "nom" in e
                assert "description" in e

    def test_etape_numbers_are_consecutive(self):
        data = _data()
        for kind in ("acquisition", "vente"):
            numbers = [e["etape"] for e in data["etapes_transaction"][kind]]
            assert numbers == list(
                range(1, len(numbers) + 1)
            ), f"numéros d'étape non consécutifs dans {kind} : {numbers}"


# ---------------------------------------------------------------------------
# programmes_aide
# ---------------------------------------------------------------------------


class TestProgrammesAide:
    def test_each_programme_has_required_fields(self):
        for prog in _data()["programmes_aide"]:
            assert "nom" in prog
            assert "type" in prog
            assert "description" in prog


# ---------------------------------------------------------------------------
# contacts_cles
# ---------------------------------------------------------------------------


class TestContactsCles:
    def test_contacts_is_dict_of_dicts(self):
        contacts = _data()["contacts_cles"]
        assert isinstance(contacts, dict) and len(contacts) > 0
        for cid, contact in contacts.items():
            assert isinstance(contact, dict), f"{cid} n'est pas un dict"

    def test_each_contact_has_a_label(self):
        # handle_contacts utilise contact['organisation'] OU contact['nom'].
        for cid, contact in _data()["contacts_cles"].items():
            assert (
                "organisation" in contact or "nom" in contact
            ), f"contact {cid} n'a ni 'organisation' ni 'nom'"
