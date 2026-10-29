# CMS NPPES NPI Registry API – Integration Guide

> **Target Audience:** Backend & Frontend Engineering Teams  
> **Service:** Centers for Medicare & Medicaid Services (CMS) / HHS NPPES NPI Registry  
> **API Version:** 2.1 (Active & Supported)  
> **Protocol:** REST / JSON  
> **Authentication:** None (Public, Free, No API Key Required)  

---

## 1. Executive Summary & Objective

In **MantraComply**, provider credentialing, primary source verification, and insurance enrollment require verifying that a practitioner or healthcare organization possesses an active, valid National Provider Identifier (NPI) recognized by CMS.

Integrating the **NPPES NPI Registry API** enables:
1. **Instant Identity Verification:** Validating 10-digit NPI numbers in real time.
2. **License & Specialty Validation:** Retrieving primary taxonomy descriptions (e.g., *Physical Therapist, Dietitian, Therapy*) and state board license numbers.
3. **Practice Address Normalization:** Cross-referencing physical location vs. mailing addresses.
4. **Auto-Fill Onboarding:** Pre-populating legal provider names, credentials (*MD, OTR, DO, NP*), and enumeration status.

---

## 2. API Endpoints & Request Format

### Base Endpoint
```http
GET https://npiregistry.cms.hhs.gov/api/?version=2.1
```

> **IMPORTANT:** The `version=2.1` query parameter is **mandatory**. Requests omitting `version=2.1` or referencing older versions (1.0/2.0) will fail.

---

## 3. Critical Architecture Note: CORS Policy

> [!WARNING]
> **CMS does not send `Access-Control-Allow-Origin` headers.**  
> Direct `fetch()` requests from client-side browser code (e.g. from `http://localhost:3000` or production web apps) will be **blocked by browser CORS policy**.

### Recommended Architecture:
* **Production:** Call the CMS API from a backend service (Node.js, Python, Go) or server-side API route (`/api/v1/npi/lookup`).
* **Local Development (Vite):** Route through the Vite reverse proxy already configured in `vite.config.ts`:
  ```ts
  // vite.config.ts
  proxy: {
    '/npi-api': {
      target: 'https://npiregistry.cms.hhs.gov',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/npi-api/, '/api'),
    }
  }
  ```

---

## 4. Query Parameters Reference

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `version` | string | **Yes** | API version. Must be `2.1`. | `version=2.1` |
| `number` | string (10 digits) | No* | Specific 10-digit NPI. If provided, other filters are optional. | `number=1114658044` |
| `enumeration_type` | enum | No | `NPI-1` (Individual) or `NPI-2` (Organization/Facility). | `enumeration_type=NPI-1` |
| `first_name` | string | No | Provider's first name (supports wildcard `*` after 2 chars). | `first_name=John` |
| `last_name` | string | No | Provider's last name (supports wildcard `*` after 2 chars). | `last_name=Zavalydriga` |
| `organization_name`| string | No | Group or facility name (Type 2). | `organization_name=Mayo+Clinic` |
| `taxonomy_description`| string | No | Specialty / taxonomy search (supports wildcard `*`). | `taxonomy_description=Physical*` |
| `state` | string (2 chars) | No** | 2-letter US state code. | `state=TX` |
| `city` | string | No | City name. | `city=Dallas` |
| `postal_code` | string | No | 5 or 9-digit zip code. | `postal_code=75204` |
| `limit` | integer | No | Max records to return (Default: 10, Max: 200). | `limit=1` |
| `skip` | integer | No | Records to skip for pagination (Max: 1000). | `skip=10` |
| `pretty` | string | No | Set to `on` for indented human-readable JSON. | `pretty=on` |

*\* Note: If searching without an exact `number`, CMS requires secondary criteria (e.g. `first_name` + `state`).*

---

## 5. Verified Live Payload Example

### Query:
```http
GET https://npiregistry.cms.hhs.gov/api/?version=2.1&number=1114658044&pretty=on
```

### Response (HTTP 200):
```json
{
  "result_count": 1,
  "results": [
    {
      "enumeration_type": "NPI-1",
      "number": "1114658044",
      "basic": {
        "first_name": "JOHN",
        "last_name": "ZAVALYDRIGA",
        "credential": "",
        "sex": "M",
        "status": "A",
        "sole_proprietor": "NO",
        "enumeration_date": "2022-06-21",
        "certification_date": "2024-06-19",
        "last_updated": "2024-06-19"
      },
      "taxonomies": [
        {
          "code": "225100000X",
          "desc": "Physical Therapist",
          "primary": true,
          "state": null,
          "license": null,
          "taxonomy_group": ""
        }
      ],
      "addresses": [
        {
          "address_purpose": "LOCATION",
          "address_type": "DOM",
          "address_1": "2707 N FITZHUGH AVE",
          "city": "DALLAS",
          "state": "TX",
          "postal_code": "752043247",
          "country_code": "US",
          "country_name": "United States",
          "telephone_number": "866-370-8206"
        },
        {
          "address_purpose": "MAILING",
          "address_type": "DOM",
          "address_1": "790 REMINGTON BLVD",
          "city": "BOLINGBROOK",
          "state": "IL",
          "postal_code": "604404909",
          "country_code": "US",
          "country_name": "United States"
        }
      ],
      "practiceLocations": [],
      "endpoints": [],
      "other_names": [],
      "identifiers": []
    }
  ]
}
```

---

## 6. Key Data Mapping for MantraComply

| MantraComply Field | NPPES JSON Path | Parsing / Fallback Logic |
|---|---|---|
| **Full Legal Name** | `results[0].basic.first_name` + `last_name` | Title case conversion recommended (`John Zavalydriga`). |
| **Active Verification** | `results[0].basic.status` | `A` = Active / Good Standing. `D` = Deactivated. |
| **Provider vs. Group** | `results[0].enumeration_type` | `NPI-1` -> Individual Provider<br>`NPI-2` -> Facility / Group Profile |
| **Primary Specialty** | `results[0].taxonomies.find(t => t.primary).desc` | Fallback to `taxonomies[0].desc` |
| **Taxonomy Code** | `results[0].taxonomies.find(t => t.primary).code` | Critical for insurance payer EDI 837 / 855I enrollment. |
| **State License #** | `results[0].taxonomies[n].license` | May be `null` in CMS if not reported; cross-check with state board. |
| **Practice Location** | `results[0].addresses.find(a => a.address_purpose === "LOCATION")` | Physical clinic address and telephone. |
| **Mailing Address** | `results[0].addresses.find(a => a.address_purpose === "MAILING")` | Administrative billing address. |

---

## 7. Implementation Examples

### A. TypeScript / Node.js Service (`npiService.ts`)

```typescript
export interface NpiLookupResult {
  npi: string;
  name: string;
  enumerationType: 'NPI-1' | 'NPI-2';
  isActive: boolean;
  specialty: string;
  taxonomyCode: string;
  licenseNumber?: string | null;
  practiceAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
  };
}

export async function lookupNpi(npiNumber: string): Promise<NpiLookupResult | null> {
  const cleanNpi = npiNumber.trim();
  if (!/^\d{10}$/.test(cleanNpi)) {
    throw new Error('NPI must be exactly 10 numeric digits.');
  }

  // Use relative proxy path if in frontend Vite, or full CMS URL in backend
  const baseUrl = typeof window !== 'undefined' ? '/npi-api' : 'https://npiregistry.cms.hhs.gov/api';
  const url = `${baseUrl}/?version=2.1&number=${cleanNpi}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    // 5-second timeout recommended for CMS registry
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`CMS API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return null; // NPI does not exist in registry
  }

  const record = data.results[0];
  const primaryTaxonomy = record.taxonomies?.find((t: any) => t.primary) || record.taxonomies?.[0];
  const locationAddr = record.addresses?.find((a: any) => a.address_purpose === 'LOCATION');

  const fullName = record.enumeration_type === 'NPI-1'
    ? `${record.basic.first_name} ${record.basic.last_name}`
    : record.basic.organization_name;

  return {
    npi: record.number,
    name: fullName,
    enumerationType: record.enumeration_type,
    isActive: record.basic.status === 'A',
    specialty: primaryTaxonomy?.desc || 'Unknown',
    taxonomyCode: primaryTaxonomy?.code || '',
    licenseNumber: primaryTaxonomy?.license || null,
    practiceAddress: locationAddr ? {
      street: locationAddr.address_1,
      city: locationAddr.city,
      state: locationAddr.state,
      zip: locationAddr.postal_code,
      phone: locationAddr.telephone_number
    } : undefined
  };
}
```

---

### B. Python / FastAPI Backend Proxy (`npi_router.py`)

```python
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/v1/npi", tags=["NPI Verification"])

CMS_NPI_ENDPOINT = "https://npiregistry.cms.hhs.gov/api/"

@router.get("/lookup/{npi_number}")
async def verify_npi(npi_number: str):
    if len(npi_number) != 10 or not npi_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid NPI: must be 10 digits")
        
    params = {
        "version": "2.1",
        "number": npi_number,
        "pretty": "on"
    }
    
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            response = await client.get(CMS_NPI_ENDPOINT, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Failed to reach CMS Registry: {str(exc)}")
            
    if data.get("result_count", 0) == 0:
        raise HTTPException(status_code=404, detail="NPI not found in NPPES registry")
        
    return data["results"][0]
```

---

## 8. Error Handling & Edge Cases

1. **Non-Existent NPI:**
   * Returns HTTP `200 OK` with `"result_count": 0`. Do **not** expect an HTTP 404 from CMS. Check `data.result_count === 0`.
2. **Deactivated NPIs:**
   * Status will reflect `"D"` instead of `"A"`. These providers are **not eligible** for credentialing or enrollment.
3. **Empty License Numbers:**
   * Many individual providers do not report their state license numbers to NPPES (they report to state licensing boards directly). A `null` license in NPPES does not necessarily mean unverified, but requires document cross-check.
4. **Caching Recommendation:**
   * NPI registry data changes infrequently. It is strongly recommended to cache NPI responses in Redis / DB for **24 hours** to optimize performance and prevent rate limiting.
5. **Timeouts:**
   * CMS servers occasionally experience latency spikes during peak US business hours. Always configure a **5–8 second timeout** with graceful fallback.

