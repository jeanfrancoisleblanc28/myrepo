"""Tests unitaires pour `recommend_zone` (logique de recommandation de zone)."""

import pytest

from commissaire_industriel import ZoneRecommendation, recommend_zone


def _reponse(secteur: str = "", besoins: str = "") -> dict:
    """Helper : construit un dict réponse minimal pour les tests."""
    return {
        "secteur": secteur,
        "superficie": "",
        "budget": "",
        "echeancier": "",
        "emplois": "",
        "besoins_speciaux": besoins,
    }


# ---------------------------------------------------------------------------
# Mots-clés sectoriels → zone correcte
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "secteur",
    ["pétrochimie", "Chimie fine", "raffinerie de pétrole", "Acier inoxydable", "Sidérurgie"],
)
def test_industrie_lourde_route_vers_m2(secteur):
    reco = recommend_zone(_reponse(secteur=secteur))
    assert reco.code == "M-2"
    assert "lourde" in reco.zone_label
    assert reco.prix_estime == "3,00 – 4,00 $/pi²"
    assert reco.is_default is False


@pytest.mark.parametrize(
    "secteur",
    ["logistique", "Transport routier", "entrepôt frigorifique", "Distribution alimentaire"],
)
def test_logistique_route_vers_m1_a30(secteur):
    reco = recommend_zone(_reponse(secteur=secteur))
    assert reco.code == "M-1"
    assert "A-30" in reco.zone_label
    assert reco.prix_estime == "4,00 – 5,50 $/pi²"


@pytest.mark.parametrize(
    "secteur",
    ["agroalimentaire", "agricole", "Transformation alimentaire", "transformation laitière"],
)
def test_agroalimentaire_route_vers_m1_agro(secteur):
    reco = recommend_zone(_reponse(secteur=secteur))
    assert reco.code == "M-1"
    assert "agro-industrielle" in reco.zone_label
    assert "Saint-Robert" in reco.secteur


def test_secteur_inconnu_retourne_default():
    reco = recommend_zone(_reponse(secteur="biotech quantique"))
    assert reco.is_default is True
    assert reco.code == "M-1"
    assert reco.prix_estime == ""
    assert reco.secteur == ""


def test_secteur_vide_retourne_default():
    reco = recommend_zone(_reponse(secteur=""))
    assert reco.is_default is True


def test_secteur_absent_du_dict_ne_crash_pas():
    """Robustesse : reponses peut être incomplet (ex. tests, intégration LLM)."""
    reco = recommend_zone({})
    assert reco.is_default is True


def test_secteur_none_ne_crash_pas():
    """Robustesse : un secteur None doit être traité comme une chaîne vide."""
    reco = recommend_zone({"secteur": None, "besoins_speciaux": None})
    assert reco.is_default is True
    assert reco.besoins_speciaux == ""


# ---------------------------------------------------------------------------
# Priorité des règles (l'ordre des if/elif doit être stable)
# ---------------------------------------------------------------------------


def test_priorite_industrie_lourde_sur_logistique():
    """Si le secteur contient à la fois 'pétrole' et 'transport', M-2 gagne (lourd > léger)."""
    reco = recommend_zone(_reponse(secteur="transport de pétrole"))
    assert reco.code == "M-2"


def test_priorite_logistique_sur_agroalimentaire():
    """Si le secteur contient 'distribution' (logistique) et 'alimentaire', logistique gagne."""
    reco = recommend_zone(_reponse(secteur="distribution alimentaire"))
    # 'distribution' match logistique en premier dans l'ordre des if.
    assert reco.code == "M-1"
    assert "A-30" in reco.zone_label


# ---------------------------------------------------------------------------
# Besoins spéciaux
# ---------------------------------------------------------------------------


def test_besoins_speciaux_sont_normalises_en_minuscules():
    reco = recommend_zone(_reponse(secteur="logistique", besoins="ACCÈS FLEUVE + RAIL"))
    assert reco.besoins_speciaux == "accès fleuve + rail"


def test_sans_besoins_speciaux_le_champ_reste_vide():
    reco = recommend_zone(_reponse(secteur="logistique", besoins=""))
    assert reco.besoins_speciaux == ""


# ---------------------------------------------------------------------------
# Forme du retour
# ---------------------------------------------------------------------------


def test_retour_est_un_dataclass_immuable():
    reco = recommend_zone(_reponse(secteur="logistique"))
    assert isinstance(reco, ZoneRecommendation)
    with pytest.raises(Exception):
        reco.code = "M-2"  # type: ignore[misc]
