# Datamodel: tmdl

Bron: tmdl · 2 tabellen · 6 kolommen · 2 measures · 2 relaties

## Tabel: Dim Medewerker

| Kolom | Datatype | |
|---|---|---|
| MedewerkerID | int64 | verborgen |
| Naam | string |  |
| Afdeling | string |  |

## Tabel: Feit_Verzuim

| Kolom | Datatype | |
|---|---|---|
| MedewerkerID | int64 | verborgen |
| Datum | dateTime |  |
| Uren | decimal |  |

### Measures

**[Verzuimuren]** (map: Basis, format: #,0)

```dax
SUM(Feit_Verzuim[Uren])
```

**[Verzuim %]** (map: KPI, format: 0.0%)

```dax
DIVIDE(
    [Verzuimuren],
    [Contracturen]
)
```

## Relaties

- 'Feit_Verzuim'[MedewerkerID] *→1 'Dim Medewerker'[MedewerkerID]
- 'Feit_Verzuim'[Datum] *↔1 'Dim_Datum'[Datum] **(INACTIEF)** (bidirectioneel)
