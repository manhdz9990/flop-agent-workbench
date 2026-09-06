# Fixture provenance

Fixtures must be independent of the implementation under test and must record enough provenance to reproduce or audit their origin.

Each fixture set must document:

- source or generating tool and version;
- creation or retrieval date;
- applicable official protocol reference;
- transformations made after generation;
- expected use and result;
- licensing or redistribution constraints, when applicable.

Implementation-generated output must not be used as the sole expected result for the same implementation. Secrets, private keys, seeds, passwords, wallet material, and signing tokens must never be committed as fixtures.

`protocol/` is reserved for independently produced protocol evidence. `security/` is reserved for inert hostile-input and boundary fixtures. Their contents will be added only in the phase that implements the corresponding behavior.
