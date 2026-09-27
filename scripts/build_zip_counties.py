#!/usr/bin/env python3
"""Generate the Bay Area ZIP-to-county lookup from Census 2020 ZCTA data."""

import csv
import json
from pathlib import Path
from urllib.request import urlopen


SOURCE = "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt"
COUNTIES = {
    "06001": "Alameda",
    "06013": "Contra Costa",
    "06041": "Marin",
    "06055": "Napa",
    "06075": "San Francisco",
    "06081": "San Mateo",
    "06085": "Santa Clara",
    "06095": "Solano",
    "06097": "Sonoma",
}


def main():
    with urlopen(SOURCE) as response:
        text = response.read().decode("utf-8-sig")

    relationships = {}
    for row in csv.DictReader(text.splitlines(), delimiter="|"):
        zip_code = row["GEOID_ZCTA5_20"]
        county = COUNTIES.get(row["GEOID_COUNTY_20"])
        land_area = int(row["AREALAND_PART"] or 0)
        if zip_code and county and land_area > 0:
            relationships.setdefault(zip_code, set()).add(county)

    output = {zip_code: sorted(counties) for zip_code, counties in sorted(relationships.items())}
    destination = Path("data/zip-counties.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(output)} ZIP/ZCTA entries to {destination}")


if __name__ == "__main__":
    main()
