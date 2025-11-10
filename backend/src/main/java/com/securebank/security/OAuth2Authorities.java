package com.securebank.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

public class OAuth2Authorities {
    public static Collection<GrantedAuthority> from(Jwt jwt) {
        List<String> scopes = new ArrayList<>();
        Object scp = jwt.getClaims().get("scope");
        if (scp == null) scp = jwt.getClaims().get("scp");
        if (scp instanceof String) {
            scopes.addAll(Arrays.asList(((String) scp).split(" ")));
        } else if (scp instanceof Collection) {
            @SuppressWarnings("unchecked")
            Collection<Object> c = (Collection<Object>) scp;
            for (Object o : c) scopes.add(String.valueOf(o));
        }
        return scopes.stream()
                .map(s -> new SimpleGrantedAuthority("SCOPE_" + s))
                .collect(Collectors.toSet());
    }
}
