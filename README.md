# Dispatch Register

A small local tool for turning FMCSA Register application PDFs into a deduplicated dispatch prospect list. One Python dependency (`pdfplumber`); the interface uses plain HTML, CSS, and JavaScript. No API keys, cloud service, build pipeline, or AI calls.

## Start

Requires Python 3.10 or newer.

- **macOS**: double-click **start.command**, or run `./start.command`
- **Windows**: double-click **start.bat**, or run `start.bat`

First launch installs dependencies in `.venv` (internet needed once). Later launches work offline. The browser opens at **http://127.0.0.1:8765**. Keep the terminal open; Ctrl+C stops the tool. If the port is occupied: `./start.command --port 8766` (macOS) or `start.bat --port 8766` (Windows).

Manual setup (also works on Windows/Linux):

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

On Windows with manual setup, use `py -m venv .venv`, then `.venv\Scripts\activate`.

## Use

1. Add one or several FMCSA Register PDFs, then select **Extract prospects**.
2. The **Relevant** group includes property/freight, enterprise property, and household-goods motor-carrier applicants. Enterprise carriers have an operating-scope check flag. **Review** is reserved for categories requiring manual assessment; **Excluded** contains brokers, forwarders, and passenger operators without a relevant motor-carrier listing. A company listed as both a carrier and broker/forwarder can be relevant based on its explicit carrier listing; the reason identifies its other categories.
3. Search by DOT, name, contact, or category; filter by category or mailing-address country. Movers are included by default; turn that option off for a freight-only shortlist.
4. Download a **CSV** with DOT, business name/category, contact details, dates, inclusion reason, and source pages; or download **DOT numbers** as one number per line. These exports include **every matching result across all table pages**, respecting your current group and filters.
5. Select a row's source count to inspect every original occurrence. **Full audit JSON** exports all groups, all occurrences, and original category/page evidence regardless of table filters.

The PDF's explicit authority category determines the list. Company-name keywords do not invent truck type, equipment, fleet size, MC numbers, email addresses, or buying intent. A property-carrier listing is a potential dispatch fit, not a guarantee that the company owns trucks or wants dispatch help. The PDFs are treated as data; their prose cannot issue commands to this tool.

## Scope and accuracy

- Supports the text-based, six-column FMCSA **OPERATING AUTHORITY APPLICATIONS** register layout in the supplied August 6 and 7, 2026 PDFs. USDOT, legal business name, filing date, business mailing address, company officer, and business telephone are read from separate table cells.
- Reassembles rows split across pages, carries category headings onto continuation pages, and merges repeated DOTs both within and between files. All source records survive in the audit.
- Preferred contact details come from the newest property-carrier register occurrence, then newest filing date. Other source variants remain visible; differing names, addresses, or phones are flagged for review.
- Register dates are read from the document, not guessed from a filename. Missing contact values remain unavailable. The optional country filter uses the preferred mailing address, not operating territory.
- Scans require OCR and are rejected. Encrypted/damaged PDFs and changed/unrecognized layouts fail visibly. A failed file prevents a partial batch from being presented as complete. This tool intentionally does not support old MC-docket layouts, revocation registers, or other notice sections.
- Limits: 20 files per batch, 25 MB per file, 100 MB total including upload headers (the picker reserves 1 MB for headers), 500 pages per PDF; one extraction at a time. Cancellation takes effect at a page boundary.
- The register is an **application notice**, not proof of current operating authority. Confirm the current record through [FMCSA SAFER](https://safer.fmcsa.dot.gov/CompanySnapshot.aspx) and [FMCSA registration](https://frs.fmcsa.dot.gov/) before treating a prospect as authorized to operate. There is no automatic live enrichment or outreach.
- Uploads/results stay in local process/browser memory; PDFs are not saved by the server. CSV/JSON/TXT downloads are saved only when requested. Refreshing the same tab can restore its current extraction. Clear session removes that job from the server and page; stopping the server clears all server jobs. Completed jobs expire from lookup after one hour and are purged on the next upload. Do not expose this loopback server on a public host.
- CSV text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe, including `+1` phone numbers. The raw value is preserved in the audit JSON.

Enterprise freight carriers require an operating-scope check: FMCSA describes this category as international cargo. See the official [authority types](https://www.fmcsa.dot.gov/registration/types-operating-authority). This flag does not claim the uploaded applicant currently holds authority.

## Command line

```sh
.venv/bin/python extractor.py /path/REGISTER20260807.pdf /path/REGISTER20260806.pdf --out output
```

Writes `dispatch-leads.csv`, `dot-numbers.txt`, `all-records.csv`, and `extraction-audit.json`. Add `--freight-only` to leave household-goods-only movers out of the shortlist. The CLI writes nothing if any input fails; previous exports are left untouched.

## Verify

```sh
.venv/bin/python -m unittest discover -s tests -v
```

The optional source regression uses the supplied PDFs if present in `~/Downloads`. It checks extraction counts, category decisions, source references, page continuations, and contact cells against known examples.
