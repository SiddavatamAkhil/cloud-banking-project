package com.securebank.service;

/**
 * Legacy placeholder from the previous OIDC-based implementation.
 * <p>
 * Local authentication no longer uses this service; it exists only to ensure
 * backward compatibility for any components still referencing the type.
 * Instantiating it will immediately fail.
 */
@Deprecated(forRemoval = true)
public class OidcTokenExchangeService {

    public OidcTokenExchangeService() {
        throw new UnsupportedOperationException("OIDC token exchange has been removed");
    }
}
