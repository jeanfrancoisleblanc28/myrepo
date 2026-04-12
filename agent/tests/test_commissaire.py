"""
Tests unitaires — Agent Commissaire Industriel MRC Pierre-De Saurel
Couvre : chargement des donnees, logique metier, fonctions utilitaires.
Lancer avec : pytest agent/tests/ -v
"""

import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent))

import commissaire_industriel as ci


def get_data():
    """Charge les donnees reelles depuis le JSON."""
    return ci.load_data()


class TestLoadData:
    def test_load_data_returns_dict(self):
        data = get_data()
        assert isinstance(data, dict)

    def test_mrc_name_is_correct(self):
        data = get_data()
        assert data["mrc"] == "Pierre-De Saurel"

    def test_municipalites_present(self):
        data = get_data()
        assert "municipalites" in data
        assert len(data["municipalites"]) > 0

    def test_sorel_tracy_exists(self):
        data = get_data()
        noms = [m["nom"] for m in data["municipalites"]]
        assert "Sorel-Tracy" in noms

    def test_zones_have_required_fields(self):
        data = get_data()
        for municipalite in data["municipalites"]:
            for zone in municipalite.get("zones", []):
                assert "code" in zone
                assert "superficie_disponible_ha" in zone
                assert "prix_moyen_pied_carre" in zone

    def test_prix_are_positive(self):
        data = get_data()
        for municipalite in data["municipalites"]:
            for zone in municipalite.get("zones", []):
                assert zone["prix_moyen_pied_carre"] > 0

    def test_superficies_are_positive(self):
        data = get_data()
        for municipalite in data["municipalites"]:
            for zone in municipalite.get("zones", []):
                assert zone["superficie_disponible_ha"] > 0

    def test_programmes_aide_present(self):
        data = get_data()
        assert "programmes_aide" in data
        assert len(data["programmes_aide"]) > 0

    def test_contacts_cles_present(self):
        data = get_data()
        assert "contacts_cles" in data
        assert len(data["contacts_cles"]) > 0

    def test_processus_achat_present(self):
        data = get_data()
        assert "processus_achat" in data

    def test_processus_vente_present(self):
        data = get_data()
        assert "processus_vente" in data


class TestZonesIndustrielles:
    def test_sorel_tracy_has_m1_and_m2(self):
        data = get_data()
        sorel = next(m for m in data["municipalites"] if m["nom"] == "Sorel-Tracy")
        codes = [z["code"] for z in sorel["zones"]]
        assert "M-1" in codes
        assert "M-2" in codes

    def test_sorel_tracy_m2_prix_inferieur_m1(self):
        data = get_data()
        sorel = next(m for m in data["municipalites"] if m["nom"] == "Sorel-Tracy")
        zones = {z["code"]: z for z in sorel["zones"]}
        assert zones["M-2"]["prix_moyen_pied_carre"] < zones["M-1"]["prix_moyen_pied_carre"]

    def test_all_zones_have_infrastructures(self):
        data = get_data()
        for municipalite in data["municipalites"]:
            for zone in municipalite.get("zones", []):
                assert "infrastructures" in zone
                assert len(zone["infrastructures"]) > 0

    def test_total_superficie_positive(self):
        data = get_data()
        total = sum(
            zone["superficie_disponible_ha"]
            for m in data["municipalites"]
            for zone in m.get("zones", [])
        )
        assert total > 0


class TestProgrammesAide:
    def test_each_programme_has_nom(self):
        data = get_data()
        for prog_id, prog in data["programmes_aide"].items():
            assert "nom" in prog

    def test_each_programme_has_description(self):
        data = get_data()
        for prog_id, prog in data["programmes_aide"].items():
            assert "description" in prog


class TestMenuOptions:
    def test_menu_options_have_six_entries(self):
        assert len(ci.MENU_OPTIONS) == 6

    def test_menu_options_keys_are_strings_1_to_6(self):
        expected_keys = {"1", "2", "3", "4", "5", "6"}
        assert set(ci.MENU_OPTIONS.keys()) == expected_keys

    def test_all_handlers_referenced_in_menu(self):
        expected_handlers = {
            "processus_achat", "processus_vente", "zones_disponibles",
            "programmes_aide", "contacts", "analyse_projet"
        }
        assert set(ci.MENU_OPTIONS.values()) == expected_handlers


class TestSystemPrompt:
    def test_build_system_prompt_returns_string(self):
        data = get_data()
        prompt = ci.build_system_prompt(data)
        assert isinstance(prompt, str)

    def test_build_system_prompt_contains_mrc_data(self):
        data = get_data()
        prompt = ci.build_system_prompt(data)
        assert "Pierre-De Saurel" in prompt

    def test_build_system_prompt_not_empty(self):
        data = get_data()
        prompt = ci.build_system_prompt(data)
        assert len(prompt) > 100


class TestPrintWrapped:
    def test_print_wrapped_runs_without_error(self, capsys):
        ci.print_wrapped("Texte de test pour verifier l'indentation", indent="  ")
        captured = capsys.readouterr()
        assert "Texte de test" in captured.out

    def test_print_wrapped_applies_indent(self, capsys):
        ci.print_wrapped("Test indent", indent=">>> ")
        captured = capsys.readouterr()
        assert ">>> " in captured.out


class TestHandleOutputs:
    def test_handle_zones_prints_output(self, capsys):
        data = get_data()
        ci.handle_zones_disponibles(data)
        captured = capsys.readouterr()
        assert len(captured.out) > 0

    def test_handle_contacts_prints_output(self, capsys):
        data = get_data()
        ci.handle_contacts(data)
        captured = capsys.readouterr()
        assert len(captured.out) > 0

    def test_handle_programmes_prints_output(self, capsys):
        data = get_data()
        ci.handle_programmes_aide(data)
        captured = capsys.readouterr()
        assert len(captured.out) > 0
