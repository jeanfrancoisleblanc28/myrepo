"""Tests pour l'agent commissaire industriel — MRC Pierre-De Saurel.

Ces tests verrouillent la logique pure de l'agent (chargement des données,
construction du prompt système, formatage et recommandation de zone) sans
déclencher l'I/O interactif (input/print).
"""

import json

import pytest

import commissaire_industriel as ci

# ---------------------------------------------------------------------------
# load_data
# ---------------------------------------------------------------------------


class TestLoadData:
    def test_returns_dict(self):
        data = ci.load_data()
        assert isinstance(data, dict)

    def test_contains_expected_top_level_keys(self):
        data = ci.load_data()
        expected = {
            "mrc",
            "region_administrative",
            "description",
            "municipalites",
            "avantages_concurrentiels",
            "programmes_aide",
            "contacts_cles",
            "reglementation_cle",
            "etapes_transaction",
        }
        assert expected.issubset(set(data.keys()))

    def test_municipalites_is_non_empty_list(self):
        data = ci.load_data()
        assert isinstance(data["municipalites"], list)
        assert len(data["municipalites"]) > 0


# ---------------------------------------------------------------------------
# build_system_prompt
# ---------------------------------------------------------------------------


class TestBuildSystemPrompt:
    def test_injects_territorial_data_as_json(self):
        data = {"mrc": "Pierre-De Saurel", "test_marker": "INJECTED-VALUE-123"}
        prompt = ci.build_system_prompt(data)
        assert "INJECTED-VALUE-123" in prompt

    def test_preserves_french_identity(self):
        prompt = ci.build_system_prompt({})
        # L'agent doit rester en français — verrouille l'identité.
        assert "Jean-François Leblanc" in prompt
        assert "MRC Pierre-De Saurel" in prompt
        assert "français" in prompt

    def test_payload_is_valid_json(self):
        # Le bloc {territorial_data} doit recevoir du JSON parseable, pour
        # qu'un LLM consommateur puisse s'y référer sans ambiguïté.
        data = {"foo": "bar", "n": 42, "lst": [1, 2, 3]}
        prompt = ci.build_system_prompt(data)
        # Le JSON injecté contient nos clés — extraction grossière suffit.
        assert '"foo"' in prompt
        assert '"bar"' in prompt
        assert '"n": 42' in prompt


# ---------------------------------------------------------------------------
# format_etapes
# ---------------------------------------------------------------------------


class TestFormatEtapes:
    def test_renders_each_step(self):
        etapes = [
            {"etape": 1, "nom": "Pré-qualification", "description": "Premier contact."},
            {"etape": 2, "nom": "Visite", "description": "Visite sur site."},
        ]
        out = ci.format_etapes(etapes)
        assert "Étape 1 — Pré-qualification" in out
        assert "Étape 2 — Visite" in out
        assert "Premier contact." in out
        assert "Visite sur site." in out

    def test_empty_list_returns_empty_string(self):
        assert ci.format_etapes([]) == ""


# ---------------------------------------------------------------------------
# recommend_zone — logique métier critique (zone proposée à l'investisseur)
# ---------------------------------------------------------------------------


class TestRecommendZone:
    @pytest.mark.parametrize(
        "secteur",
        ["pétrochimie", "Chimie", "raffinerie", "ACIER", "sidérurgie", "pétrole"],
    )
    def test_industrie_lourde_routes_to_M2(self, secteur):
        rec = ci.recommend_zone(secteur)
        assert rec is not None
        assert rec["zone"].startswith("M-2")
        assert "port de Sorel" in rec["atout"]

    @pytest.mark.parametrize(
        "secteur",
        ["logistique", "Transport", "entrepôt", "distribution"],
    )
    def test_logistique_routes_to_M1_a30(self, secteur):
        rec = ci.recommend_zone(secteur)
        assert rec is not None
        assert "M-1" in rec["zone"]
        assert "A-30" in rec["zone"] or "A-30" in rec["atout"]

    @pytest.mark.parametrize(
        "secteur",
        ["agroalimentaire", "alimentaire", "Agricole", "transformation"],
    )
    def test_agroalimentaire_routes_to_M1_agro(self, secteur):
        rec = ci.recommend_zone(secteur)
        assert rec is not None
        assert "agro-industrielle" in rec["zone"]
        assert (
            "Saint-Robert" in rec["secteur_geo"] or "Sainte-Anne" in rec["secteur_geo"]
        )

    def test_unknown_sector_returns_none(self):
        assert ci.recommend_zone("aérospatiale quantique") is None

    def test_empty_string_returns_none(self):
        assert ci.recommend_zone("") is None

    def test_keyword_matches_within_a_phrase(self):
        # Le matching est par sous-chaîne — un secteur décrit en phrase doit
        # toujours être routé correctement.
        rec = ci.recommend_zone("Je travaille dans la PÉTROCHIMIE depuis 20 ans")
        assert rec is not None
        assert rec["zone"].startswith("M-2")

    def test_returned_recommendation_has_all_fields(self):
        rec = ci.recommend_zone("logistique")
        assert set(rec.keys()) == {"zone", "secteur_geo", "prix", "atout"}
        for value in rec.values():
            assert isinstance(value, str) and value


# ---------------------------------------------------------------------------
# MENU_OPTIONS — table de routing du mode interactif
# ---------------------------------------------------------------------------


class TestMenuOptions:
    def test_keys_are_consecutive_digits_one_to_six(self):
        assert sorted(ci.MENU_OPTIONS.keys()) == ["1", "2", "3", "4", "5", "6"]

    def test_values_are_unique_handler_names(self):
        values = list(ci.MENU_OPTIONS.values())
        assert len(set(values)) == len(values)

    def test_each_handler_name_resolves_to_callable(self):
        # Convention : la clé "processus_achat" → fonction handle_processus_achat.
        for handler_name in ci.MENU_OPTIONS.values():
            fn_name = f"handle_{handler_name}"
            assert hasattr(ci, fn_name), f"Missing handler function {fn_name}"
            assert callable(getattr(ci, fn_name))


# ---------------------------------------------------------------------------
# Adaptateurs LLM — chemins d'erreur (clé API manquante / module absent)
# ---------------------------------------------------------------------------


class TestLlmAdapterErrorPaths:
    def test_openai_exits_when_api_key_missing(self, monkeypatch, capsys):
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        # Le test ne dépend pas de la présence du module openai : la première
        # branche atteinte est soit l'import (sortie 1), soit la vérification
        # de la clé (sortie 1). Les deux retournent SystemExit(1).
        with pytest.raises(SystemExit) as exc_info:
            ci.run_openai_agent({}, api_key=None)
        assert exc_info.value.code == 1
        captured = capsys.readouterr()
        assert "❌" in captured.out

    def test_anthropic_exits_when_api_key_missing(self, monkeypatch, capsys):
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        with pytest.raises(SystemExit) as exc_info:
            ci.run_anthropic_agent({}, api_key=None)
        assert exc_info.value.code == 1
        captured = capsys.readouterr()
        assert "❌" in captured.out


# ---------------------------------------------------------------------------
# Smoke — pas de régression au chargement du module
# ---------------------------------------------------------------------------


def test_system_prompt_template_well_formed():
    # Le template doit pouvoir être rendu avec un payload JSON arbitraire
    # sans lever de KeyError sur un placeholder oublié.
    rendered = ci.SYSTEM_PROMPT.format(territorial_data=json.dumps({"x": 1}))
    assert "{territorial_data}" not in rendered
    assert '"x": 1' in rendered
