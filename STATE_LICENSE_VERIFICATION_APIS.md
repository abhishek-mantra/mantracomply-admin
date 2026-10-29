# State Medical & Healthcare Practitioner License Verification: Free APIs & Datasets Guide

This document details how to verify state licenses for healthcare providers, answers the specific Texas PT license query, and lists free programmatic REST APIs and open datasets provided by state and federal governments.

---

## 1. Texas Physical Therapy License Verification

### License Details Provided
- **Profession:** PT - Physical Therapist
- **License Number:** `1362814`
- **Jurisdiction:** Texas
- **Expiration Date:** `2028-09-30`

### Expiration Status: **ACTIVE / NOT EXPIRED**
- **Analysis:** In Texas, Physical Therapy licenses operate on a **biennial (2-year) renewal cycle** expiring on the last day of the licensee's birth month. 
- With an expiration date of **September 30, 2028**, this license is currently valid and active, with approximately 2 years remaining on its current valid term.

### Primary Source Verification Procedures
In Texas, physical therapists are **not** regulated by TDLR; they are governed by the **Texas Board of Physical Therapy Examiners** under the **Executive Council of Physical Therapy & Occupational Therapy Examiners (ECPTOTE)**.

1. **Official Primary Source Lookup (Texas Health Professions Council Datamart):**
   - **URL:** [https://vo.licensing.hpc.texas.gov/datamart/selSearchType.do](https://vo.licensing.hpc.texas.gov/datamart/selSearchType.do)
   - Click **Search by License Number** (`searchByLicNumber.do`)
   - Select Board: `Executive Council of Physical Therapy and Occupational Therapy Examiners` (Board Code `533`)
   - License Type: `ECPTOTE - Physical Therapist`
   - License Number: `1362814`
2. **ECPTOTE Portal:**
   - [https://ptot.texas.gov/look-up-a-license/](https://ptot.texas.gov/look-up-a-license/)
3. **Compact Privilege Check (For out-of-state PTs practicing in Texas):**
   - [https://purchase.ptcompact.org/Verify](https://purchase.ptcompact.org/Verify)
4. **Phone / Direct Primary Verification:**
   - ECPTOTE Board Office: `(512) 305-6900` | Email: `info@ptot.texas.gov`

---

## 2. Free Programmatic State License APIs & Open Datasets

Because healthcare and occupational licensing is constitutionally managed at the state level, **no single federal API returns all 50 states' license details**. However, numerous states provide completely free, public **SODA (Socrata Open Data) REST APIs** that allow real-time JSON filtering without API keys.

---

### Tier 1: True Programmatic Free REST APIs (Instant JSON)

#### 1. Washington State (Department of Health)
- **Dataset:** Health Care Provider Credential Data (DOH)
- **Endpoint:** `https://data.wa.gov/resource/qxh8-f4bd.json`
- **Method:** `GET` (No auth required)
- **Sample Query by License Number:**
  ```http
  GET https://data.wa.gov/resource/qxh8-f4bd.json?credentialnumber=PT60123456
  ```
- **Sample Query by Name:**
  ```http
  GET https://data.wa.gov/resource/qxh8-f4bd.json?lastname=SMITH&firstname=JOHN
  ```
- **Fields Returned:** `credentialnumber`, `credentialtype`, `firstname`, `lastname`, `status` (Active/Expired), `firstissuedate`, `lastissuedate`, `expirationdate`.

---

#### 2. Colorado (Department of Regulatory Agencies - DORA)
- **Dataset:** Professional and Occupational Licenses in Colorado (DORA)
- **Endpoint:** `https://data.colorado.gov/resource/7s5z-vewr.json`
- **Method:** `GET` (No auth required)
- **Sample Query by License Number:**
  ```http
  GET https://data.colorado.gov/resource/7s5z-vewr.json?licensenumber=711991
  ```
- **Sample Query by Name:**
  ```http
  GET https://data.colorado.gov/resource/7s5z-vewr.json?lastname=DOE&$limit=5
  ```
- **Fields Returned:** `firstname`, `lastname`, `licensenumber`, `licensetype`, `licensestatusdescription` (`Active`, `Expired`, `Revoked`), `licenseexpirationdate`, `licensefirstissuedate`, `linktoverifylicense`.

---

#### 3. Connecticut (Department of Public Health & e-Licensing)
- **Dataset:** State Licenses and Credentials
- **Endpoint:** `https://data.ct.gov/resource/ngch-56tr.json`
- **Method:** `GET` (No auth required)
- **Sample Query by Credential Number:**
  ```http
  GET https://data.ct.gov/resource/ngch-56tr.json?credentialnumber=13734
  ```
- **Sample Query by Practitioner Name:**
  ```http
  GET https://data.ct.gov/resource/ngch-56tr.json?name=WILSON%20SAMANTHA
  ```
- **Fields Returned:** `name`, `credential` (e.g. Physical Therapist, Physician, RN), `credentialnumber`, `status` (`ACTIVE`, `EXPIRED`), `effectivedate`, `expirationdate`, `active` (`1` or `0`).

---

#### 4. Texas (Texas Department of Licensing and Regulation - TDLR)
- **Dataset:** TDLR - All Licenses
- **Endpoint:** `https://data.texas.gov/resource/7358-krk7.json`
- **Method:** `GET` (No auth required)
- **Sample Query by License Number:**
  ```http
  GET https://data.texas.gov/resource/7358-krk7.json?license_number=12345
  ```
- **Professions Covered:** 30+ health & allied professions (Podiatry, Athletic Trainers, Dietitians, Massage Therapy, Midwives, Behavioral Analysts). *Note: Medical doctors and PTs are on separate HPC/TMB portals.*
- **Fields Returned:** `license_number`, `license_type`, `owner_name`, `business_name`, `license_expiration_date_mmddccyy`.

---

#### 5. New York State (Department of Health)
- **Dataset:** Professional Medical Conduct Board Actions (Disciplinary & Revocations)
- **Endpoint:** `https://health.data.ny.gov/resource/ebmi-8ctw.json`
- **Method:** `GET` (No auth required)
- **Sample Query by License Number:**
  ```http
  GET https://health.data.ny.gov/resource/ebmi-8ctw.json?physician_license_number=123456
  ```
- **NY State Education Department (NYSED - All Professions Verification):**
  - Web Verification: [https://www.op.nysed.gov/verification-search](https://www.op.nysed.gov/verification-search)

---

### Tier 2: Major States with Official Public Lookup Portals

For states without an open SODA REST endpoint, primary source verification is performed via direct state registry portals:

| State | Licensing Board / Portal | Portal URL | Covered Professions |
|---|---|---|---|
| **California** | Department of Consumer Affairs (BreEZe) | [https://search.dca.ca.gov/](https://search.dca.ca.gov/) | Medical Board, PT Board, Dental, Nursing, Pharmacy |
| **Florida** | Department of Health (MQA Search) | [https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthcareProviders](https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthcareProviders) | All MDs, DOs, PTs, RNs, Allied Health |
| **Texas** | Health Professions Council (HPC) | [https://vo.licensing.hpc.texas.gov/datamart/](https://vo.licensing.hpc.texas.gov/datamart/) | PT/OT (ECPTOTE), Dental, Pharmacy, Optometry |
| **Texas** | Texas Medical Board (TMB) | [https://profile.tmb.state.tx.us/](https://profile.tmb.state.tx.us/) | Physicians (MD/DO), Physician Assistants, Acupuncturists |
| **Illinois** | IDFPR License Lookup | [https://ilesonline.idfpr.illinois.gov/DFPR/Lookup/LicenseLookup.aspx](https://ilesonline.idfpr.illinois.gov/DFPR/Lookup/LicenseLookup.aspx) | All Illinois professional licenses |
| **Virginia** | Department of Health Professions (DHP) | [https://dhp.virginiainteractive.org/Lookup/Index](https://dhp.virginiainteractive.org/Lookup/Index) | MDs, Physical Therapy, Nursing, Behavioral Sciences |
| **Ohio** | Ohio eLicense Verification | [https://elicense.ohio.gov/oh_verifylicense](https://elicense.ohio.gov/oh_verifylicense) | All Ohio Medical, Nursing & Therapy boards |

---

### Tier 3: National & Multi-State Credentialing Systems

1. **CMS NPPES Registry API (Federal):**
   - `https://npiregistry.cms.hhs.gov/api/?version=2.1&number={NPI}`
   - Verifies active status, provider identity, taxonomy classification, and primary practice address nationwide.
2. **HHS OIG LEIE (List of Excluded Individuals/Entities):**
   - [https://oig.hhs.gov/exclusions/exclusions_list.asp](https://oig.hhs.gov/exclusions/exclusions_list.asp)
   - Monthly downloadable database of all debarred or excluded healthcare providers.
3. **PT Compact Commission:**
   - [https://purchase.ptcompact.org/Verify](https://purchase.ptcompact.org/Verify)
   - Direct verification of interstate physical therapy compact practice privileges across 35+ member states.
4. **Nursys (National Council of State Boards of Nursing):**
   - [https://www.nursys.com/](https://www.nursys.com/)
   - Multi-state automated license verification and e-Notify monitoring for RNs, LPNs, and APRNs.

